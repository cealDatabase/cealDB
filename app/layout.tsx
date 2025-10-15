import { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { Inter, Noto_Sans_SC, Noto_Sans_TC, Noto_Sans_JP, Noto_Sans_KR } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400','500','700'],
  variable: '--font-noto-sc',
  display: 'swap',
});

const notoTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400','500','700'],
  variable: '--font-noto-tc',
  display: 'swap',
});

const notoJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400','500','700'],
  variable: '--font-noto-jp',
  display: 'swap',
});

const notoKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400','500','700'],
  variable: '--font-noto-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cealstats.org/"),
  title: "CEAL Statistics Database",
  description: "CEAL Statistics Database",
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/favicon/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSC.variable} ${notoTC.variable} ${notoJP.variable} ${notoKR.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <Header />
        <AntdRegistry>{children}</AntdRegistry>
        <Footer />
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
