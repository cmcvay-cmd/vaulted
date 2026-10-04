// app/product/[id]/page.js
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import DetailClient from '@/components/DetailClient'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const { data: product } = await supabaseAdmin.from('products').select('*').eq('id', params.id).maybeSingle()
  if (!product) notFound()
  return <DetailClient p={product} />
}