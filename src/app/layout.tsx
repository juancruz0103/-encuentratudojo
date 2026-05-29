import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','600'], style: ['normal','italic'], display: 'swap' })

export const viewport: Viewport = {
  themeColor: '#0e0c0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://encuentratudojo.vercel.app'),
  title: {
    default: 'EncuentraTuDojo — Encontrá tu escuela de artes marciales en Argentina',
    template: '%s | EncuentraTuDojo',
  },
  description: 'El directorio más completo de escuelas de artes marciales en Argentina. Karate, Taekwondo, Judo, Kung Fu, Aikido, Hapkido y más. Buscá, comparé y reservá tu clase trial gratis.',
  keywords: ['artes marciales', 'karate', 'taekwondo', 'judo', 'dojo', 'escuela artes marciales', 'kung fu', 'aikido', 'argentina', 'buenos aires', 'clases artes marciales'],
  authors: [{ name: 'EncuentraTuDojo' }],
  creator: 'EncuentraTuDojo',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://encuentratudojo.vercel.app',
    siteName: 'EncuentraTuDojo',
    title: 'EncuentraTuDojo — Encontrá tu escuela de artes marciales',
    description: 'El directorio más completo de escuelas de artes marciales en Argentina. 19 academias verificadas en 8 disciplinas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EncuentraTuDojo',
    description: 'Encontrá tu dojo en Argentina',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EncuentraTuDojo',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/apple-touch-icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EncuentraTuDojo" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(){});
            });
          }
        `}} />
        {/* Google Analytics — reemplazar G-XXXXXXXXXX con tu ID real */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
            `}} />
          </>
        )}
      </head>
      <body style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</body>
    </html>
  )
}
