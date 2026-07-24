import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { CreatableRole } from '@/lib/role-ids'
import { adminCreateUserMetadata, resolveRoleId } from '@/lib/resolve-role-id'

export interface AdminCreateUserInput {
  email: string
  password: string
  first_name: string
  last_name: string
  role: CreatableRole
  class_id?: number
  subject?: string
}

async function createViaVercelApi(input: AdminCreateUserInput) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { userId: null, error: new Error('Session expirée. Reconnectez-vous.') }
  }

  const response = await fetch('/api/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(input),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      userId: null,
      error: new Error(payload.error ?? 'Création impossible via le serveur'),
    }
  }

  return { userId: payload.user_id as string, error: null }
}

async function createViaEdgeFunction(input: AdminCreateUserInput) {
  const { data, error } = await supabase.functions.invoke('create-user', { body: input })

  if (error || !data || typeof data !== 'object' || !('user_id' in data)) {
    return { userId: null, error: error ?? new Error('Edge function indisponible') }
  }

  return { userId: data.user_id as string, error: null }
}

async function createViaEphemeralSignup(input: AdminCreateUserInput) {
  const ephemeral = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  const { data: signUpData, error: signUpError } = await ephemeral.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: adminCreateUserMetadata(input),
    },
  })

  if (signUpError) {
    return { userId: null, error: signUpError }
  }

  if (!signUpData.user) {
    return { userId: null, error: new Error('Compte créé mais identifiant introuvable.') }
  }

  const profileCreated = await waitForProfile(userId)
  if (!profileCreated) {
    return { userId: null, error: new Error("L'email est probablement déjà utilisé ou la création a échoué silencieusement.") }
  }

  const roleId = await resolveRoleId(supabase, input.role)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role_id: roleId,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      status: 'approved',
    })
    .eq('user_id', userId)

  if (profileError) {
    return { userId: null, error: new Error(profileError.message) }
  }

  await supabase
    .from('profiles')
    .update({ email: input.email.trim(), requested_role: input.role } as Record<string, unknown>)
    .eq('user_id', userId)

  if (input.role === 'student' && input.class_id) {
    await supabase.from('student_enrollments').insert({
      student_id: userId,
      class_id: input.class_id,
    })
  }

  return { userId, error: null }
}

export async function adminCreateUser(input: AdminCreateUserInput) {
  let userId: string | null = null;
  let error: Error | null = null;

  const vercelResult = await createViaVercelApi(input)
  if (vercelResult.userId) {
    userId = vercelResult.userId
  } else {
    const edgeResult = await createViaEdgeFunction(input)
    if (edgeResult.userId) {
      userId = edgeResult.userId
    } else {
      const fallback = await createViaEphemeralSignup(input)
      if (fallback.userId) {
        userId = fallback.userId
      } else {
        error = fallback.error ?? edgeResult.error ?? vercelResult.error ?? new Error('Unknown error')
      }
    }
  }

  if (userId) {
    // Force status to approved directly from client to avoid waiting for server redeployments
    await supabase.from('profiles').update({ status: 'approved' }).eq('user_id', userId)
    return { userId, error: null }
  }

  return { userId: null, error }
}

async function waitForProfile(userId: string, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const { data } = await supabase.from('profiles').select('id').eq('user_id', userId).maybeSingle()
    if (data) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}
