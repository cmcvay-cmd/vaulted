'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { countryById, fmt } from '@/lib/countries'
import { Icon } from '@/components/ui'
import { RefreshIcon } from '@/components/Header'

const QUICK = ['⚡ Fastest shipping quote', '💰 Cheapest shipping', '🛃 Customs & declaration', '💳 Payment options']
const time = (t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function ChatPage({ params }) {
  const orderId = params.orderId
  const [order, setOrder] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [sumOpen, setSumOpen] = useState(true)
  const [err, setErr] = useState('')
  const [spin, setSpin] = useState(false)
  const seen = useRef(new Set())
  const listRef = useRef(null)

  const addMsg = (m) => {
    if (seen.current.has(m.id)) return
    seen.current.add(m.id)
    setMsgs((prev) => [...prev, m].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
  }

  async function load() {
    const [oRes, mRes] = await Promise.all([
      fetch(`/api/orders/${orderId}`),
      fetch(`/api/messages?order_id=${orderId}`),
    ])
    if (!oRes.ok) { setErr('Order not found.'); return }
    const { order } = await oRes.json()
    const { messages } = await mRes.json()
    setOrder(order)
    ;(messages || []).forEach(addMsg)
  }

  async function refresh() {
    setSpin(true)
    await load()
    setSpin(false)
  }

  useEffect(() => {
    load()
    const ch = supabase.channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` }, ({ new: m }) => addMsg(m))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, ({ new: o }) => setOrder(o))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [orderId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, order])

  async function send(text) {
    const t = (text || input).trim()
    if (!t) return
    setInput('')
    const res = await fetch('/api/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, body: t }),
    })
    if (res.ok) { const { message } = await res.json(); addMsg(message) }
  }

  if (err) return <div className="h-dvh flex items-center justify-center text-sm text-neutral-500">{err} <Link href="/" className="underline ml-2">Go home</Link></div>
  if (!order) return <div className="h-dvh flex items-center justify-center text-sm text-neutral-400">Loading checkout…</div>

  const c = countryById(order.country)
  return (
    <div className="h-dvh flex flex-col bg-[#efece7] a-screen">
      <header className="bg-white border-b border-neutral-200 z-30">
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-2.5">
          <Link href="/" className="press w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"><Icon n="back" c="w-5 h-5" /></Link>
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-display font-bold text-[14px]">V</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-bold leading-none truncate">Vaulted Export Desk</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">Live checkout · replies in chat</div>
          </div>
          <button onClick={refresh} aria-label="Refresh" className="press w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
            <RefreshIcon c={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/90">
          <button onClick={() => setSumOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-2.5">
            <span className="text-[8.5px] font-bold tracking-[0.18em] bg-neutral-900 text-white px-2 py-1 rounded">ORDER SUMMARY</span>
            <span className="flex-1 text-left text-[11px] text-neutral-500 font-medium truncate">
              {order.items.length} item(s) · {c?.flag} {c?.name}
            </span>
            <Icon n="chev" c={`w-4 h-4 text-neutral-400 transition-transform ${sumOpen ? 'rotate-180' : ''}`} />
          </button>
          {sumOpen && (
            <div className="a-fade px-4 pb-3.5 space-y-2.5">
              <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                {order.items.map((l) => (
                  <div key={l.product_id} className="flex items-center gap-2.5 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold truncate">{l.title}</div>
                      <div className="text-[9.5px] text-neutral-400">Qty {l.qty} · {l.grade}</div>
                    </div>
                    <div className="text-[11.5px] font-display font-bold">{fmt(l.price_usd * l.qty)}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/60">
                  <span className="text-[10.5px] font-bold text-neutral-500">BOX SUBTOTAL</span>
                  <span className="text-[12px] font-display font-bold">{fmt(order.subtotal_usd)} USD</span>
                </div>
              </div>
              <div>
                <div className="text-[8.5px] font-bold tracking-[0.2em] text-neutral-400 mb-1.5">SHIPPING &amp; FINAL TOTAL — UPDATES LIVE FROM THE SELLER</div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-2.5 py-2">
                  <Icon n="spark" c="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="flex-1 text-[12px] font-semibold">{order.shipping_total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-3">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'seller' && <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-display font-bold text-[9px] mr-2 mt-1 shrink-0">V</div>}
            <div className="max-w-[80%] flex flex-col">
              <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line shadow-sm ${m.sender === 'buyer' ? 'bg-neutral-900 text-white rounded-2xl rounded-br-md' : 'bg-white border border-neutral-200 text-neutral-800 rounded-2xl rounded-bl-md'}`}>
                {m.body}
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-1">
                <span className="text-[9px] text-neutral-400 font-medium">{time(m.created_at)}</span>
                {m.is_automated && <span className="text-[8px] font-bold tracking-[0.12em] text-neutral-300 border border-neutral-200 rounded px-1 py-px">AUTOMATED</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2">
        {QUICK.map((q) => (
          <button key={q} onClick={() => send(q)} className="press shrink-0 whitespace-nowrap bg-white border border-neutral-200 rounded-full px-3 h-8 text-[11px] font-semibold shadow-sm">{q}</button>
        ))}
      </div>
      <div className="border-t border-neutral-200 bg-white px-3 pt-2.5 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 rounded-full bg-neutral-100 flex items-center px-4">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Message the seller…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-neutral-400" />
          </div>
          <button onClick={() => send()} disabled={!input.trim()} className="press w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 disabled:opacity-25">
            <Icon n="send" c="w-5 h-5" sw={2} />
          </button>
        </div>
        <div className="text-center text-[9px] text-neutral-400 mt-2 tracking-wide">🔒 Secure checkout chat — payment arranged directly with the seller</div>
      </div>
    </div>
  )
}
