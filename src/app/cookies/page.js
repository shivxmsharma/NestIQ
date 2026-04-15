export const metadata = {
  title: "Cookie Policy | NestIQ",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert prose-indigo">
        <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight">Cookie Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: April 15, 2026</p>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">1. What are cookies?</h2>
          <p className="leading-relaxed">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">2. How we use cookies</h2>
          <ul className="list-disc pl-6 space-y-3 leading-relaxed text-slate-400">
            <li><strong>Essential Cookies:</strong> Required for the operation of our platform (e.g., logging in, secure areas).</li>
            <li><strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count visitors and see how visitors move around our site.</li>
            <li><strong>Functionality Cookies:</strong> Used to recognize you when you return to our website (e.g., remembering your region or preferences).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
