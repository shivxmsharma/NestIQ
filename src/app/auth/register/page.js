"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "buyer", label: "Buyer / Tenant", desc: "Looking to buy or rent" },
  { value: "seller", label: "Owner", desc: "Want to list my property" },
  { value: "broker", label: "Broker / Agent", desc: "I'm a real estate professional" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: "Too short", color: "bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]", width: "w-1/4", text: "text-red-400" };
    if (pwd.length < 8) return { label: "Weak", color: "bg-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.5)]", width: "w-2/4", text: "text-orange-400" };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: "Fair", color: "bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]", width: "w-3/4", text: "text-yellow-400" };
    return { label: "Strong", color: "bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]", width: "w-full", text: "text-emerald-400" };
  };

  const strength = passwordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // Auto sign-in after register
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/"), 1500);
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10 w-full">
        <div className="text-center bg-[#0b1120]/80 backdrop-blur-2xl rounded-4xl shadow-2xl border border-white/5 p-12 relative overflow-hidden max-w-sm w-full">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Account created!</h2>
            <p className="text-emerald-400/80 font-medium">Redirecting you to NestIQ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative z-10 w-full">
      <div className="w-full max-w-md mt-10">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="text-2xl font-bold tracking-tight text-white">
            Nest<span className="text-indigo-400">IQ</span>
          </span>
        </Link>

        {/* Card Container */}
        <div className="bg-[#0b1120]/80 backdrop-blur-2xl rounded-4xl shadow-2xl border border-white/5 p-8 sm:p-10 relative overflow-hidden">

          {/* Subtle glow effect behind card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create account</h1>
            <p className="text-slate-400 mb-8 font-light">Join thousands of happy NestIQ users</p>

            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 disabled:opacity-60 mb-6 group shadow-sm"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or sign up with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: r.value }))}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 ${form.role === r.value
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300"
                        }`}
                    >
                      <span className={`text-xs font-semibold mb-1 ${form.role === r.value ? "text-indigo-300" : "text-slate-300"}`}>
                        {r.label}
                      </span>
                      <span className={`text-[10px] leading-tight ${form.role === r.value ? "text-indigo-400/70" : "text-slate-500"}`}>
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  autoComplete="tel"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                      <div className={`${strength.color} ${strength.width} h-full rounded-full transition-all duration-500`} />
                    </div>
                    <p className={`${strength.text} text-xs mt-1.5 font-medium`}>{strength.label}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-500/60 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] border border-indigo-500 hover:border-indigo-400"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>{loading ? "Creating account..." : "Create account"}</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-5">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 transition-colors">Terms</Link> and{" "}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline underline-offset-4 transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}