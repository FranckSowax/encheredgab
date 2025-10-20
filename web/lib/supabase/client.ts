import { createBrowserClient } from '@supabase/ssr'
// import { Database } from '@/types/database.types'

export function createClient() {
  // Retirer temporairement le type générique Database pour éviter les problèmes de type 'never'
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
