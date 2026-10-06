import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ForeverVows — Premium Digital Wedding Invitations',
    template: '%s | ForeverVows',
  },
  description:
    'Create stunning digital wedding invitations they will remember forever. Choose from premium templates, customize with your details, and share with a unique URL.',
  keywords: [
    'digital wedding invitation',
    'online wedding card',
    'wedding invitation maker',
    'wedding website',
  ],
  openGraph: {
    type: 'website',
    siteName: 'ForeverVows',
    title: 'ForeverVows — Premium Digital Wedding Invitations',
    description:
      'Create stunning digital wedding invitations they will remember forever.',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
