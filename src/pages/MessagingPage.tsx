import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare, Send, Search, Users, ArrowLeft, Plus, Check, UserCheck, X, Building2, Loader2,
  Eye, Shield, Filter, Lock, BarChart2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import {
  ContactItem,
  ConversationItem,
  fetchAdminAllConversations,
  fetchMessageableClasses,
  fetchMessageableContacts,
  fetchMessages,
  fetchMyConversations,
  sendMessage,
  sendMessageToClass,
  startConversation,
  startGroupConversation,
  markConversationAsRead,
  sendPollMessage,
} from '@/lib/messaging-api'
import { CreatePollDialog } from '@/components/messaging/CreatePollDialog'
import { PollMessage } from '@/components/messaging/PollMessage'
import { queryKeys } from '@/lib/query-keys'

const MessagingPage = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [messagesLimit, setMessagesLimit] = useState(25)

  // Supervision Admin
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const [adminMode, setAdminMode] = useState<'my' | 'all'>('my')
  const [adminUserFilter, setAdminUserFilter] = useState<string>('all')

  // Modal Nouveau Message
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [createPollOpen, setCreatePollOpen] = useState(false)
  const [recipientType, setRecipientType] = useState<'individual' | 'class'>('individual')
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [groupTitle, setGroupTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [firstMessage, setFirstMessage] = useState('')

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Conversations personnelles
  const { data: myConversations = [], isLoading: loadingMyConvs } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchMyConversations,
    refetchInterval: 3000,
  })

  // Toutes les conversations (Supervision Admin)
  const { data: allAdminConversations = [], isLoading: loadingAllConvs } = useQuery({
    queryKey: ['admin-all-conversations', adminUserFilter],
    queryFn: () => fetchAdminAllConversations(adminUserFilter === 'all' ? undefined : adminUserFilter),
    enabled: isAdmin && adminMode === 'all',
  })

  const { data: contacts = [] } = useQuery({
    queryKey: queryKeys.messageableContacts,
    queryFn: fetchMessageableContacts,
    enabled: (newChatOpen && recipientType === 'individual') || (isAdmin && adminMode === 'all'),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['messageable-classes'],
    queryFn: fetchMessageableClasses,
    enabled: newChatOpen && recipientType === 'class',
  })

  const { data: messages = [], isLoading: loadingMessages, isError: messagesError, error: messagesFetchError } = useQuery({
    queryKey: selectedConversation ? ['messages', selectedConversation, messagesLimit] : ['messages', 'none'],
    enabled: !!selectedConversation && !!user?.id,
    queryFn: () => fetchMessages(selectedConversation!, user!.id, messagesLimit, 0),
    refetchInterval: 3000,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Souscription Realtime pour les messages dans la conversation active
  useEffect(() => {
    if (!selectedConversation || !user?.id) return

    const channel = supabase
      .channel(`messages-conv-${selectedConversation}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation}` },
        async (payload) => {
          const newMsg = payload.new as any

          // Mise à jour instantanée du cache — aucun appel serveur
          queryClient.setQueryData(
            ['messages', selectedConversation, messagesLimit],
            (oldData: any) => {
              if (!oldData) return oldData
              if (oldData.some((m: any) => m.id === newMsg.id)) return oldData

              const isOwn = newMsg.sender_id === user?.id
              return [
                ...oldData,
                {
                  id: newMsg.id,
                  senderId: newMsg.sender_id,
                  senderName: isOwn ? 'Moi' : '',
                  content: newMsg.content,
                  sentAt: newMsg.sent_at,
                  isOwn,
                  type: newMsg.message_type || 'text',
                  metadata: newMsg.metadata,
                },
              ]
            }
          )

          // Rafraichir la liste des conversations (compteurs non-lus, dernier message)
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
          if (isAdmin) {
            queryClient.invalidateQueries({ queryKey: ['admin-all-conversations'] })
          }

          // Marquer la conversation comme lue
          try {
            await markConversationAsRead(selectedConversation)
          } catch (e) {
            console.error(e)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, messagesLimit, queryClient, isAdmin, user?.id])

  // Souscription Realtime pour la liste des conversations (nouveaux messages entrants)
  useEffect(() => {
    if (!user?.id) return

    const convChannel = supabase
      .channel('conversations-list-update')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
          if (isAdmin) {
            queryClient.invalidateQueries({ queryKey: ['admin-all-conversations'] })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(convChannel)
    }
  }, [user?.id, queryClient, isAdmin])

  const sendExisting = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation || !user?.id) throw new Error('Conversation invalide')
      await sendMessage(selectedConversation, user.id, content)
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['messages', selectedConversation] })
      
      const previousMessages = queryClient.getQueryData(['messages', selectedConversation, messagesLimit])
      
      queryClient.setQueryData(['messages', selectedConversation, messagesLimit], (old: any) => {
        const optimisticMsg = {
          id: `temp-${Date.now()}`,
          senderId: user?.id,
          senderName: 'Moi',
          content,
          sentAt: new Date().toISOString(),
          isOwn: true,
          type: 'text',
          metadata: null,
        }
        return old ? [...old, optimisticMsg] : [optimisticMsg]
      })

      setNewMessage('')
      
      return { previousMessages }
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(['messages', selectedConversation, messagesLimit], context?.previousMessages)
      toast({ variant: 'destructive', title: 'Erreur', description: "Le message n'a pas pu être envoyé" })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })

  const startNewChat = useMutation({
    mutationFn: async () => {
      if (!firstMessage.trim()) throw new Error('Message requis')

      if (recipientType === 'class') {
        if (!selectedClass) throw new Error('Veuillez choisir une classe')
        return sendMessageToClass(Number(selectedClass), firstMessage.trim())
      }

      if (selectedContactIds.length === 0) {
        throw new Error('Veuillez sélectionner au moins un contact')
      }

      if (selectedContactIds.length === 1) {
        return startConversation(selectedContactIds[0], firstMessage.trim())
      } else {
        const title = groupTitle.trim() || 'Groupe de discussion'
        return startGroupConversation(title, selectedContactIds, firstMessage.trim())
      }
    },
    onSuccess: async (conversationId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
      if (isAdmin) {
        await queryClient.invalidateQueries({ queryKey: ['admin-all-conversations'] })
      }
      setSelectedConversation(conversationId)
      setNewChatOpen(false)
      setSelectedContactIds([])
      setSelectedClass('')
      setGroupTitle('')
      setFirstMessage('')
      setContactSearch('')
      setRecipientType('individual')
      toast({
        title: recipientType === 'class'
          ? 'Groupe de classe démarré'
          : selectedContactIds.length > 1
          ? 'Groupe de discussion créé'
          : 'Conversation démarrée'
      })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  // Ouvrir une conversation : reset pagination + marquer comme lu
  const handleSelectConversation = async (convId: string) => {
    if (convId === selectedConversation) return
    setSelectedConversation(convId)
    setMessagesLimit(25)
    const readOnly = isAdmin && adminMode === 'all'
    if (!readOnly) {
      try {
        await markConversationAsRead(convId)
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const handleLoadMore = () => {
    setMessagesLimit((prev) => prev + 25)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    try {
      await sendExisting.mutateAsync(newMessage.trim())
      setNewMessage('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Envoi impossible',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  const handleSendPoll = async (question: string, options: string[]) => {
    if (!selectedConversation) return
    try {
      await sendPollMessage(selectedConversation, question, { question, options })
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] })
      toast({ title: 'Sondage envoyé' })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Envoi impossible',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  const toggleContactSelection = (userId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(contactSearch.toLowerCase())
  )

  // Choisir les conversations à afficher selon le mode Admin ou Utilisateur
  const displayedConversations: ConversationItem[] = isAdmin && adminMode === 'all'
    ? allAdminConversations.map((c) => ({
        id: c.id,
        name: c.name,
        otherUserId: null,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        role: 'admin',
        isGroup: c.isGroup,
      }))
    : myConversations

  const filteredConversations = displayedConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedConv = displayedConversations.find((c) => c.id === selectedConversation)
  const isReadOnlyAdmin = isAdmin && adminMode === 'all'

  return (
    <>
      <PageHeader
        title="Messagerie"
        description="Communication entre professeurs, élèves et administration"
        actions={
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-school-black">
                  <MessageSquare className="w-5 h-5" />
                  Nouvelle conversation
                </DialogTitle>
                <DialogDescription>
                  Recherchez des contacts ou sélectionnez toute une classe pour démarrer une discussion.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2 p-1 bg-school-gray-light rounded-lg border border-school-yellow/20">
                  <Button
                    type="button"
                    variant={recipientType === 'individual' ? 'default' : 'ghost'}
                    size="sm"
                    className={recipientType === 'individual' ? 'bg-school-yellow text-school-black shadow-xs font-semibold' : 'text-school-black/70'}
                    onClick={() => setRecipientType('individual')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Contact(s) / Groupe
                  </Button>
                  <Button
                    type="button"
                    variant={recipientType === 'class' ? 'default' : 'ghost'}
                    size="sm"
                    className={recipientType === 'class' ? 'bg-school-yellow text-school-black shadow-xs font-semibold' : 'text-school-black/70'}
                    onClick={() => setRecipientType('class')}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Groupe de Classe
                  </Button>
                </div>

                {recipientType === 'individual' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher un contact par nom ou rôle..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="pl-9 border-school-yellow/30 focus:border-school-yellow"
                      />
                    </div>

                    {selectedContactIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-school-yellow/10 rounded-lg border border-school-yellow/20 max-h-24 overflow-y-auto">
                        {selectedContactIds.map((id) => {
                          const contact = contacts.find((c) => c.userId === id)
                          return (
                            <Badge
                              key={id}
                              className="bg-school-yellow text-school-black hover:bg-school-yellow-dark flex items-center gap-1 text-xs"
                            >
                              {contact?.name ?? 'Contact'}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-red-700"
                                onClick={() => toggleContactSelection(id)}
                              />
                            </Badge>
                          )
                        })}
                      </div>
                    )}

                    {selectedContactIds.length > 1 && (
                      <Input
                        placeholder="Nom du groupe de discussion (optionnel)"
                        value={groupTitle}
                        onChange={(e) => setGroupTitle(e.target.value)}
                        className="border-school-yellow/30"
                      />
                    )}

                    <div className="border border-school-yellow/20 rounded-lg max-h-48 overflow-y-auto divide-y divide-school-yellow/10">
                      {filteredContacts.length === 0 ? (
                        <p className="p-4 text-xs text-school-black/50 text-center">Aucun contact trouvé</p>
                      ) : (
                        filteredContacts.map((contact) => {
                          const isSelected = selectedContactIds.includes(contact.userId)
                          return (
                            <div
                              key={contact.userId}
                              onClick={() => toggleContactSelection(contact.userId)}
                              className={cn(
                                'flex items-center justify-between p-2.5 cursor-pointer hover:bg-school-yellow/5 transition-colors',
                                isSelected && 'bg-school-yellow/10'
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleContactSelection(contact.userId)} />
                                <div>
                                  <p className="text-sm font-medium text-school-black">{contact.name}</p>
                                </div>
                              </div>
                              <Badge
                                variant={contact.role === 'teacher' ? 'default' : contact.role === 'admin' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {contact.role === 'teacher' ? 'Prof' : contact.role === 'admin' ? 'Admin' : 'Élève'}
                              </Badge>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-school-black">Sélectionner une classe :</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="border-school-yellow/30">
                        <SelectValue placeholder="Choisir une classe pour créer le groupe..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {classes.map((cls) => (
                          <SelectItem key={cls.classId} value={String(cls.classId)}>
                            🏫 {cls.name} ({cls.studentCount} élève{cls.studentCount > 1 ? 's' : ''})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Textarea
                  placeholder="Écrivez votre message..."
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  rows={3}
                  className="border-school-yellow/30 focus:border-school-yellow"
                />

                <Button
                  className="w-full bg-school-yellow text-school-black hover:bg-school-yellow-dark font-medium"
                  disabled={
                    !firstMessage.trim() ||
                    startNewChat.isPending ||
                    (recipientType === 'individual' ? selectedContactIds.length === 0 : !selectedClass)
                  }
                  onClick={() => startNewChat.mutate()}
                >
                  {startNewChat.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {recipientType === 'class'
                    ? 'Créer le groupe de classe & envoyer'
                    : selectedContactIds.length > 1
                    ? 'Créer le groupe de discussion'
                    : 'Démarrer la conversation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col lg:flex-row h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-5.5rem)]">
        {/* Sidebar des conversations */}
        <div
          className={cn(
            'flex flex-col w-full lg:w-80 xl:w-96 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-school-yellow/20 max-h-[50dvh] lg:max-h-none',
            selectedConversation ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Mode Admin Supervision */}
          {isAdmin && (
            <div className="p-3 border-b bg-school-yellow/5 space-y-2">
              <div className="flex rounded-md p-1 bg-white border border-school-yellow/20">
                <Button
                  variant={adminMode === 'my' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('flex-1 text-xs h-7', adminMode === 'my' ? 'bg-school-yellow text-school-black font-semibold' : 'text-school-black/70')}
                  onClick={() => { setAdminMode('my'); setSelectedConversation(null) }}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  Mes Messages
                </Button>
                <Button
                  variant={adminMode === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn('flex-1 text-xs h-7', adminMode === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-school-black/70')}
                  onClick={() => { setAdminMode('all'); setSelectedConversation(null) }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Supervision (Tous)
                </Button>
              </div>

              {adminMode === 'all' && (
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-school-black/50 shrink-0" />
                  <Select value={adminUserFilter} onValueChange={setAdminUserFilter}>
                    <SelectTrigger className="h-8 text-xs border-school-yellow/30 bg-white">
                      <SelectValue placeholder="Filtrer par utilisateur..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      {contacts.map((c) => (
                        <SelectItem key={c.userId} value={c.userId}>
                          {c.name} ({c.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="p-3 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {(adminMode === 'all' ? loadingAllConvs : loadingMyConvs) ? (
              <p className="p-4 text-sm text-school-black/60 text-center">Chargement des discussions...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="p-4 text-sm text-school-black/60 text-center">
                Aucune conversation trouvée.
              </p>
            ) : (
            filteredConversations.map((conversation: ConversationItem) => {
                const unread = conversation.unreadCount ?? 0
                const hasUnread = unread > 0 && selectedConversation !== conversation.id
                return (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={cn(
                    'p-3.5 border-b cursor-pointer hover:bg-school-yellow/5 transition-colors',
                    selectedConversation === conversation.id && 'bg-school-yellow/10 border-l-4 border-l-school-yellow',
                    hasUnread && 'bg-blue-50/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 shrink-0">
                        <div className="w-9 h-9 bg-school-yellow/20 rounded-full flex items-center justify-center">
                          {conversation.isGroup ? (
                            <Building2 className="w-4 h-4 text-school-black" />
                          ) : (
                            <Users className="w-4 h-4 text-school-black" />
                          )}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-school-black' : 'font-medium text-school-black')}>
                          {conversation.name}
                        </p>
                        <p className={cn('text-xs truncate mt-0.5', hasUnread ? 'text-school-black/80 font-medium' : 'text-school-black/60')}>
                          {conversation.lastMessage || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Zone de chat active */}
        <div
          className={cn(
            'flex flex-1 flex-col min-w-0 min-h-0 bg-school-gray-light',
            !selectedConversation ? 'hidden lg:flex' : 'flex'
          )}
        >
          {selectedConversation && selectedConv ? (
            <>
              {/* Header discussion */}
              <div className="p-4 bg-white border-b border-school-yellow/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="w-10 h-10 bg-school-yellow/20 rounded-full flex items-center justify-center">
                    {selectedConv.isGroup ? (
                      <Building2 className="w-5 h-5 text-school-black" />
                    ) : (
                      <Users className="w-5 h-5 text-school-black" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-school-black text-sm lg:text-base">
                      {selectedConv.name}
                    </h3>
                    <p className="text-xs text-school-black/60">
                      {selectedConv.isGroup ? 'Groupe de discussion' : 'Discussion individuelle'}
                    </p>
                  </div>
                </div>

                {isReadOnlyAdmin && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Supervision Admin (Lecture seule)
                  </Badge>
                )}
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" id="messages-scroll-container">
                {loadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-school-black/40" />
                  </div>
                ) : messagesError ? (
                  <p className="text-center text-sm text-red-600 py-8">
                    {(messagesFetchError as Error)?.message || 'Erreur de chargement des messages.'}
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-school-black/60 py-8">
                    Aucun message dans cette conversation.
                  </p>
                ) : (
                  <>
                    {/* Bouton Charger plus en haut — style Messenger */}
                    {messages.length >= messagesLimit && (
                      <div className="flex justify-center">
                        <button
                          onClick={handleLoadMore}
                          className="text-xs text-school-black/60 hover:text-school-black px-4 py-1.5 rounded-full bg-white border border-school-yellow/20 hover:bg-school-yellow/5 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          ↑ Charger des messages plus anciens
                        </button>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div key={msg.id}>
                        {msg.type === 'poll' ? (
                          <PollMessage
                            messageId={msg.id}
                            senderName={msg.senderName}
                            sentAt={msg.sentAt}
                            isOwn={msg.isOwn}
                            metadata={msg.metadata}
                          />
                        ) : (
                          <div
                            className={cn('flex flex-col max-w-[85%] lg:max-w-[70%]', msg.isOwn ? 'ml-auto items-end' : 'mr-auto items-start')}
                          >
                            {!msg.isOwn && (
                              <span className="text-xs text-school-black/60 mb-1 px-1">{msg.senderName}</span>
                            )}
                            <div
                              className={cn(
                                'p-3 rounded-2xl text-sm break-words',
                                msg.isOwn
                                  ? 'bg-school-yellow text-school-black rounded-tr-none shadow-xs'
                                  : 'bg-white text-school-black border border-school-yellow/20 rounded-tl-none shadow-xs'
                              )}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-school-black/40 mt-1 px-1">
                              {new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Footer envoi message / Read-only alert */}
              <div className="p-4 bg-white border-t border-school-yellow/20 shrink-0">
                {isReadOnlyAdmin ? (
                  <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                    <Lock className="w-4 h-4 mr-2 shrink-0 text-blue-600" />
                    Mode consultation administrateur : les messages sont affichés en lecture seule.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border-school-yellow/30 focus:border-school-yellow"
                    />
                    {isAdmin && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreatePollOpen(true)}
                        className="text-school-black border-school-yellow/30"
                        title="Créer un sondage"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                      disabled={!newMessage.trim() || sendExisting.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-school-black/50">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">Choisissez une conversation dans la liste ou démarrer-en une nouvelle.</p>
            </div>
          )}
        </div>
      </div>
      
      <CreatePollDialog 
        open={createPollOpen} 
        onOpenChange={setCreatePollOpen} 
        onSendPoll={handleSendPoll} 
      />
    </>
  )
}

export default MessagingPage
