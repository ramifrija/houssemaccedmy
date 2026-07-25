import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { MessageSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function GlobalMessageNotification() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [modalData, setModalData] = useState<{ senderName: string; content: string } | null>(null)

  useEffect(() => {
    if (!user) return

    // Écouter les nouveaux messages
    const channel = supabase
      .channel('global_messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new

          // 1. Ignorer si le message vient de nous-même
          if (newMessage.sender_id === user.id) return

          // 2. Ignorer si on est déjà sur la page des messages
          if (location.pathname.includes('/messaging')) return

          // 3. Récupérer les infos de l'expéditeur pour l'affichage
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()

          const senderName = profile
            ? `${profile.first_name} ${profile.last_name}`
            : 'Un utilisateur'
            
          // Afficher la modale (popup) au lieu d'un simple toast
          setModalData({
            senderName,
            content: newMessage.content,
          })
          setOpen(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, location.pathname]) // On retire navigate des dépendances pour éviter des re-renders inutiles

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Nouveau message reçu !</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            <strong>{modalData?.senderName}</strong> vous a envoyé un message :
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted p-4 rounded-md my-2 italic text-sm text-foreground break-words max-h-32 overflow-y-auto">
          "{modalData?.content && modalData.content.length > 150 
            ? modalData.content.substring(0, 150) + '...' 
            : modalData?.content}"
        </div>

        <DialogFooter className="sm:justify-center flex-row gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Fermer
          </Button>
          <Button 
            className="flex-1"
            onClick={() => {
              setOpen(false)
              navigate('/messaging')
            }}
          >
            Répondre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
