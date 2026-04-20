"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
          
          // Optional: redirect to login after a few seconds
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired token.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-white">{message}</h2>
          <p className="text-slate-400 mt-2">Please wait while we verify your token.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-slate-400 mb-6">{message}</p>
          <p className="text-sm text-slate-500 mb-4">Redirecting to login...</p>
          <Link
            href="/auth/login"
            className="flex w-full items-center justify-center py-3 px-4 rounded-xl text-white font-medium bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            Continue to Login
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-slate-400 mb-6">{message}</p>
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center py-3 px-4 rounded-xl text-white font-medium bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            Back to Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] relative flex items-center justify-center p-4">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-125 h-125 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
