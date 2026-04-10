import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "../components/providers/SessionProvider";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

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
      <body className={`${geist.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}