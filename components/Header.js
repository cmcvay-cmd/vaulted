'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { Icon } from '@/components/ui'

const TICKER = ['🇺🇸 USA SOURCED', '100% AUTHENTICATED', 'SHIPPED GLOBALLY', 'LOUPE-GRADED CONDITION', 'LIVE CHAT CHECKOUT']

export function RefreshIcon({ c }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={c}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v4h-4" />
    </svg>
  )
}

export default function Header() {
  const { count } = useStore()
  const router = useRouter()
  const [spin, setSpin] = useState(false)

  const refresh = () => {
    setSpin(true)
    router.refresh()
    window.setTimeout(() => setSpin(false), 800)
  }

  return (
    <header className="sticky top-0 z-40 bg-[#f6f5f2]/90 backdrop-blur border-b border-neutral-200">
      <div className="h-12 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center font-display font-bold text-[13px]">V</div>
          <div>
            <div className="font-display font-bold text-[15px] leading-none tracking-tight">VAULTED</div>
            <div className="text-[7.5px] tracking-[0.28em] text-neutral-400 font-bold mt-0.5">CURATED USA EXPORTS</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={refresh} aria-label="Refresh" className="press w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            <RefreshIcon c={`w-[17px] h-[17px] ${spin ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/checkout" className="press relative w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
            <Icon n="bag" c="w-[18px] h-[18px]" />
            {count > 0 && (
              <span key={count} className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <div className="h-7 bg-neutral-950 text-white overflow-hidden">
        <div className="a-marquee flex w-max h-full items-center text-[9.5px] font-bold tracking-[0.2em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center shrink-0">
              {TICKER.map((t) => (
                <span key={t} className="flex items-center gap-5 pr-5">{t}<span className="text-white/35">✦</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
