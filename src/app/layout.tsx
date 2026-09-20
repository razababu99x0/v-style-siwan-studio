import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/site/Navbar";
import { CartDrawer } from "@/components/site/CartDrawer";
import { CommandPalette } from "@/components/site/CommandPalette";
import { Preloader } from "@/components/site/Preloader";
import { Footer } from "@/components/site/Footer";
import { PageTransition, SmoothScroll } from "@/components/site/Providers";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { Toaster } from "@/components/site/Toaster";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "V-STYLE Siwan — Fashion that pops off the screen",
  description:
    "Siwan's #1 style store. Men, women, kids, footwear, bags & home from ₹299–₹1,999. Try in-store, same-day pickup, UPI accepted.",
  keywords: ["Siwan fashion", "clothing store Siwan", "Bihar streetwear", "V-STYLE Siwan"],
  openGraph: {
    title: "V-STYLE Siwan",
    description: "Premium street fashion at Siwan prices. New drops every Friday.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-mist antialiased"><div role="note" style={{position:"fixed",bottom:0,left:0,right:0,zIndex:99999,textAlign:"center",padding:"6px 12px",background:"#111",color:"#fff",fontSize:12}}>Demo storefront · Orders and payments are unavailable</div>
        <div className="grain-overlay" aria-hidden />
        <Preloader />
        <SmoothScroll>
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <CartDrawer />
          <CommandPalette />
          <Toaster />
          <Suspense fallback={null}>
            <MobileTabBar />
          </Suspense>
        </SmoothScroll>
      </body>
    </html>
  );
}
