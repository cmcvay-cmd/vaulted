// lib/supabaseServer.js — cookie-aware client for route handlers (auth checks)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function serverClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

export async function getSeller() {
  const { data: { user } } = await serverClient().auth.getUser()
  return user
}