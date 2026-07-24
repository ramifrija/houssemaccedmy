import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

async function deleteViaApi(userId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { error: new Error('Session expirée. Reconnectez-vous.') }
  }

  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { error: new Error(payload.error ?? 'Suppression impossible via le serveur') }
  }

  return { error: null }
}

export async function deleteUser(userId: string) {
  const apiResult = await deleteViaApi(userId)
  if (!apiResult.error) return

  const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
  if (error) throw apiResult.error ?? error
}
