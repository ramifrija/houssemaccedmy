import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'

export interface ConversationItem {
  id: string
  name: string
  otherUserId: string | null
  lastMessage: string
  lastMessageAt: string | null
  role: 'teacher' | 'student' | 'admin' | 'parent'
  isGroup: boolean
  unreadCount?: number
}

export interface MessageItem {
  id: string
  senderId: string
  senderName: string
  content: string
  sentAt: string
  isOwn: boolean
  type?: 'text' | 'poll'
  metadata?: any
}

export interface ContactItem {
  userId: string
  name: string
  role: string
}

export interface ClassContactItem {
  classId: number
  name: string
  studentCount: number
}

function mapDbRole(roleName: string | null): ConversationItem['role'] {
  if (roleName === 'prof') return 'teacher'
  if (roleName === 'admin' || roleName === 'student' || roleName === 'parent') return roleName
  return 'teacher'
}

export async function fetchMyConversations(): Promise<ConversationItem[]> {
  const { data, error } = await supabase.rpc('get_my_conversations')
  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => {
    const firstName = String(row.other_first_name ?? '')
    const lastName = String(row.other_last_name ?? '')
    const displayName =
      firstName || lastName
        ? formatUserDisplayName({ first_name: firstName, last_name: lastName })
        : String(row.title ?? 'Conversation')

    return {
      id: String(row.conversation_id),
      name: row.is_group ? String(row.title ?? 'Groupe') : displayName,
      otherUserId: row.other_user_id ? String(row.other_user_id) : null,
      lastMessage: String(row.last_message ?? ''),
      lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
      role: mapDbRole(row.other_role ? String(row.other_role) : null),
      isGroup: Boolean(row.is_group),
      unreadCount: Number(row.unread_count ?? 0),
    }
  })
}

export interface AdminConversationItem {
  id: string
  name: string
  participantsList: string
  lastMessage: string
  lastMessageAt: string | null
  isGroup: boolean
}

export async function fetchAdminAllConversations(filterUserId?: string): Promise<AdminConversationItem[]> {
  const { data, error } = await supabase.rpc('get_admin_all_conversations', {
    p_filter_user_id: filterUserId || null,
  })
  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.conversation_id),
    name: row.is_group
      ? String(row.title ?? 'Groupe')
      : String(row.participants_list ?? row.title ?? 'Discussion'),
    participantsList: String(row.participants_list ?? ''),
    lastMessage: String(row.last_message ?? ''),
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
    isGroup: Boolean(row.is_group),
  }))
}

export async function fetchMessageableContacts(): Promise<ContactItem[]> {
  const { data, error } = await supabase.rpc('get_messageable_contacts')
  if (error) throw error

  const seen = new Set<string>()
  const contacts: ContactItem[] = []

  for (const row of data ?? []) {
    const userId = String(row.user_id)
    if (seen.has(userId)) continue
    seen.add(userId)
    contacts.push({
      userId,
      name: formatUserDisplayName({
        first_name: String(row.first_name ?? ''),
        last_name: String(row.last_name ?? ''),
      }),
      role: String(row.role_name ?? ''),
    })
  }

  return contacts
}

export async function fetchMessageableClasses(): Promise<ClassContactItem[]> {
  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Error fetching classes:', error)
    return []
  }

  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('class_id')

  const countByClass = new Map<number, number>()
  for (const row of enrollments ?? []) {
    countByClass.set(row.class_id, (countByClass.get(row.class_id) ?? 0) + 1)
  }

  return (classes ?? []).map((cls) => ({
    classId: cls.id,
    name: cls.name,
    studentCount: countByClass.get(cls.id) ?? 0,
  }))
}

export interface ParentContactItem {
  userId: string
  name: string
  childrenNames: string
}

export async function fetchParentsForMessaging(): Promise<ParentContactItem[]> {
  const { data: parents, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name')
    .eq('role_id', 4)

  if (error) {
    console.error('Error fetching parents:', error)
    return []
  }

  const { data: psData } = await supabase.from('parent_students').select('parent_id, student_id')
  const { data: allProfiles } = await supabase.from('profiles').select('user_id, parent_id, first_name, last_name')

  const profileMap = new Map<string, string>()
  for (const p of allProfiles ?? []) {
    profileMap.set(p.user_id, formatUserDisplayName({ first_name: p.first_name, last_name: p.last_name }))
  }

  const childrenByParent = new Map<string, Set<string>>()
  
  for (const row of allProfiles ?? []) {
    if (row.parent_id) {
      const set = childrenByParent.get(row.parent_id) ?? new Set()
      const name = formatUserDisplayName({ first_name: row.first_name, last_name: row.last_name })
      set.add(name)
      childrenByParent.set(row.parent_id, set)
    }
  }

  for (const row of psData ?? []) {
    const set = childrenByParent.get(row.parent_id) ?? new Set()
    const name = profileMap.get(row.student_id)
    if (name) {
      set.add(name)
      childrenByParent.set(row.parent_id, set)
    }
  }

  return parents.map(p => ({
    userId: p.user_id,
    name: formatUserDisplayName(p),
    childrenNames: Array.from(childrenByParent.get(p.user_id) ?? []).join(', ')
  })).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function fetchMessages(
  conversationId: string,
  currentUserId: string,
  limit = 20,
  offset = 0
): Promise<MessageItem[]> {
  // 1. Tenter la RPC get_conversation_messages (SECURITY DEFINER) avec pagination
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_conversation_messages', {
    p_conversation_id: conversationId,
    p_limit: limit,
    p_offset: offset,
  })

  if (!rpcError && rpcData) {
    return (rpcData as any[]).map((m) => ({
      id: String(m.id),
      senderId: String(m.sender_id),
      senderName: String(m.sender_name ?? 'Utilisateur'),
      content: String(m.content ?? ''),
      sentAt: String(m.sent_at),
      isOwn: Boolean(m.is_own),
      type: (m.message_type as 'text' | 'poll') ?? 'text',
      metadata: m.metadata ?? {},
    }))
  }

  // 2. Fallback table direct (sans pagination)
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, sent_at, is_deleted, message_type, metadata')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error) throw error

  const validMessages = (data ?? []).filter((m) => !m.is_deleted)
  const senderIds = [...new Set(validMessages.map((m) => m.sender_id))]
  const names = new Map<string, string>()

  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', senderIds)

    for (const p of profiles ?? []) {
      names.set(p.user_id, formatUserDisplayName(p))
    }
  }

  return validMessages.map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    senderName: names.get(m.sender_id) ?? 'Utilisateur',
    content: m.content,
    sentAt: m.sent_at,
    isOwn: m.sender_id === currentUserId,
    type: (m.message_type as 'text' | 'poll') ?? 'text',
    metadata: m.metadata ?? {},
  }))
}

