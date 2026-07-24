import { createClient } from '@supabase/supabase-js'

const ROLE_IDS = {
  admin: 1,
  teacher: 2,
  student: 3,
  parent: 4,
}

const DB_ROLE_NAMES = {
  admin: 'admin',
  teacher: 'prof',
  student: 'student',
  parent: 'parent',
}

async function resolveRoleId(adminClient, role) {
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

  return ROLE_IDS[role]
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Configuration Supabase manquante' })
  }

  if (!serviceKey) {
    return res.status(503).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY manquante sur Vercel. Ajoutez-la dans Project Settings → Environment Variables.',
    })
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return res.status(401).json({ error: 'Session invalide' })
    }

    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin')
    if (adminError || !isAdmin) {
      return res.status(403).json({ error: 'Réservé aux administrateurs' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase()
    const password = String(body.password ?? '')
    const first_name = String(body.first_name ?? '').trim()
    const last_name = String(body.last_name ?? '').trim()
    const role = String(body.role ?? '')
    const class_id = body.class_id ? Number(body.class_id) : undefined

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Email et mot de passe (8 caractères min.) requis' })
    }

    if (!['student', 'teacher', 'parent', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' })
    }

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Prénom et nom requis' })
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
      const message = createError?.message ?? 'Création impossible'
      return res.status(400).json({ error: message })
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
      })
      .eq('user_id', userId)

    if (profileError) {
      return res.status(500).json({ error: profileError.message })
    }

    if (role === 'student' && class_id) {
      await adminClient.from('student_enrollments').insert({
        student_id: userId,
        class_id,
      })
    }

    return res.status(200).json({ user_id: userId, email, role })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    })
  }
}
