import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import LegalBanner from "@/components/LegalBanner";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const outfit = Outfit({
  subsets:  ["latin"],
  variable: "--font-body",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "GreenWheels — EV Retrofit Platform",
  description: "Convert your old fuel vehicle to electric. Admin-verified dealers, transparent pricing, safe and legal process.",
  keywords:    ["EV retrofit", "electric vehicle conversion", "green vehicle", "EV India"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><circle cx='250' cy='250' r='250' fill='%23052e16'/><circle cx='250' cy='130' r='45' fill='%2314532d'/><circle cx='250' cy='130' r='28' fill='%2315803d'/><circle cx='250' cy='130' r='16' fill='%23a3e635'/><path d='M50 285 L130 205 L250 260 L370 195 L450 285 Z' fill='%230f3d1f'/><rect x='50' y='285' width='400' height='165' fill='%231a3a1a'/><rect x='152' y='300' width='196' height='38' rx='6' fill='%2315803d'/><path d='M195 300 C198 272 220 259 250 259 C280 259 302 272 305 300 Z' fill='%23166534'/><circle cx='192' cy='340' r='23' fill='%230a0a0a'/><circle cx='192' cy='340' r='13' fill='%23a3e635'/><circle cx='308' cy='340' r='23' fill='%230a0a0a'/><circle cx='308' cy='340' r='13' fill='%23a3e635'/><polygon points='264,235 236,281 252,281 224,343 272,275 254,275 278,235' fill='%23a3e635'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              if (!localStorage.getItem('gw-splash-seen')) {
                document.documentElement.style.visibility = 'hidden';
                document.documentElement.style.background = '#021a0e';
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>
        <Providers>
          <SplashScreen />
          <Navbar />
          {children}
          <ConditionalFooter />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#052e16",
                color:      "#86efac",
                border:     "1px solid #15803d",
                fontFamily: "Outfit, sans-serif",
              },
            }}
          />
          <LegalBanner />
        </Providers>
      </body>
    </html>
  );
}