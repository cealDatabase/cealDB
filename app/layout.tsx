import { Inter } from "next/font/google";
import { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <Header />
        <AntdRegistry>{children}</AntdRegistry>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
