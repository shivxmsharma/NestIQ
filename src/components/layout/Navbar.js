"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, Home, LogOut, User, LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Properties", href: "/properties" },
    { label: "Buy", href: "/properties?listing=buy" },
    { label: "Rent", href: "/properties?listing=rent" },
    { label: "PG", href: "/properties?listing=pg" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className=" flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className=" flex items-center gap-2 shrink-0">
            <div className=" w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Home className=" w-4 h-4 text-white" />
            </div>
            <span className=" text-xl font-bold text-gray-900">
              Nest<span className=" text-blue-600">IQ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className=" hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className=" text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className=" hidden md:flex items-center gap-3">
            {/* CTA Button */}
            {session && (
              <Link
                href="/dashboard/list-property"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all"
              >
                List Property
              </Link>
            )}
            {status === "loading" ? (
              <div className=" w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className=" flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {session.user.avatar ? (
                    <Image
                      src={session.user.avatar}
                      alt={session.user.name}
                      className=" w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className=" w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className=" text-xs font-semibold text-blue-600">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className=" text-sm font-medium text-gray-700">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className=" w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className=" absolute right-0 top-full mt-2 w-full min-w-50 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className=" flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className=" w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className=" flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className=" w-4 h-4" />
                      Profile
                    </Link>
                    <hr className=" my-1 border-gray-100" />
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                      className=" flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className=" w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className=" text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className=" text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className=" md:hidden p-2 rounded-lg hover:bg-gray-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className=" w-5 h-5" /> : <Menu className=" w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className=" md:hidden border-t border-slate-200 bg-white/90 backdrop-blur-md px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className=" block text-sm font-medium text-gray-700 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard/list-property"
            className="block text-center bg-blue-600 text-white py-2 rounded-lg font-medium"
            onClick={() => setMenuOpen(false)}
          >
            List Property
          </Link>
          <hr className=" border-gray-100" />
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className=" w-full text-left text-sm text-red-500 py-2"
            >
              Sign out
            </button>
          ) : (
            <div className=" flex gap-3 pt-1">
              <Link
                href="/auth/login"
                className=" flex-1 text-center text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className=" flex-1 text-center text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg"
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