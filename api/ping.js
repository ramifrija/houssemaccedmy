import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // CORS
  const allowedOrigins = ['https://houssemacademy.com', 'capacitor://localhost', 'http://localhost', 'http://localhost:8080']
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Configuration Supabase manquante' })
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceKey)

    // Compter les étudiants (role_id = 3)
    const { count, error } = await adminClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 3)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const now = new Date()
    return res.status(200).json({ 
      success: true,
      message: "Ping avec succès ! Connexion à la base de données établie.",
      studentsCount: count,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR')
    })
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erreur serveur',
    })
  }
}
