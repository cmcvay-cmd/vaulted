import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSeller } from '@/lib/supabaseServer'

export async function GET() {
  const { data } = await supabaseAdmin.from('products').select('*').order('created_at')
  return NextResponse.json({ products: data || [] })
}

export async function POST(req) {
  const seller = await getSeller()
  if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const b = await req.json()
  if (!b.title || !b.brand || !b.price_usd) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const row = {
    category: b.category || 'Apple Tech',
    brand: b.brand,
    title: b.title,
    price_usd: Number(b.price_usd),
    grade: b.grade || 'Excellent',
    score: Number(b.score) || 9,
    why: b.why || '',
    wear_note: b.wear_note || '',
    checks: Array.isArray(b.checks) ? b.checks : [],
    tag_id: b.tag_id || ('VL-' + Math.floor(1000 + Math.random() * 9000)),
    art: b.art || 'titanium',
    image_url: b.image_url || null,
    video: !!b.video,
  }
  const { data, error } = await supabaseAdmin.from('products').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product: data })
}
