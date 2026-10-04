// app/layout.js
import './globals.css'
import { Space_Grotesk, Instrument_Sans } from 'next/font/google'
import { StoreProvider } from '@/context/StoreContext'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'VAULTED — Curated USA Exports',
  description: 'Premium authenticated used goods, exported from the USA to Japan, UK, Germany, Australia & UAE.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-[#0a0a09] font-sans text-neutral-900 antialiased">
        <StoreProvider>
          <div className="mx-auto w-full max-w-md min-h-dvh bg-[#f6f5f2] md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-[2rem] md:shadow-2xl overflow-clip">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  )
}