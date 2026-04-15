import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Careers | NestIQ",
  description: "Join the NestIQ team and help revolutionize real estate in Chandigarh.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-300 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-6">
            Help us build the <span className="text-indigo-400">future</span> of real estate.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            At NestIQ, we are on a mission to make property hunting transparent, smart, and hassle-free. We are always looking for passionate individuals to join our growing team in Chandigarh.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <Briefcase className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No open positions right now</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            We are currently fully staffed, but we are always eager to meet talented developers, real estate experts, and designers. Send us your resume, and we will keep you in mind for future roles.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
          >
            Get in touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
