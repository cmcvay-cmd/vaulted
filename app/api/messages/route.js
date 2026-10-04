import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSeller } from '@/lib/supabaseServer'

export async function GET(req) {
  const orderId = req.nextUrl.searchParams.get('order_id')
  if (!orderId) return NextResponse.json({ error: 'order_id required' }, { status: 400 })
  const { data } = await supabaseAdmin.from('messages').select('*').eq('order_id', orderId).order('created_at')
  return NextResponse.json({ messages: data || [] })
}

export async function POST(req) {
  const { order_id, body } = await req.json()
  if (!order_id || !String(body || '').trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const seller = await getSeller()
  let sender
  if (seller) {
    sender = 'seller'
  } else {
    const { data: order } = await supabaseAdmin.from('orders').select('id').eq('id', order_id).maybeSingle()
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    sender = 'buyer'
  }

  const { data: message, error } = await supabaseAdmin
    .from('messages')
    .insert({ order_id, sender, body: String(body).trim().slice(0, 2000) })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message })
}