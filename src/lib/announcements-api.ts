import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'

export type AnnouncementPriority = 'low' | 'medium' | 'high'
export type AnnouncementAudience = 'all' | 'student' | 'prof' | 'parent' | 'admin'

export interface AnnouncementRow {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  audience: AnnouncementAudience
  authorName: string
  createdAt: string
}

export interface CreateAnnouncementInput {
  title: string
  content: string
  priority: AnnouncementPriority
  audience: AnnouncementAudience
  authorId: string
}

export async function fetchAnnouncements(limit = 50): Promise<AnnouncementRow[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, priority, audience, author_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const authorIds = [...new Set((data ?? []).map((r) => r.author_id))]
  const names = new Map<string, string>()

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email')
      .in('user_id', authorIds)

    for (const p of profiles ?? []) {
      names.set(p.user_id, formatUserDisplayName(p))
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    priority: row.priority as AnnouncementPriority,
    audience: row.audience as AnnouncementAudience,
    authorName: names.get(row.author_id) ?? 'Administration',
    createdAt: row.created_at,
  }))
}

export async function createAnnouncement(input: CreateAnnouncementInput) {
  const { error } = await supabase.from('announcements').insert({
    title: input.title.trim(),
    content: input.content.trim(),
    priority: input.priority,
    audience: input.audience,
    author_id: input.authorId,
  })
  if (error) throw error
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}

export function audienceLabel(audience: AnnouncementAudience): string {
  switch (audience) {
    case 'all':
      return 'Tout le monde'
    case 'student':
      return 'Élèves'
    case 'prof':
      return 'Professeurs'
    case 'parent':
      return 'Parents'
    case 'admin':
      return 'Administration'
    default:
      return audience
  }
}
