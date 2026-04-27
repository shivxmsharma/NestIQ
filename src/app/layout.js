import "./globals.css";
import { Suspense } from "react";
import SessionProvider from "../components/providers/SessionProvider";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AIAssistant from "../components/ai/AiAssistant";
import MaintenanceOverlay from "../components/layout/MaintenanceOverlay";
import SafeImage from "../components/common/SafeImage";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import dbConnect from "../lib/db";
import PlatformSettings from "../lib/models/PlatformSettings";

export const metadata = {
  metadataBase: new URL("https://nestiq.in"),
  title: {
    default: "NestIQ | Find smarter, live better. Real Estate Platform",
    template: "%s | NestIQ",
  },
  description: "Advanced AI-powered real estate portal for Chandigarh Tricity. Buy, rent, or sell verified residential and commercial properties securely.",
  keywords: ["Real Estate", "Chandigarh Properties", "Buy Flat Chandigarh", "NestIQ", "AI Property Search"],
  authors: [{ name: "NestIQ" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nestiq.in",
    title: "NestIQ | Revolutionizing Real Estate",
    description: "Discover verified properties seamlessly using AI.",
    siteName: "NestIQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "NestIQ Real Estate",
  },
};

export default async function RootLayout({ children }) {
  let isMaintenance = false;
  let isAdmin = false;

  try {
    await dbConnect();
    const settings = await PlatformSettings.findOne({}).lean();
    isMaintenance = !!settings?.maintenanceMode;

    if (isMaintenance) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === "admin") {
        isAdmin = true;
      }
    }
  } catch (error) {
    console.error("Layout Database Error:", error);
  }

  const showMaintenanceBlock = isMaintenance && !isAdmin;

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#070b14] text-white selection:bg-indigo-500/30">
        <SessionProvider>
          {showMaintenanceBlock && <MaintenanceOverlay />}

          {/* Global Ambient Background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <SafeImage
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
              alt="Premium Real Estate Background"
              fill
              unoptimized
              fallbackType="property"
              fallbackClassName="bg-[#070b14] text-slate-700"
              className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
              preload
            />
            {/* Ambient Dark Gradient overlays the fixed image */}
            <div className="absolute inset-0 bg-linear-to-b from-[#070b14]/70 via-[#070b14]/90 to-[#070b14] backdrop-blur-xs" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            {!showMaintenanceBlock && (
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
            )}
            <main className="flex-1">
              {showMaintenanceBlock ? (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  {/* The fixed overlay handles the UI */}
                </div>
              ) : (
                children
              )}
            </main>
            {!showMaintenanceBlock && <Footer />}
            {!showMaintenanceBlock && <AIAssistant />}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
