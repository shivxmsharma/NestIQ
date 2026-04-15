export const metadata = {
  title: "Blog & Insights | NestIQ",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-6">
            Nest<span className="text-indigo-400">IQ</span> Insights
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Updates, trends, and market analysis for Chandigarh Tri-City real estate.
          </p>
        </div>

        {/* Placeholder mock articles */}
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-colors group cursor-not-allowed">
              <div className="h-48 bg-slate-800/50 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-500">Coming Soon</span>
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wider">Market Trends</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Chandigarh Real Estate Outlook 2026
                </h3>
                <p className="text-slate-400 text-sm line-clamp-3">
                  Discover the latest trends, price appreciation, and top upcoming sectors in the Chandigarh Tri-City area. Dive deep into expert analysis and predictions for the upcoming year in property investments.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
