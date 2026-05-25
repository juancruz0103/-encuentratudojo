import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  // Si hay error en el callback (ej: link expirado)
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDesc ?? error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      // Redirigir según tipo de usuario
      const type = data.user.user_metadata?.type
      let destination = next

      if (next === '/') {
        if (type === 'escuela') destination = '/dashboard'
        else if (type === 'admin') destination = '/admin'
        else destination = '/panel'
      }

      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // Si no hay código o falló el intercambio → volver al login con error
  return NextResponse.redirect(`${origin}/auth?error=Link+de+verificación+inválido+o+expirado`)
}
