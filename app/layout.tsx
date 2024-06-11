import { Inter } from "next/font/google";
// import { Header } from "@/components/Header";
import UpperHeader from "@/components/UpperHeader";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import clsx from "clsx";

export const metadata = {
  metadataBase: new URL("https://ceal-db.vercel.app/"),
  title: "CEAL Statistics Database",
  description: "CEAL Statistics Database",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <UpperHeader />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
