import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "../components/providers/SessionProvider";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Image from "next/image";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata = {
  title: "NestIQ — Find smarter, live better",
  description:
    "Chandigarh's most trusted real estate portal. Buy, rent, or sell properties with AI-powered search and verified listings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-[#070b14] text-white selection:bg-indigo-500/30`}>
        <SessionProvider>
          {/* Global Ambient Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
              alt="Premium Real Estate Background"
              fill
              unoptimized
              className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
              priority
            />
            {/* Ambient Dark Gradient overlays the fixed image */}
            <div className="absolute inset-0 bg-linear-to-b from-[#070b14]/70 via-[#070b14]/90 to-[#070b14] backdrop-blur-xs" />
          </div>

          {/* App Layout */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}