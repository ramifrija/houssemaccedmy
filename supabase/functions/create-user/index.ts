import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLE_IDS: Record<string, number> = {
  admin: 1,
  teacher: 2,
  student: 3,
  parent: 4,
}

const DB_ROLE_NAMES: Record<string, string> = {
  admin: 'admin',
  teacher: 'prof',
  student: 'student',
  parent: 'parent',
}

async function resolveRoleId(adminClient: ReturnType<typeof createClient>, role: string) {
  const primary = DB_ROLE_NAMES[role]
  const { data } = await adminClient.from('user_roles').select('id').eq('role_name', primary).maybeSingle()
  if (data?.id) return data.id

  if (role === 'teacher') {
    const { data: fallback } = await adminClient
      .from('user_roles')
      .select('id')
      .eq('role_name', 'teacher')
      .maybeSingle()
    if (fallback?.id) return fallback.id
  }

  return ROLE_IDS[role] ?? ROLE_IDS.student
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Non autorisé' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) {
      return json({ error: 'Session invalide' }, 401)
    }

    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin')
    if (adminError || !isAdmin) {
      return json({ error: 'Réservé aux administrateurs' }, 403)
    }

    const body = await req.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const first_name = String(body.first_name ?? '').trim()
    const last_name = String(body.last_name ?? '').trim()
    const role = String(body.role ?? '')
    const class_id = body.class_id ? Number(body.class_id) : undefined

    if (!email || !password || password.length < 8) {
      return json({ error: 'Email et mot de passe (8 caractères min.) requis' }, 400)
    }

    if (!['student', 'teacher', 'parent', 'admin'].includes(role)) {
      return json({ error: 'Rôle invalide' }, 400)
    }

    if (!first_name || !last_name) {
      return json({ error: 'Prénom et nom requis' }, 400)
    }

    const adminClient = createClient(supabaseUrl, serviceKey)
    const roleId = await resolveRoleId(adminClient, role)

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role,
        subject: body.subject ?? null,
        created_by_admin: 'true',
      },
    })

    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Création impossible' }, 400)
    }

    const userId = created.user.id

    await new Promise((r) => setTimeout(r, 300))

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        role_id: roleId,
        first_name,
        last_name,
        email,
        requested_role: role,
        status: 'approved',
      })
      .eq('user_id', userId)

    if (profileError) {
      return json({ error: profileError.message }, 500)
    }

    if (role === 'student' && class_id) {
      await adminClient.from('student_enrollments').insert({
        student_id: userId,
        class_id,
      })
    }

    return json({ user_id: userId, email, role }, 200)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, 500)
  }
})

function json(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}
