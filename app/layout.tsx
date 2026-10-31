import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://bloodinthebayougame.com'
      : 'http://localhost:3000',
  ),
  title: 'Level 29 · Blood in the Bayou',
  description:
    'Open-world bayou action game: jobs, zombies, BoomCity casino, steamboat shrimping and multiplayer.',
  applicationName: 'Level 29',
  appleWebApp: { capable: true, title: 'Level 29', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/bayou-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/bayou-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/bayou-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/bayou-apple-180.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0e10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Disabled placeholder configuration; Google loads only inside the game document. */}
        <script src="/game/ads.js" />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "if (typeof navigator.serviceWorker !== 'undefined') { navigator.serviceWorker.register('/sw.js') }",
            }}
          />
        )}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
