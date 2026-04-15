import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 15, 2025";

  return (
    <div className="min-h-screen bg-[#0b1120] relative w-full pt-16 pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-indigo-500/10 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Privacy Policy</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <ShieldAlert className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert prose-indigo max-w-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          <p>
            At NestIQ, accessible from nestiq.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by NestIQ and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">contact us</Link>.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
            <li><strong>Account Information:</strong> When you register for an Account, we may ask for your contact information, including items such as name, email address, and telephone number.</li>
            <li><strong>Property Data:</strong> Information you provide when listing a property, including photos, addresses, and pricing details.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our website, AI Assistant, and services.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-indigo-500">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you for customer service, updates, and marketing</li>
            <li>Send you emails and notifications regarding property inquiries</li>
            <li>Find and prevent fraud and verify RERA compliance</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Log Files</h2>
          <p>
            NestIQ follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Data Security</h2>
          <p>
            We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </div>
  );
}