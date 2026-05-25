import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EncuentraTuDojo — Encontrá tu escuela de artes marciales',
    template: '%s | EncuentraTuDojo',
  },
  description: 'El directorio más completo de escuelas de artes marciales en Argentina.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</body>
    </html>
  )
}
