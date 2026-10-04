import { supabaseAdmin } from '@/lib/supabaseAdmin'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export default async function VaultPage() {
  const { data: products } = await supabaseAdmin.from('products').select('*').order('created_at')
  return <HomeClient products={products || []} />
}