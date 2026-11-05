import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AudienceProvider } from "@/components/AudienceProvider";
import { AudienceGate } from "@/components/AudienceGate";
import { themeBootScript } from "@/components/ThemeSwitch";
import { DonationAlerts } from "@/components/DonationAlerts";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "Rock the Routine", template: "%s · Rock the Routine" },
  description:
    "A Red Rocks NIL platform where fans, supporters and businesses back athlete-led Impact Routines with Who Rocks the House.",
};

export const viewport: Viewport = { themeColor: "#0f0e0d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${geist.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <div className="h-1.5 bg-red" aria-hidden="true" />
        <a href="#main" className="btn btn-red sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]">
          Skip to content
        </a>
        <AudienceProvider>
          <NavBar />
          <main id="main">
            <AudienceGate>{children}</AudienceGate>
          </main>
          <Footer />
          <DonationAlerts />
        </AudienceProvider>
      </body>
    </html>
  );
}
