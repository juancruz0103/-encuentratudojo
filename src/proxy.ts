import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: no remover este bloque — refresca la sesión
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Rutas protegidas — redirigir a /auth si no hay sesión
  const protectedRoutes = ['/dashboard', '/panel', '/admin']
  const isProtected = protectedRoutes.some(r => path.startsWith(r))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // Si ya está logueado e intenta ir a /auth → redirigir a su panel
  if (path === '/auth' && user) {
    const type = user.user_metadata?.type
    const dest = type === 'escuela' ? '/dashboard' : type === 'admin' ? '/admin' : '/panel'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