export async function markConversationAsRead(conversationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('mark_conversation_as_read', {
    p_conversation_id: conversationId,
  })
  if (error) throw error
  return Boolean(data)
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  // 1. Tenter la RPC send_message
  const { error: rpcError } = await supabase.rpc('send_message', {
    p_conversation_id: conversationId,
    p_content: content.trim(),
  })

  if (!rpcError) return

  // 2. Fallback table direct
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: content.trim(),
  })
  if (error) throw error
}

export async function startConversation(recipientId: string, content: string): Promise<string> {
  const { data, error } = await supabase.rpc('start_individual_conversation', {
    p_recipient_id: recipientId,
    p_content: content.trim(),
  })
  if (error) throw error
  return String(data)
}

export async function startGroupConversation(
  title: string,
  participantIds: string[],
  content: string
): Promise<string> {
  const { data, error } = await supabase.rpc('start_group_conversation', {
    p_title: title.trim(),
    p_participant_ids: participantIds,
    p_content: content.trim(),
  })
  if (error) throw error
  return String(data)
}

export async function sendMessageToClass(classId: number, content: string, title?: string): Promise<string> {
  // Si un titre personnalisé est fourni, on utilise la RPC dédiée (SECURITY DEFINER)
  // qui crée toujours une NOUVELLE conversation avec tous les participants de la classe.
  if (title?.trim()) {
    const { data, error } = await supabase.rpc('create_class_group_conversation', {
      p_class_id: classId,
      p_title: title.trim(),
      p_content: content.trim(),
    })
    if (error) throw error
    return String(data)
  }

  // Sans titre personnalisé : utiliser la RPC existante (peut recycler une conversation existante)
  const { data, error } = await supabase.rpc('send_message_to_class', {
    p_class_id: classId,
    p_content: content.trim(),
    p_title: null,
  })
  if (!error) return String(data)

  // Fallback JS si la RPC échoue
  const { data: userResponse } = await supabase.auth.getUser()
  const userId = userResponse.user?.id
  if (!userId) throw new Error('Non authentifié')

  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('name')
    .eq('id', classId)
    .single()
  if (classError) throw classError

  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .insert({ title: `Classe ${classData.name}`, is_group: true, created_by: userId })
    .select('id')
    .single()
  if (convError) throw convError

  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student_id')
    .eq('class_id', classId)

  const participants = [{ conversation_id: convData.id, user_id: userId }]
  for (const en of enrollments ?? []) {
    if (en.student_id !== userId) {
      participants.push({ conversation_id: convData.id, user_id: en.student_id })
    }
  }

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert(participants)
  if (partError) throw partError

  const { error: msgError } = await supabase
    .from('messages')
    .insert({ conversation_id: convData.id, sender_id: userId, content: content.trim() })
  if (msgError) throw msgError

  return String(convData.id)
}

export async function sendPollMessage(
  conversationId: string,
  content: string,
  metadata: any
): Promise<string> {
  const { data, error } = await supabase.rpc('send_poll_message', {
    p_conversation_id: conversationId,
    p_content: content.trim(),
    p_metadata: metadata,
  })
  
  if (!error && data) return String(data)

  // Fallback if RPC fails or doesn't exist yet
  const { data: userResponse } = await supabase.auth.getUser()
  const { data: insertData, error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userResponse.user?.id as string,
      content: content.trim(),
      message_type: 'poll',
      metadata: metadata,
    } as any)
    .select('id')
    .single()
    
  if (insertError) throw insertError
  return insertData.id
}

export async function voteOnPoll(messageId: string, optionIndex: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('vote_on_poll', {
    p_message_id: messageId,
    p_option_index: optionIndex,
  })
  if (error) throw error
  return Boolean(data)
}

export async function fetchPollVotes(messageId: string): Promise<{ optionIndex: number; voteCount: number; voters: { id: string; name: string }[] }[]> {
  const { data, error } = await supabase.rpc('get_poll_votes', {
    p_message_id: messageId,
  })
  if (error) return []
  return (data ?? []).map((row: any) => ({
    optionIndex: Number(row.option_index),
    voteCount: Number(row.vote_count),
    voters: row.voters || [],
  }))
}
