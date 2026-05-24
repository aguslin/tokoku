import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Shop Indonesia - Marketplace Belanja Online',
  description: 'Tempat belanja online terpercaya dengan jutaan produk pilihan. Pengiriman cepat, harga terbaik, penjual terverifikasi.',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    title: 'Shop Indonesia - Marketplace Belanja Online',
    description: 'Tempat belanja online terpercaya dengan jutaan produk pilihan.',
    siteName: 'Shop Indonesia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Indonesia - Marketplace Belanja Online',
    description: 'Tempat belanja online terpercaya dengan jutaan produk pilihan.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
