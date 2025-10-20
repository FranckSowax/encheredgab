import { type NextRequest, NextResponse } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware'

// Middleware désactivé temporairement pour éviter les problèmes Edge Runtime
// TODO: Réactiver après configuration correcte de Supabase Edge Runtime
export async function middleware(request: NextRequest) {
  // return await updateSession(request)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (fichier favicon)
     * - fichiers publics (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
