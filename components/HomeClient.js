// components/HomeClient.js
'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { ConditionChip, Icon, ProductArt } from '@/components/ui'
import { fmt } from '@/lib/countries'
import { useStore } from '@/context/StoreContext'

const CATEGORIES = ['All', 'Apple Tech', 'Luxury Bags', 'Hype Sneakers', 'Vintage Americana']

export default function HomeClient({ products }) {
  const [cat, setCat] = useState('All')
  const [toast, setToast] = useState(null)
  const { dispatch } = useStore()
  const list = useMemo(() => (cat === 'All' ? products : products.filter((p) => p.category === cat)), [cat, products])

  const add = (p) => {
    dispatch({ type: 'add', product: p })
    setToast('✓ Added to your box')
    clearTimeout(add.t)
    add.t = setTimeout(() => setToast(null), 2000)
  }

  return (
    <div className="a-screen">
      <Header />
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200 p-5">
          <span className="absolute -right-8 -bottom-10 text-neutral-100 pointer-events-none"><Icon n="globe" c="w-44 h-44" sw={1} /></span>
          <div className="relative">
            <div className="text-[10px] font-bold tracking-[0.24em] text-neutral-400">THE CURATED VAULT</div>
            <h1 className="font-display text-[26px] leading-[1.06] font-bold mt-2">Premium American finds,<br />graded &amp; shipped worldwide.</h1>
            <p className="text-[12.5px] text-neutral-500 mt-2 leading-relaxed">One US seller. Every item hand-checked, loupe-photographed and exported with insured delivery.</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {[['shield', 'Authenticated'], ['truck', 'Insured'], ['globe', '5 countries']].map(([i, t]) => (
                <span key={t} className="flex items-center gap-1.5 text-[10px] font-bold bg-neutral-100 rounded-full px-2.5 py-1.5">
                  <Icon n={i} c="w-3.5 h-3.5" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[76px] z-30 bg-[#f6f5f2]/90 backdrop-blur border-b border-neutral-200/70 mt-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`press whitespace-nowrap rounded-full h-8 px-3.5 text-[10.5px] font-bold tracking-[0.1em] uppercase border transition-colors ${cat === c ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-10">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-neutral-400">{cat === 'All' ? 'ALL ITEMS' : cat.toUpperCase()}</div>
            <div className="font-display font-bold text-lg leading-tight">{list.length} pieces</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <div key={p.id}>
              <Link href={`/product/${p.id}`} className="block relative aspect-[4/5] rounded-xl overflow-hidden border border-neutral-200/80 shadow-sm">
                <ProductArt art={p.art} imageUrl={p.image_url} alt={p.title} iconClass="w-28 h-28" />
                <div className="absolute top-2 left-2"><ConditionChip grade={p.grade} /></div>
                {p.video && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white rounded-full px-2 py-1 text-[9px] font-bold">▶ VIDEO</div>
                )}
              </Link>
              <div className="mt-2">
                <div className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">{p.brand}</div>
                <Link href={`/product/${p.id}`} className="text-[12.5px] font-semibold leading-snug mt-0.5 line-clamp-2 min-h-[34px] block">{p.title}</Link>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="font-display font-bold text-[15px]">{fmt(p.price_usd)}</div>
                  <button onClick={() => add(p)} className="press flex items-center gap-1 bg-neutral-900 text-white rounded-full pl-2.5 pr-3 h-8 text-[10px] font-bold tracking-wide">
                    <Icon n="plus" c="w-3 h-3" sw={2.4} /> ADD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 inset-x-0 z-[80] flex justify-center pointer-events-none">
          <div className="a-fadeUp bg-neutral-900 text-white text-[12px] font-semibold px-4 py-2.5 rounded-full shadow-2xl">{toast}</div>
        </div>
      )}
    </div>
  )
}