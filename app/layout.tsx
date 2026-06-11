import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Inter, Playfair_Display, Geist_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ variable: '--font-heading', subsets: ['latin'], display: 'swap' })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ST Revenue Intelligence System — Analytics & Operations',
  description:
    'ST Revenue Intelligence System — centralized multi-office revenue analytics, transaction tracking, pending work management, and deadline intelligence.',
  generator: 'v0.app',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${geistMono.variable} bg-background`}>
      <head>
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var s = localStorage.getItem('st-ris-theme');
              if (s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

