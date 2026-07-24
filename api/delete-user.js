import { createClient } from '@supabase/supabase-js'

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

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return res.status(503).json({ error: 'Configuration Supabase incomplète sur Vercel' })
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
    const userId = String(body.user_id ?? '')

    if (!userId) {
      return res.status(400).json({ error: 'user_id requis' })
    }

    if (userId === user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)

    await adminClient.from('profiles').delete().eq('user_id', userId)

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      return res.status(500).json({ error: authDeleteError.message })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    })
  }
}
