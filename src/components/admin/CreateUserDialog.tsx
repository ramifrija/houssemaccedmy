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
import { adminCreateUser } from '@/lib/admin-create-user'
import { CreatableRole, ROLE_LABELS } from '@/lib/role-ids'
import { supabase } from '@/integrations/supabase/client'
import { Loader2 } from 'lucide-react'

interface ClassOption {
  id: number
  name: string
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: CreatableRole
  onCreated?: () => void
}

export function CreateUserDialog({
  open,
  onOpenChange,
  defaultRole,
  onCreated,
}: CreateUserDialogProps) {
  const { toast } = useToast()
  const [role, setRole] = useState<CreatableRole>(defaultRole)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [classId, setClassId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setRole(defaultRole)
    }
  }, [open, defaultRole])

  useEffect(() => {
    if (!open) return
    supabase
      .from('classes')
      .select('id, name')
      .order('name')
      .then(({ data }) => setClasses(data ?? []))
  }, [open])

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setClassId('')
    setSubject('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { userId, error } = await adminCreateUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
        class_id: classId ? Number(classId) : undefined,
        subject: role === 'teacher' ? subject : undefined,
      })

      if (error || !userId) {
        toast({
          variant: 'destructive',
          title: 'Création impossible',
          description: error?.message ?? 'Une erreur est survenue.',
        })
        return
      }

      toast({
        title: `${ROLE_LABELS[role]} créé`,
        description: `Le compte ${email} est prêt à être utilisé.`,
      })

      resetForm()
      onOpenChange(false)
      onCreated?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-school-yellow/20">
        <DialogHeader>
          <DialogTitle>Ajouter un {ROLE_LABELS[role].toLowerCase()}</DialogTitle>
          <DialogDescription>
            Créez un compte avec email et mot de passe. L&apos;utilisateur pourra se connecter immédiatement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 border-school-yellow/30"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 border-school-yellow/30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="exemple@email.com"
              className="mt-1 border-school-yellow/30"
            />
          </div>

          <div>
            <Label htmlFor="create-password">Mot de passe temporaire</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="8 caractères minimum"
              className="mt-1 border-school-yellow/30"
            />
          </div>

          <div>
            <Label>Rôle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as CreatableRole)}>
              <SelectTrigger className="mt-1 border-school-yellow/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Élève</SelectItem>
                <SelectItem value="teacher">Professeur</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'student' && (
            <div>
              <Label>Classe (optionnel)</Label>
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

          {role === 'teacher' && (
            <div>
              <Label htmlFor="subject">Matière (optionnel)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Mathématiques"
                className="mt-1 border-school-yellow/30"
              />
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
                  Création...
                </>
              ) : (
                'Créer le compte'
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
