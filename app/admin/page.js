// app/admin/page.js
'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { countryById, fmt } from '@/lib/countries'
import { Icon } from '@/components/ui'

const time = (t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [checked, setChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loginErr, setLoginErr] = useState('')

  const [orders, setOrders] = useState([])
  const [sel, setSel] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [total, setTotal] = useState('')
  const seen = useRef(new Set())
  const listRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecked(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/orders').then((r) => r.json()).then((d) => {
      setOrders(d.orders || [])
      if (d.orders?.length) select(d.orders[0])
    })
  }, [session])

  const addMsg = (m) => {
    if (seen.current.has(m.id)) return
    seen.current.add(m.id)
    setMsgs((prev) => [...prev, m].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
  }

  function select(order) {
    setSel(order); setTotal(order.shipping_total); setMsgs([]); seen.current.clear()
    fetch(`/api/messages?order_id=${order.id}`).then((r) => r.json()).then((d) => d.messages.forEach(addMsg))
  }

  useEffect(() => {
    if (!sel) return
    const ch = supabase.channel(`admin-${sel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${sel.id}` }, ({ new: m }) => addMsg(m))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [sel?.id])

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [msgs])

  async function login(e) {
    e.preventDefault(); setLoginErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setLoginErr(error.message)
  }

  async function send() {
    if (!input.trim() || !sel) return
    const t = input; setInput('')
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: sel.id, body: t }) })
    if (res.ok) { const { message } = await res.json(); addMsg(message) }
  }

  async function saveTotal() {
    if (!sel) return
    await fetch(`/api/orders/${sel.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipping_total: total }) })
    setOrders((os) => os.map((o) => (o.id === sel.id ? { ...o, shipping_total: total } : o)))
  }

  if (!checked) return null
  if (!session) return (
    <form onSubmit={login} className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl p-6">
        <div className="font-display font-bold text-lg">Seller Sign-in</div>
        <div className="text-[11px] text-neutral-400 mt-1">VAULTED admin — authorized staff only.</div>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full mt-4 h-11 rounded-lg border border-neutral-200 px-3 text-sm outline-none" />
        <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full mt-2 h-11 rounded-lg border border-neutral-200 px-3 text-sm outline-none" />
        {loginErr && <div className="text-[11px] text-red-500 mt-2">{loginErr}</div>}
        <button className="press w-full mt-4 h-11 rounded-lg bg-neutral-900 text-white text-sm font-bold">Sign in</button>
      </div>
    </form>
  )

  return (
    <div className="h-dvh flex flex-col bg-[#efece7]">
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="font-display font-bold">Seller Inbox</div>
        <div className="flex items-center gap-3">
          <select value={sel?.id || ''} onChange={(e) => select(orders.find((o) => o.id === e.target.value))}
            className="h-9 rounded-lg border border-neutral-200 px-2 text-[12px] font-semibold bg-white">
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {countryById(o.country)?.flag} {fmt(o.subtotal_usd)} · {new Date(o.created_at).toLocaleDateString()} · {o.status}
              </option>
            ))}
          </select>
          <button onClick={() => supabase.auth.signOut()} className="text-[11px] font-bold text-neutral-400 underline">Sign out</button>
        </div>
      </div>

      {sel && (
        <>
          <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 mr-auto">{sel.items.length} ITEM(S) · {countryById(sel.country)?.flag} {countryById(sel.country)?.name}</span>
            <input value={total} onChange={(e) => setTotal(e.target.value)} className="h-9 w-52 rounded-lg border border-dashed border-neutral-300 px-2.5 text-[12px] font-semibold" />
            <button onClick={saveTotal} className="press h-9 px-3 rounded-lg bg-neutral-900 text-white text-[11px] font-bold">Quote it</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-3">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'seller' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line ${m.sender === 'seller' ? 'bg-neutral-900 text-white rounded-2xl rounded-br-md' : 'bg-white border border-neutral-200 rounded-2xl rounded-bl-md'}`}>
                  {m.body}
                  <div className={`text-[9px] mt-1 ${m.sender === 'seller' ? 'text-white/50' : 'text-neutral-400'}`}>{time(m.created_at)}{m.is_automated ? ' · auto' : ''}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 bg-white px-3 pt-2.5 pb-4 flex items-center gap-2">
            <div className="flex-1 h-10 rounded-full bg-neutral-100 flex items-center px-4">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Reply as seller…" className="w-full bg-transparent text-[13px] outline-none" />
            </div>
            <button onClick={send} className="press w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center"><Icon n="send" c="w-5 h-5" sw={2} /></button>
          </div>
        </>
      )}
    </div>
  )
}