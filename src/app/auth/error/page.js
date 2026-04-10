"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, AlertTriangle } from "lucide-react";

const ERROR_MESSAGES = {
  Configuration: "There's a server configuration error. Please contact support.",
  AccessDenied: "You don't have permission to sign in.",
  Verification: "The verification link has expired. Please request a new one.",
  OAuthSignin: "Could not start the sign-in process. Please try again.",
  OAuthCallback: "Something went wrong during Google sign-in. Please try again.",
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method.",
  CredentialsSignin: "Invalid email or password.",
  Default: "An unexpected error occurred. Please try again.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Nest<span className="text-blue-600">IQ</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign-in failed</h1>
          <p className="text-sm text-gray-500 mb-8">{message}</p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Try again
            </Link>
            <Link
              href="/"
              className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors text-sm hover:bg-gray-50"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}