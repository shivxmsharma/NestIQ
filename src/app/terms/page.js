/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { CopyCheck } from "lucide-react";

export default function TermsPage() {
  const lastUpdated = "October 16, 2025";

  return (
    <div className="min-h-screen bg-[#0b1120] relative w-full pt-16 pb-24">
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-175 h-125 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Terms of Use</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <CopyCheck className="w-4 h-4" /> Terms & Conditions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Terms of Use
          </h1>
          <p className="text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <p>
            Welcome to NestIQ! These terms and conditions outline the rules and regulations for the use of NestIQ's Website, located at nestiq.in.
          </p>

          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use NestIQ if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">1. Use of the Site</h2>
          <p>
            You must be at least 18 years of age to use this Website. By using this Website and agreeing to these terms and conditions, you warrant and represent that you are at least 18 years of age.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
            <li>You agree to use the site only for lawful purposes related to searching for, listing, or purchasing real estate.</li>
            <li>You agree not to post false, inaccurate, or misleading property listings.</li>
            <li>You understand that you are responsible for maintaining the confidentiality of your account credentials.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">2. Property Listings</h2>
          <p>
            Users are allowed to post property listings. NestIQ does not claim ownership of the content that you submit or make available for inclusion on the site.
          </p>
          <p>We reserve the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
            <li>Remove any listing that violates these terms or is proven to be fraudulent.</li>
            <li>Verify the RERA compliance status of any listed property.</li>
            <li>Use the submitted photos and descriptions for promotional purposes on our platform.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">3. Zero Brokerage & Interactions</h2>
          <p>
            NestIQ is a platform connecting buyers directly with sellers. We do not act as a real estate broker or agent.
          </p>
          <p>
            Any agreements or transactions initiated through this platform are strictly between the involved users. We do not guarantee the completeness or accuracy of the information provided by sellers. Always verify property papers and consult legal counsel before finalizing a transaction.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">4. AI Features & Estimates</h2>
          <p>
            Our Property AI Insights and Valuation tools are based on publicly available data, historical trends, and predictive algorithms.
            <strong> These are estimates only</strong> and do not constitute formal financial, legal, or appraisal advice. NestIQ is not liable for transactions made solely on the basis of AI valuations.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">5. Changes to Terms</h2>
          <p>
            We reserve the right to amend these terms at any time. When we do, we will revise the updated date at the top of this page. We encourage you to frequently check this page for any changes. Check our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link> for details regarding how we manage your data.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Terms and Conditions, do not hesitate to <Link href="/contact" className="text-emerald-400 hover:text-emerald-300">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}