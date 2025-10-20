import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

let supabaseClient: SupabaseClient<Database> | null = null

/**
 * Initialise le client Supabase avec les variables d'environnement
 * @param supabaseUrl URL du projet Supabase
 * @param supabaseAnonKey Clé anonyme Supabase
 * @returns Instance du client Supabase
 */
export function initSupabase(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient<Database> {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseClient
}

/**
 * Récupère l'instance du client Supabase
 * @throws Error si le client n'est pas initialisé
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient) {
    throw new Error(
      'Le client Supabase n\'est pas initialisé. Appelez initSupabase() d\'abord.'
    )
  }
  return supabaseClient
}

/**
 * Réinitialise le client Supabase (utile pour les tests)
 */
export function resetSupabase(): void {
  supabaseClient = null
}
