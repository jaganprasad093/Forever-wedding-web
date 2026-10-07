import type { Metadata } from 'next'
import './globals.css'

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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
