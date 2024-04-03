import { Inter } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import './globals.css'
import clsx from 'clsx'

export const metadata = {
  metadataBase: new URL('https://ceal-db.vercel.app/'),
  title: 'CEAL Statistics Database',
  description:
    'CEAL Statistics Database',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <Header />
      {children}
      <Footer />
    </html>
  )
}
