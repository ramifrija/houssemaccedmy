import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Send, AlertTriangle, Info, CheckCircle, Plus, Trash2, DollarSign, MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AnnouncementAudience,
  AnnouncementPriority,
  audienceLabel,

  createAnnouncement,
  deleteAnnouncement,
  fetchAnnouncements,
} from '@/lib/announcements-api'
import { supabase } from '@/integrations/supabase/client'

interface PersonalNotification {
  id: string
  title: string
  content: string
  type: string
  priority: string
  created_at: string
  read_at: string | null
}

const AnnouncementsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<AnnouncementPriority>('medium')
  const [targetAudience, setTargetAudience] = useState<AnnouncementAudience>('all')
  const [notifPage, setNotifPage] = useState(1)
  const itemsPerPage = 8
  const { toast } = useToast()
  const { user, userProfile } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = userProfile?.role === 'admin'

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => fetchAnnouncements(),
  })

  const { data: userNotifications = [], isLoading: loadingNotifs } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as PersonalNotification[]
    },
    enabled: !!user?.id,
  })

  // Temps réel : rafraîchir les notifications dès qu'une nouvelle ligne arrive
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalider le cache pour recharger les notifications
          queryClient.invalidateQueries({ queryKey: ['user-notifications', user.id] })
          // Afficher un toast instantané
          const notif = payload.new as { title?: string; content?: string; type?: string }
          if (notif?.type === 'attendance') {
            toast({
              title: notif.title ?? '🔔 Nouvelle notification',
              description: notif.content,
              variant: 'destructive',
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, queryClient, toast])

  const publish = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Non authentifié')
      await createAnnouncement({
        title,
        content: message,
        priority,
        audience: targetAudience,
        authorId: user.id,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setTitle('')
      setMessage('')
      setPriority('medium')
      setTargetAudience('all')
      setIsDialogOpen(false)
      toast({ title: 'Annonce publiée' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  const remove = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast({ title: 'Annonce supprimée' })
    },
  })

  const getPriorityIcon = (p: AnnouncementPriority | string) => {
    if (p === 'high') return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (p === 'low') return <CheckCircle className="w-4 h-4 text-green-500" />
    return <Info className="w-4 h-4 text-yellow-500" />
  }

  const getPriorityColor = (p: AnnouncementPriority | string) => {
    if (p === 'high') return 'bg-red-50 border-red-200'
    if (p === 'low') return 'bg-green-50 border-green-200'
    return 'bg-yellow-50 border-yellow-200'
  }

  const getNotifTypeIcon = (type: string) => {
    if (type === 'payment') return <DollarSign className="w-4 h-4 text-green-600" />
    if (type === 'attendance') return <AlertTriangle className="w-4 h-4 text-amber-600" />
    return <MessageSquare className="w-4 h-4 text-blue-600" />
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader
          title="Annonces & Notifications"
          description="Communications officielles et relances personnelles"
          actions={
            isAdmin ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle annonce
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white border-school-yellow/20">
                  <DialogHeader>
                    <DialogTitle>Publier une annonce</DialogTitle>
                    <DialogDescription>
                      Cette annonce sera visible par les utilisateurs cibles.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Input
                        placeholder="Titre de l'annonce"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-school-yellow/30"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Contenu de l'annonce..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="border-school-yellow/30 min-h-28"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        value={priority}
                        onValueChange={(val) => setPriority(val as AnnouncementPriority)}
                      >
                        <SelectTrigger className="border-school-yellow/30">
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Faible</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={targetAudience}
                        onValueChange={(val) => setTargetAudience(val as AnnouncementAudience)}
                      >
                        <SelectTrigger className="border-school-yellow/30">
                          <SelectValue placeholder="Public cible" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tout le monde</SelectItem>
                          <SelectItem value="student">Élèves</SelectItem>
                          <SelectItem value="prof">Professeurs</SelectItem>
                          <SelectItem value="parent">Parents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-school-yellow text-school-black"
                      disabled={!title.trim() || !message.trim() || publish.isPending}
                      onClick={() => publish.mutate()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publier
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : undefined
          }
        />

        <div className="p-4 space-y-4 max-w-5xl mx-auto">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="w-full mb-6 max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="announcements">Annonces ({announcements.length})</TabsTrigger>
              <TabsTrigger value="notifications" className="relative">
                Notifications
                {userNotifications.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                    {userNotifications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="announcements" className="space-y-4 mt-0">
              {isLoading ? (
                <p className="text-sm text-center text-school-black/50 py-8">Chargement...</p>
              ) : announcements.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-school-black/50">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    Aucune annonce pour le moment
                  </CardContent>
                </Card>
              ) : (
                announcements.map((announcement) => (
                  <Card key={announcement.id} className={getPriorityColor(announcement.priority)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getPriorityIcon(announcement.priority)}
                          <CardTitle className="text-lg truncate">{announcement.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {audienceLabel(announcement.audience)}
                          </Badge>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => remove.mutate(announcement.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-school-black/80 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                      <div className="flex justify-between text-xs text-school-black/60">
                        <span>Par {announcement.authorName}</span>
                        <span>
                          {new Date(announcement.createdAt).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-0">
              {loadingNotifs ? (
                <p className="text-sm text-center text-school-black/50 py-8">Chargement...</p>
              ) : userNotifications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-school-black/50">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    Aucune notification personnelle
                  </CardContent>
                </Card>
              ) : (
                <>
                  {userNotifications.slice((notifPage - 1) * itemsPerPage, notifPage * itemsPerPage).map((notif) => (
                    <Card key={notif.id} className={`border-l-4 shadow-sm ${notif.read_at ? 'border-gray-200 bg-gray-50/50' : 'border-school-yellow bg-white'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {getNotifTypeIcon(notif.type)}
                            <CardTitle className={`text-base truncate ${notif.read_at ? 'text-gray-500 font-medium' : 'text-school-black font-semibold'}`}>
                              {notif.title}
                            </CardTitle>
                          </div>
                          <span className="text-[10px] text-school-black/50 shrink-0">
                            {new Date(notif.created_at).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm whitespace-pre-wrap ${notif.read_at ? 'text-gray-500' : 'text-school-black/80'}`}>
                          {notif.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {userNotifications.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={notifPage === 1}
                        onClick={() => setNotifPage(p => Math.max(1, p - 1))}
                      >
                        Précédent
                      </Button>
                      <span className="text-sm text-school-black/60 font-medium">
                        Page {notifPage} sur {Math.ceil(userNotifications.length / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={notifPage >= Math.ceil(userNotifications.length / itemsPerPage)}
                        onClick={() => setNotifPage(p => p + 1)}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default AnnouncementsPage
