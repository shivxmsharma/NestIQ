export const metadata = {
  title: "RERA Information | NestIQ",
};

export default function RERAPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-white mb-6">RERA Information</h1>
        <p className="text-slate-400 mb-12">The Real Estate (Regulation and Development) Act, 2016 aims to protect home-buyers and boost investments in the real estate industry.</p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm mb-8 space-y-6">
          <h2 className="text-2xl font-bold text-white">NestIQ Compliance</h2>
          <p className="text-slate-300 leading-relaxed">
            NestIQ is committed to ensuring full transparency and compliance. We mandate our registered builders, agents, and sellers to provide RERA numbers for applicable projects listed on this platform.
          </p>

          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Disclaimer</h3>
            <p className="text-sm text-red-200/80">
              Users are advised to proactively verify the RERA registration details of any property independently before making any financial commitments. NestIQ acts as a listing platform and shall not be held liable for misrepresentations by third-party listers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
