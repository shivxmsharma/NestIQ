import Link from "next/link";

const footerLinks = {
  Explore: [
    { label: "Buy Property", href: "/properties?listing=buy" },
    { label: "Rent Property", href: "/properties?listing=rent" },
    { label: "PG / Hostel", href: "/properties?listing=pg" },
  ],
  Company: [
    { label: "About NestIQ", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "RERA Info", href: "/rera" },
  ],
  Tools: [
    { label: "EMI Calculator", href: "/tools/emi-calculator" },
    { label: "Stamp Duty Calculator", href: "/tools/stamp-duty" },
    { label: "Property Valuation", href: "/tools/valuation" },
    { label: "AI Assistant", href: "/ai-assistant" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0b1120]/80 backdrop-blur-2xl border-t border-white/5 text-slate-300 relative w-full overflow-hidden">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">
                Nest<span className="text-indigo-400">IQ</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Find smarter, live better. Chandigarh&apos;s most trusted real estate portal.
            </p>
            <p className="text-xs text-slate-500 mt-4">
              © {new Date().getFullYear()} NestIQ. All rights reserved.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Real Estate (Regulation and Development) Act, 2016 compliant listings.
          </p>
          <p className="text-xs text-slate-500">
            Made with ❤️ for Chandigarh
          </p>
        </div>
      </div>
    </footer>
  );
}
