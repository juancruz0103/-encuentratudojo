import { createClient } from '@/lib/supabase/client'

// ── Login ──
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

// ── Registro — apunta al callback correcto ──
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  type: 'alumno' | 'escuela'
) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, type },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })
  return { data, error }
}

// ── Logout ──
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// ── Usuario actual (client side) ──
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Perfil del usuario desde la tabla users ──
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('users').select('*').eq('id', userId).single()
  return { data, error }
}

// ── Recuperar contraseña ──
export async function resetPassword(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`
  })
  return { error }
}
