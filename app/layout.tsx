import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <Providers>
            <Navbar />
          {children}
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
        </Providers>
      </body>
    </html>
  );
}