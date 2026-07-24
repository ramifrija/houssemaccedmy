import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ClassOption, updateUser, UserRow } from '@/lib/users-api'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserRow | null
  isStudent: boolean
  onUpdated?: () => void
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  isStudent,
  onUpdated,
}: EditUserDialogProps) {
  const { toast } = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [classId, setClassId] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string>('approved')
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || !open) return
    setFirstName(user.first_name ?? '')
    setLastName(user.last_name ?? '')
    setEmail(user.email ?? '')
    setClassId(user.class_id ? String(user.class_id) : '')
    setStatus(user.status ?? 'approved')
    setPassword('')
  }, [user, open])

  useEffect(() => {
    if (!open) return
    supabase
      .from('classes')
      .select('id, name')
      .order('name')
      .then(({ data }) => setClasses(data ?? []))
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    try {
      await updateUser({
        user_id: user.user_id,
        first_name: firstName,
        last_name: lastName,
        email,
        status,
        class_id: isStudent ? (classId ? Number(classId) : null) : undefined,
        password: password.trim() || undefined,
      })

      toast({ title: 'Compte mis à jour', description: 'Les modifications ont été enregistrées.' })
      onOpenChange(false)
      onUpdated?.()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Mise à jour impossible',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-school-yellow/20">
        <DialogHeader>
          <DialogTitle>Modifier le compte</DialogTitle>
          <DialogDescription>Mettre à jour les informations de l&apos;utilisateur</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-first_name">Prénom</Label>
              <Input
                id="edit-first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 border-school-yellow/30"
              />
            </div>
            <div>
              <Label htmlFor="edit-last_name">Nom</Label>
              <Input
                id="edit-last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 border-school-yellow/30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 border-school-yellow/30"
            />
          </div>

          <div>
            <Label htmlFor="edit-password">Nouveau mot de passe (optionnel)</Label>
            <Input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laisser vide pour ne pas modifier"
              className="mt-1 border-school-yellow/30"
            />
          </div>

          <div>
            <Label>Statut du compte</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1 border-school-yellow/30">
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approuvé (Validé)</SelectItem>
                <SelectItem value="pending">En attente (Pending)</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isStudent && (
            <div>
              <Label>Classe</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="mt-1 border-school-yellow/30">
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-school-yellow text-school-black hover:bg-school-yellow-dark"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
