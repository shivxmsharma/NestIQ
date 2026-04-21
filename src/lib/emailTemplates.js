import nodemailer from "nodemailer";

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVisitStatusEmail({
  buyerEmail,
  buyerName,
  propertyAddress,
  visitDate,
  visitTime,
  status,
}) {
  if (!process.env.SMTP_USER) {
    console.warn("SMTP_USER is missing. Skipping visit status email to:", buyerEmail);
    return;
  }

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
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NestIQ" <noreply@nestiq.in>',
      to: buyerEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Nodemailer] Failed to send visit email:", err.message);
  }
}

export async function sendVerificationEmail(email, name, token) {
  if (!process.env.SMTP_USER) {
    console.warn("SMTP_USER is missing. Skipping verification email to:", email);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NestIQ" <noreply@nestiq.in>',
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
    console.error("[Nodemailer] Failed to send verification email:", error);
  }
}

export async function sendWelcomeEmail(email, name) {
  if (!process.env.SMTP_USER) {
    console.warn("SMTP_USER is missing. Skipping welcome email to:", email);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NestIQ" <noreply@nestiq.in>',
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
    console.error("[Nodemailer] Failed to send welcome email:", error);
  }
}

export async function sendPaymentReceipts({
  payment,
  razorpayPaymentId,
  monthName,
  amountInRupees
}) {
  if (!process.env.SMTP_USER) return;

  try {
    // Send receipt email to tenant
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NestIQ" <noreply@nestiq.in>',
      to: payment.tenant.email,
      subject: `✅ Rent Payment Confirmed — ${monthName} ${payment.rentYear}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
          <h2 style="color:#10b981">Rent Payment Successful 🏠</h2>
          <p>Hi ${payment.tenant.name},</p>
          <p>Your rent payment for <strong>${monthName} ${payment.rentYear}</strong> has been received.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Amount Paid</td>
                <td style="padding:8px">₹${amountInRupees}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Payment ID</td>
                <td style="padding:8px">${razorpayPaymentId}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:600">Landlord</td>
                <td style="padding:8px">${payment.landlord.name}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px">Please keep this email as your payment receipt.</p>
          <p style="color:#6b7280;font-size:13px">— Team NestIQ</p>
        </div>
      `,
    });

    // Notify landlord
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"NestIQ" <noreply@nestiq.in>',
      to: payment.landlord.email,
      subject: `💰 Rent Received — ${monthName} ${payment.rentYear}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
          <h2 style="color:#3b82f6">Rent Payment Received</h2>
          <p>Hi ${payment.landlord.name},</p>
          <p>${payment.tenant.name} has paid rent of <strong>₹${amountInRupees}</strong> for ${monthName} ${payment.rentYear}.</p>
          <p style="color:#6b7280;font-size:13px">— Team NestIQ</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[Nodemailer] Failed to send receipt emails:", error);
  }
}