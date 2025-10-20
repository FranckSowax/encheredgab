import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
// import { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  // Retirer temporairement le type générique Database pour éviter les problèmes de type 'never'
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // La méthode `set` a été appelée depuis un Server Component.
            // Ceci peut être ignoré si vous avez un middleware qui rafraîchit
            // les sessions utilisateur.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // La méthode `delete` a été appelée depuis un Server Component.
            // Ceci peut être ignoré si vous avez un middleware qui rafraîchit
            // les sessions utilisateur.
          }
        },
      },
    }
  )
}
