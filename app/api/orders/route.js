import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSeller } from '@/lib/supabaseServer'
import { COUNTRIES, countryById } from '@/lib/countries'

export async function POST(req) {
  const { visitor_id, country, items } = await req.json()
  if (!visitor_id || !COUNTRIES.some((c) => c.id === country))
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: 'Box is empty' }, { status: 400 })

  const ids = items.map((i) => i.id)
  const { data: prods } = await supabaseAdmin.from('products').select('*').in('id', ids)
  const lines = items
    .map((i) => {
      const p = (prods || []).find((p) => p.id === i.id)
      if (!p) return null
      return { product_id: p.id, title: p.title, brand: p.brand, price_usd: p.price_usd, grade: p.grade, qty: Math.min(9, Math.max(1, Number(i.qty) || 1)) }
    })
    .filter(Boolean)
  if (!lines.length) return NextResponse.json({ error: 'No valid items' }, { status: 400 })

  const subtotal = lines.reduce((a, l) => a + l.price_usd * l.qty, 0)
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({ visitor_id, country, items: lines, subtotal_usd: subtotal })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const c = countryById(country)
  await supabaseAdmin.from('messages').insert({
    order_id: order.id,
    sender: 'seller',
    is_automated: true,
    body: `Hello! Thanks for choosing these items from the USA 🇺🇸 I'm reviewing your box and shipping destination (${c.flag} ${c.name}) right now. Let's discuss your preferred shipping speed, customs preferences, and custom payment options here in the chat!`,
  })

  return NextResponse.json({ orderId: order.id })
}

export async function GET() {
  const seller = await getSeller()
  if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { data } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ orders: data || [] })
}