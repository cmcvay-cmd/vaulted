'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { countryById, fmt } from '@/lib/countries'
import { Icon, ProductArt } from '@/components/ui'

const time = (t) => new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const CATS = ['Apple Tech', 'Luxury Bags', 'Hype Sneakers', 'Vintage Americana']
const ARTS = ['titanium', 'midnight', 'monogram', 'caviar', 'chicago', 'military', 'denim', 'duck']
const GRADES = ['Pristine', 'Excellent', 'Very Good']
const emptyForm = { title: '', brand: '', price_usd: '', score: '9.0', category: 'Apple Tech', grade: 'Excellent', art: 'titanium', tag_id: '', image_url: '', why: '', wear_note: '', checks: '', video: false }

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">{label}</span>
      <input {...props} className="mt-1 w-full h-10 rounded-lg border border-neutral-200 px-3 text-[13px] outline-none bg-white" />
    </label>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [checked, setChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [tab, setTab] = useState('inbox')

  const [orders, setOrders] = useState([])
  const [sel, setSel] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [total, setTotal] = useState('')
  const seen = useRef(new Set())
  const listRef = useRef(null)

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecked(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    fetch('/api/orders').then((r) => r.json()).then((d) => { setOrders(d.orders || []); if (d.orders?.length) selectOrder(d.orders[0]) })
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.products || []))
  }, [session])

  const addMsg = (m) => {
    if (seen.current.has(m.id)) return
    seen.current.add(m.id)
    setMsgs((prev) => [...prev, m].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
  }

  function selectOrder(order) {
    setSel(order); setTotal(order.shipping_total); setMsgs([]); seen.current.clear()
    fetch(`/api/messages?order_id=${order.id}`).then((r) => r.json()).then((d) => (d.messages || []).forEach(addMsg))
  }

  useEffect(() => {
    if (!sel) return
    const ch = supabase.channel(`admin-${sel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${sel.id}` }, ({ new: m }) => addMsg(m))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [sel && sel.id])

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
    setSel((s) => ({ ...s, shipping_total: total }))
  }

  async function saveProduct(e) {
    e.preventDefault(); setBusy(true); setNote('')
    const checks = form.checks.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const [a, ...rest] = l.split(':')
      return { l: a.trim(), v: rest.join(':').trim() || 'OK' }
    })
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, checks }) })
    const d = await res.json()
    setBusy(false)
    if (!res.ok) { setNote('⚠️ ' + (d.error || 'Could not publish')); return }
    setProducts((p) => [...p, d.product])
    setForm(emptyForm); setFormOpen(false)
    setNote('✓ Published to the storefront')
  }

  async function removeProduct(id) {
    if (!window.confirm('Remove this item from the storefront?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) setProducts((p) => p.filter((x) => x.id !== id))
  }

  if (!checked) return null
  if (!session) return (
    <form onSubmit={login} className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl p-6">
        <div className="font-display font-bold text-lg">Seller Studio</div>
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
        <div className="font-display font-bold">Seller Studio</div>
        <button onClick={() => supabase.auth.signOut()} className="text-[11px] font-bold text-neutral-400 underline">Sign out</button>
      </div>

      <div className="flex border-b border-neutral-200 bg-white">
        <button onClick={() => setTab('inbox')} className={`flex-1 h-11 text-[11px] font-bold tracking-[0.16em] uppercase ${tab === 'inbox' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-neutral-400'}`}>Inbox · {orders.length}</button>
        <button onClick={() => setTab('inventory')} className={`flex-1 h-11 text-[11px] font-bold tracking-[0.16em] uppercase ${tab === 'inventory' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-neutral-400'}`}>Inventory · {products.length}</button>
      </div>

      {tab === 'inbox' && (
        <>
          {sel && (
            <div className="bg-white border-b border-neutral-200 px-4 py-2.5 space-y-2">
              <select value={sel.id} onChange={(e) => selectOrder(orders.find((o) => o.id === e.target.value))} className="h-9 w-full rounded-lg border border-neutral-200 px-2 text-[12px] font-semibold bg-white">
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>{countryById(o.country)?.flag} {fmt(o.subtotal_usd)} · {new Date(o.created_at).toLocaleDateString()} · {o.status}</option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <input value={total} onChange={(e) => setTotal(e.target.value)} placeholder="Shipping & final total" className="h-9 flex-1 rounded-lg border border-dashed border-neutral-300 px-2.5 text-[12px] font-semibold" />
                <button onClick={saveTotal} className="press h-9 px-3 rounded-lg bg-neutral-900 text-white text-[11px] font-bold shrink-0">Quote it</button>
              </div>
            </div>
          )}

          <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-3">
            {!sel && <div className="text-center text-[12px] text-neutral-400 pt-16">No orders yet. When a buyer checks out, their chat appears here instantly.</div>}
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
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Reply as seller…" className="w-full bg-transparent text-[13px] outline-none" />
            </div>
            <button onClick={send} className="press w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center"><Icon n="send" c="w-5 h-5" sw={2} /></button>
          </div>
        </>
      )}

      {tab === 'inventory' && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {note && <div className="a-fade text-[11px] font-semibold text-emerald-700">{note}</div>}
          <button onClick={() => setFormOpen((o) => !o)} className="press w-full h-11 rounded-xl bg-neutral-900 text-white text-[12px] font-bold tracking-wide">{formOpen ? 'CLOSE FORM' : '+ LIST NEW ITEM'}</button>

          {formOpen && (
            <form onSubmit={saveProduct} className="a-fade rounded-2xl bg-white border border-neutral-200 p-4 space-y-2.5">
              <Field label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="iPhone 14 Pro — 128GB, Deep Purple" />
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Brand" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Apple" />
                <Field label="Price (USD)" required type="number" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} placeholder="699" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <label className="block">
                  <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-neutral-200 px-2 text-[12px] bg-white">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <label className="block">
                  <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">Grade</span>
                  <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-neutral-200 px-2 text-[12px] bg-white">{GRADES.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <Field label="Score /10" type="number" step="0.1" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block">
                  <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">Art theme</span>
                  <select value={form.art} onChange={(e) => setForm({ ...form, art: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-neutral-200 px-2 text-[12px] bg-white">{ARTS.map((c) => <option key={c}>{c}</option>)}</select>
                </label>
                <Field label="Tag ID (optional)" value={form.tag_id} onChange={(e) => setForm({ ...form, tag_id: e.target.value })} placeholder="VL-1234" />
              </div>
              <Field label="Photo URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://… (empty = artwork)" />
              <label className="block">
                <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">Grading notes</span>
                <textarea value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] outline-none bg-white" placeholder="Graded Excellent: …" />
              </label>
              <Field label="Wear note" value={form.wear_note} onChange={(e) => setForm({ ...form, wear_note: e.target.value })} placeholder="Light corner rub under loupe" />
              <label className="block">
                <span className="text-[9px] font-bold tracking-[0.18em] text-neutral-400 uppercase">Checklist (one per line — Label: value)</span>
                <textarea value={form.checks} onChange={(e) => setForm({ ...form, checks: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] outline-none bg-white" placeholder={'Screen: Flawless\nBattery: 92%'} />
              </label>
              <label className="flex items-center gap-2 text-[12px] font-semibold">
                <input type="checkbox" checked={form.video} onChange={(e) => setForm({ ...form, video: e.target.checked })} className="w-4 h-4" /> Has video preview
              </label>
              <button disabled={busy} className="press w-full h-11 rounded-xl bg-emerald-600 text-white text-[12px] font-bold disabled:opacity-50">{busy ? 'PUBLISHING…' : 'PUBLISH TO STOREFRONT'}</button>
            </form>
          )}

          {products.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-2xl bg-white border border-neutral-200 p-3 items-center">
              <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0"><ProductArt art={p.art} imageUrl={p.image_url} iconClass="w-6 h-6" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate">{p.title}</div>
                <div className="text-[10px] text-neutral-400">{p.brand} · {fmt(p.price_usd)} · {p.grade} · {p.category}</div>
              </div>
              <button onClick={() => removeProduct(p.id)} className="press text-neutral-300 p-2"><Icon n="x" c="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}