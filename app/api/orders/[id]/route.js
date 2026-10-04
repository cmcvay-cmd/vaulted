import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSeller } from '@/lib/supabaseServer'

export async function GET(_req, { params }) {
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', params.id).maybeSingle()
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(req, { params }) {
  const seller = await getSeller()
  if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { shipping_total, status } = await req.json()
  const patch = { updated_at: new Date().toISOString() }
  if (typeof shipping_total === 'string') patch.shipping_total = shipping_total
  if (status) patch.status = status
  const { data: order, error } = await supabaseAdmin.from('orders').update(patch).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order })
}