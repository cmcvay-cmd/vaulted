// app/checkout/page.js — the Shopping Box + country selector + order creation
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { ConditionChip, Icon, ProductArt } from '@/components/ui'
import { COUNTRIES, countryById, fmt } from '@/lib/countries'
import { useStore } from '@/context/StoreContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, dispatch, visitorId, hydrated, count } = useStore()
  const [country, setCountry] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const subtotal = cart.reduce((a, x) => a + x.price_usd * x.qty, 0)
  const c = countryById(country)

  async function proceed() {
    setErr('')
    if (!cart.length) return setErr('Your box is empty.')
    if (!country) return setErr('Please select your destination country to continue.')
    setBusy(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          country,
          items: cart.map((x) => ({ id: x.id, qty: x.qty })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      localStorage.setItem('vaulted_last_order', data.orderId)
      dispatch({ type: 'clear' })
      router.push(`/chat/${data.orderId}`)
    } catch (e) {
      setErr(e.message)
      setBusy(false)
    }
  }

  if (!hydrated) return <div className="h-dvh" />

  return (
    <div className="a-screen pb-40">
      <Header />
      <div className="px-5 pt-4">
        <div className="font-display font-bold text-[20px]">Your Box</div>
        <div className="text-[10px] text-neutral-400 font-bold tracking-[0.16em] mt-1">{count} ITEM(S) · USA → YOU</div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex w-16 h-16 rounded-full bg-white border border-neutral-200 items-center justify-center">
              <Icon n="bag" c="w-7 h-7 text-neutral-300" />
            </div>
            <div className="font-display font-bold mt-3">Your box is empty</div>
            <a href="/" className="press inline-block mt-3 bg-neutral-900 text-white text-[12px] font-bold rounded-full px-5 py-2.5">Browse the vault</a>
          </div>
        ) : (
          <div className="space-y-2.5 mt-4">
            {cart.map((x) => (
              <div key={x.id} className="flex gap-3 rounded-2xl bg-white border border-neutral-200 p-3">
                <div className="relative w-[64px] h-[78px] rounded-lg overflow-hidden shrink-0">
                  <ProductArt art={x.art} imageUrl={x.image_url} iconClass="w-9 h-9" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="text-[9px] font-bold tracking-[0.16em] text-neutral-400 uppercase">{x.brand}</div>
                    <button onClick={() => dispatch({ type: 'remove', id: x.id })} className="text-neutral-300"><Icon n="x" c="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="text-[12.5px] font-semibold leading-snug line-clamp-2">{x.title}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center border border-neutral-200 rounded-full">
                        <button onClick={() => dispatch({ type: 'qty', id: x.id, d: -1 })} className="press w-7 h-7 flex items-center justify-center"><Icon n="minus" c="w-3 h-3" /></button>
                        <span className="text-[12px] font-bold w-4 text-center">{x.qty}</span>
                        <button onClick={() => dispatch({ type: 'qty', id: x.id, d: +1 })} className="press w-7 h-7 flex items-center justify-center"><Icon n="plus" c="w-3 h-3" /></button>
                      </div>
                      <ConditionChip grade={x.grade} small />
                    </div>
                    <div className="font-display font-bold text-[14px]">{fmt(x.price_usd * x.qty)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2.5 rounded-xl bg-sky-50 border border-sky-100 p-3">
          <Icon n="info" c="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-sky-900">Shipping, customs, and payment options will be finalized directly with the US seller in the next step via secure live chat.</p>
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 mb-2">DESTINATION COUNTRY <span className="text-red-500">*</span></div>
          <div className="relative">
            <button onClick={() => setOpen((o) => !o)} className="press w-full h-12 rounded-xl bg-white border border-neutral-200 px-3.5 flex items-center justify-between">
              {c ? (
                <span className="text-[13px] font-semibold flex items-center gap-2"><span className="text-[16px]">{c.flag}</span>{c.name}</span>
              ) : (
                <span className="text-[13px] text-neutral-400">Select destination country…</span>
              )}
              <Icon n="chev" c={`w-4 h-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-xl border border-neutral-200 shadow-xl overflow-y-auto max-h-64 no-scrollbar">
                {COUNTRIES.map((cc) => (
                  <button key={cc.id} onClick={() => { setCountry(cc.id); setOpen(false) }}
                    className="w-full px-3.5 py-3 flex items-center gap-2.5 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                    <span className="text-[16px]">{cc.flag}</span>
                    <span className="text-[13px] font-semibold flex-1 text-left">{cc.name}</span>
                    {country === cc.id && <Icon n="check" c="w-4 h-4 text-emerald-600" sw={2.2} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {c && <div className="a-fade mt-2 text-[10.5px] text-neutral-500 flex gap-1.5"><Icon n="spark" c="w-3.5 h-3.5 text-amber-500 shrink-0" />{c.note}</div>}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 rounded-xl bg-white border border-neutral-200 p-3.5">
            <div className="flex justify-between text-[12.5px] font-semibold"><span>Subtotal</span><span className="font-display font-bold">{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1.5"><span>Shipping &amp; duties</span><span className="font-semibold text-neutral-500">Quoted in chat →</span></div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 mx-auto max-w-md md:rounded-b-[2rem] border-t border-neutral-200 bg-white px-5 pt-3 pb-6 z-40">
        {err && <div className="a-fade text-center text-[11px] font-semibold text-red-500 mb-2">{err}</div>}
        <button onClick={proceed} disabled={busy}
          className="press w-full h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center gap-2.5 font-display font-bold text-[14px] tracking-wide shadow-lg disabled:opacity-50">
          <Icon n="chat" c="w-5 h-5" /> {busy ? 'CREATING CHECKOUT…' : 'PROCEED TO LIVE CHECKOUT CHAT'}
        </button>
      </div>
    </div>
  )
}