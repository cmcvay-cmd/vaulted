// components/DetailClient.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { ConditionChip, GRADE_STYLE, Icon, ProductArt } from '@/components/ui'
import { fmt } from '@/lib/countries'
import { useStore } from '@/context/StoreContext'

const SLIDES = ['FRONT', 'BACK', 'CLOSE-UP', 'TAGS & KIT', 'LOUPE PASS']

export default function DetailClient({ p }) {
  const [si, setSi] = useState(0)
  const { dispatch, count } = useStore()
  const g = GRADE_STYLE[p.grade]

  return (
    <div className="a-screen pb-32">
      <Header />
      <div className="relative h-[400px]">
        <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
             onScroll={(e) => setSi(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
          {SLIDES.map((label, i) => (
            <div key={i} className="relative w-full shrink-0 snap-center h-full overflow-hidden">
              <ProductArt art={p.art} imageUrl={i === 0 ? p.image_url : null} alt={p.title} iconClass={`w-40 h-40 ${i === 1 ? '-scale-x-100 rotate-3' : i === 2 ? 'scale-[1.8]' : i === 4 ? 'scale-[2.1] -translate-x-4' : ''}`} />
              <div className="absolute left-3 bottom-3 bg-black/70 text-white rounded-full px-2.5 py-1 text-[9px] font-bold tracking-[0.14em]">VIEW 0{i + 1} · {label}</div>
              {i === 4 && <div className="absolute right-3 bottom-3 bg-amber-400 text-neutral-900 rounded-full px-2.5 py-1 text-[9px] font-bold max-w-[55%] text-right">{p.wear_note}</div>}
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {SLIDES.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === si ? 'w-5 bg-neutral-900' : 'w-1.5 bg-neutral-400/60'}`} />)}
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9.5px] font-bold tracking-[0.2em] text-neutral-400 uppercase">{p.brand} · #{p.tag_id}</div>
            <h1 className="font-display font-bold text-[20px] leading-tight mt-1">{p.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display font-bold text-[22px] leading-none">{fmt(p.price_usd)}</div>
            <div className="text-[9px] text-neutral-400 font-bold tracking-wide mt-1">USD · EXCL. SHIPPING</div>
          </div>
        </div>

        <section className="mt-5 rounded-2xl bg-white border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-neutral-400">
              <Icon n="shield" c="w-4 h-4 text-emerald-600" /> CONDITION GRADING
            </div>
            <ConditionChip grade={p.grade} small />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="font-display font-bold text-[24px]">{p.grade}</div>
            <div className="ml-auto bg-neutral-100 rounded-full px-2.5 py-1 text-[11px] font-bold font-display">{Number(p.score).toFixed(1)} / 10</div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
            <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${p.score * 10}%` }} />
          </div>
          <p className="text-[12.5px] text-neutral-600 leading-relaxed mt-3">{p.why}</p>
          <div className="mt-3 border-t border-neutral-100">
            {(p.checks || []).map((c) => (
              <div key={c.l} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <span className="text-[12px] text-neutral-500 font-medium">{c.l}</span>
                <span className={`flex items-center gap-1.5 text-[12px] font-semibold ${c.warn ? 'text-amber-600' : 'text-emerald-700'}`}>
                  <Icon n={c.warn ? 'info' : 'check'} c="w-3.5 h-3.5" />{c.v}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-neutral-400">
            <Icon n="check" c="w-3.5 h-3.5 text-emerald-600" sw={2.2} /> Verified in-studio by Vaulted Labs · hang-tag #{p.tag_id}
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[['truck', '48h dispatch'], ['shield', 'Insured'], ['chat', 'Chat checkout']].map(([i, a]) => (
            <div key={a} className="rounded-xl bg-white border border-neutral-200 p-3">
              <Icon n={i} c="w-5 h-5" />
              <div className="text-[11px] font-bold mt-1.5">{a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-md md:rounded-b-[2rem] border-t border-neutral-200 bg-white/92 backdrop-blur px-4 pt-3 pb-5">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[9px] font-bold tracking-[0.2em] text-neutral-400">PRICE</div>
            <div className="font-display font-bold text-[19px] leading-none mt-0.5">{fmt(p.price_usd)}</div>
          </div>
          <button onClick={() => dispatch({ type: 'add', product: p })}
            className="press flex-1 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center gap-2 font-bold text-[13px] tracking-wide relative">
            <Icon n="bag" c="w-4 h-4" /> ADD TO BOX
            {count > 0 && (
              <span key={count} className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{count}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}