"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, PlusCircle, Sparkles, Heart, MessageSquare, Settings } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled((prev) => {
        if (!prev && window.scrollY > 60) return true;
        if (prev && window.scrollY < 20) return false;
        return prev;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSeller = ['seller', 'broker', 'admin'].includes(session?.user?.role);

  const navLinks = [
    { label: "Buy", href: "/properties?listing=buy" },
    { label: "Rent", href: "/properties?listing=rent" },
    { label: "Co-Living", href: "/properties?listing=pg" },
  ];

  const toolLinks = [
    { label: "EMI Calculator", href: "/tools/emi-calculator" },
    { label: "Stamp Duty", href: "/tools/stamp-duty" },
    { label: "AI Valuation", href: "/tools/valuation" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out border-b ${scrolled
      ? "bg-[#0b1120]/80 backdrop-blur-2xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-0"
      : "bg-transparent border-transparent shadow-none py-2"
      }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-12 w-full">
        <div className={`flex items-center justify-between w-full relative transition-[height] duration-500 ease-out ${scrolled ? "h-16" : "h-20"}`}>
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center justify-start gap-2 shrink-0 group">
              <span className="text-2xl font-black tracking-tight text-white">
                Nest<span className="text-indigo-500">IQ</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Centered, Uniform floating island */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 p-1.5 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-sm shadow-xl">
            <Link
              href="/properties"
              className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Explore
            </Link>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}

            {/* Tools Dropdown */}
            <div className="relative group" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                Tools <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Swapped mt-3 to pt-3 so the container creates an invisible "bridge" to keep the mouse in hover-state */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-48 transition-all duration-200 origin-top shadow-2xl ${toolsOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 pointer-events-none'}`}>
                <div className="bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden p-1.5">
                  {toolLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* List Property (For Sellers) */}
            {session && isSeller && (
              <Link
                href="/dashboard/list-property"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                List Property
              </Link>
            )}

            {/* Highlighted AI Assistant Link */}
            <Link
              href="/ai-assistant"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Ask Nia (AI)
            </Link>
          </nav>

          {/* Right side - Actions & Auth */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-4 shrink-0">
            {status === "loading" ? (
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all border group hover:bg-white/10 border-white/5 hover:border-white/15 bg-white/5 backdrop-blur-md"
                >
                  {session.user.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt={session.user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-300 ring-2 ring-white/10 shrink-0">
                      <span className="text-xs font-bold">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate max-w-25">
                    {session.user.name?.split(' ')[0] || "User"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-[#0b1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-2 z-50 transform origin-top-right transition-all">
                    {/* User Info Header */}
                    <div className="px-3 py-3 mb-2 flex flex-col gap-0.5 border-b border-white/5">
                      <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all group/item mb-1"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="p-1.5 bg-indigo-500/10 group-hover/item:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      Dashboard
                    </Link>

                    {/* Quick Profile Links */}
                    <div className="flex flex-col gap-1 mb-2 border-b border-white/5 pb-2">
                      <Link
                        href="/dashboard/saved"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-slate-400 group-hover/item:text-rose-400 transition-colors" />
                          Saved Properties
                        </div>
                      </Link>

                      <Link
                        href="/dashboard/my-enquiries"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400 group-hover/item:text-blue-400 transition-colors" />
                        My Enquiries
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-slate-400 group-hover/item:text-slate-300 transition-colors" />
                        Settings
                      </Link>
                    </div>

                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all group/item"
                    >
                      <div className="p-1.5 bg-red-500/10 group-hover/item:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/auth/login"
                  className="text-sm font-bold px-4 py-2 rounded-full transition-colors text-slate-300 hover:text-white hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-bold px-5 py-2 rounded-full transition-all bg-white hover:bg-slate-100 text-indigo-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-4">
            <button
              className="p-2 rounded-xl transition-colors text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-6 pt-2 space-y-2 border-t border-white/10 bg-[#0b1120]/95 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 rounded-xl text-base font-semibold transition-colors text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px my-2 bg-white/10" />
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Tools</div>
          {toolLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 rounded-xl text-sm font-medium transition-colors text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-px my-4 bg-white/10" />

          {isSeller && (
            <Link
              href="/dashboard/list-property"
              className="block text-center py-3 rounded-xl font-bold transition-colors bg-white/10 text-white hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              onClick={() => setMenuOpen(false)}
            >
              List Property
            </Link>
          )}

          {session && (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-3 w-full px-4 py-3 mt-4 rounded-xl text-base font-semibold transition-colors bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
          )}

          <div className="h-px my-4 bg-white/10" />

          {session ? (
            <button
              onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
              className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold transition-colors text-red-400 hover:bg-red-500/10"
            >
              Sign out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link
                href="/auth/login"
                className="text-center py-2.5 rounded-xl text-base font-bold transition-colors bg-white/10 text-white hover:bg-white/20"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-center py-2.5 rounded-xl text-base font-bold shadow-sm transition-colors bg-white text-indigo-900"
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}