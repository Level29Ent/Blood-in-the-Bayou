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
        <script id="level29-google-tag-manager" dangerouslySetInnerHTML={{ __html: "(function(w,d){\n  'use strict';\n  // Web only: native game builds keep their existing privacy/ads integration.\n  if(!/^https?:$/.test(w.location.protocol)||w.Capacitor?.isNativePlatform?.())return;\n  try{if(w.top!==w&&w.top.__level29GTM==='GTM-MTKR4ZCD')return;}catch(_){/* Cross-origin frames cannot inspect their parent. */}\n  if(w.__level29GTM==='GTM-MTKR4ZCD')return;\n  w.__level29GTM='GTM-MTKR4ZCD';\n  w.dataLayer=w.dataLayer||[];\n  w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};\n  // The site's CMP must update consent; loading the container does not grant it.\n  if(!w.google_tag_data?.ics)w.gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});\n  w.gtag('js',new Date());\n  w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});\n  var script=d.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtm.js?id=GTM-MTKR4ZCD';\n  d.head.appendChild(script);\n})(window,document);" }} />
        {/* Site-level AdSense tag requested by the owner. H5 game ads remain
            separately consent/approval gated inside the game document. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9730543201329278"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && (
          <script src="/offline-registration.js" />
        )}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
