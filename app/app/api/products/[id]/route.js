import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSeller } from '@/lib/supabaseServer'

export async function DELETE(_req, { params }) {
  const seller = await getSeller()
  if (!seller) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const { error } = await supabaseAdmin.from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}