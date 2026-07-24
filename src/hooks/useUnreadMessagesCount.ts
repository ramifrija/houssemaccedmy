import { useQuery } from '@tanstack/react-query'
import { fetchMyConversations } from '@/lib/messaging-api'

/**
 * Retourne le nombre total de messages non lus dans toutes les conversations.
 * Rafraîchi toutes les 30 secondes en arrière-plan.
 */
export function useUnreadMessagesCount(): number {
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchMyConversations,
    refetchInterval: 30_000, // rafraîchir toutes les 30s
    staleTime: 15_000,
  })

  return conversations.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0)
}
