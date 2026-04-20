import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVisitStatusEmail({
  buyerEmail,
  buyerName,
  propertyAddress,
  visitDate,
  visitTime,
  status,
}) {
  if (!process.env.RESEND_API_KEY) return; // skip if not set up yet

  const isConfirmed = status === "confirmed";
  const isCancelled = status === "cancelled";
  if (!isConfirmed && !isCancelled) return;

  const subject = isConfirmed
    ? `✅ Your visit to ${propertyAddress} is confirmed`
    : `❌ Your visit request was declined`;

  const formattedDate = visitDate
    ? new Date(visitDate).toLocaleDateString("en-IN", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
    : "";

  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
      <div style="margin-bottom:20px;">
        <span style="font-size:20px;font-weight:700;color:#7c3aed;">NestIQ</span>
        <span style="font-size:13px;color:#6b7280;margin-left:8px;">Find smarter, live better</span>
      </div>

      <h2 style="font-size:18px;font-weight:600;margin-bottom:12px;">
        ${isConfirmed ? "Your visit has been confirmed 🎉" : "Visit request declined"}
      </h2>

      <p style="color:#374151;margin-bottom:16px;">Hi ${buyerName},</p>

      ${isConfirmed ? `
        <p style="color:#374151;margin-bottom:16px;">
          Great news! The owner has confirmed your site visit. Here are the details:
        </p>
        <div style="background:#f5f3ff;border-left:3px solid #7c3aed;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-weight:600;color:#1f2937;">📍 ${propertyAddress}</p>
          <p style="margin:0 0 4px;color:#374151;">📅 ${formattedDate}</p>
          ${visitTime ? `<p style="margin:0;color:#374151;">🕐 ${visitTime}</p>` : ""}
        </div>
        <p style="color:#374151;">Please be punctual. The owner will be there to show you around.</p>
      ` : `
        <p style="color:#374151;margin-bottom:16px;">
          Unfortunately, the owner was unable to accommodate your visit request for
          <strong>${propertyAddress}</strong> at this time.
        </p>
        <p style="color:#374151;">
          You can message the owner directly on NestIQ to suggest an alternate time.
        </p>
      `}

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:12px;color:#9ca3af;">
        This is an automated message from NestIQ. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "NestIQ <onboarding@resend.dev>",   // replace with noreply@nestiq.in once domain verified
      to: buyerEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Resend] Failed to send visit email:", err.message);
  }
}

export async function sendVerificationEmail(email, name, token) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping verification email to:", email);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: "NestIQ <onboarding@resend.dev>", 
      to: email,
      subject: "Action Required: Verify your NestIQ account",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
          <div style="margin-bottom:20px;">
            <span style="font-size:20px;font-weight:700;color:#7c3aed;">NestIQ</span>
            <span style="font-size:13px;color:#6b7280;margin-left:8px;">Find smarter, live better</span>
          </div>

          <h2 style="font-size:18px;font-weight:600;margin-bottom:12px;">
            Welcome to NestIQ, ${name}!
          </h2>

          <p style="color:#374151;margin-bottom:16px;">
            You're almost there. Please verify your email address to activate your account and start exploring the best real estate options.
          </p>

          <a href="${verificationUrl}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px;">
            Verify Email Address
          </a>

          <p style="color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;padding-top:16px;">
            If the button doesn't work, copy and paste this link into your browser: <br/>
            <span style="word-break:break-all;color:#4f46e5;">${verificationUrl}</span>
          </p>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}

export async function sendWelcomeEmail(email, name) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing. Skipping welcome email to:", email);
    return;
  }

  try {
    await resend.emails.send({
      from: "NestIQ <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to NestIQ! 🎉",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
          <div style="margin-bottom:20px;">
            <span style="font-size:20px;font-weight:700;color:#7c3aed;">NestIQ</span>
            <span style="font-size:13px;color:#6b7280;margin-left:8px;">Find smarter, live better</span>
          </div>

          <h2 style="font-size:18px;font-weight:600;margin-bottom:12px;">
            Your account is ready!
          </h2>

          <p style="color:#374151;margin-bottom:16px;">Hi ${name},</p>

          <p style="color:#374151;margin-bottom:16px;">
            Thanks for verifying your email. Your NestIQ account is now fully active. We're thrilled to have you onboard!
          </p>

          <p style="color:#374151;margin-bottom:24px;">
            Whether you're looking for your next dream home, managing properties, or exploring the real estate market, NestIQ is here to make your journey seamless.
          </p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display:inline-block;background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;margin-bottom:24px;">
            Go to your Dashboard
          </a>

          <p style="color:#6b7280;font-size:14px;border-top:1px solid #e5e7eb;padding-top:16px;">
            Need help? Reply to this email or visit our Help Center.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}