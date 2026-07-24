import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserRow, fetchParentChildren, assignStudentToParent, removeStudentFromParent } from '@/lib/users-api'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, UserCheck } from 'lucide-react'

interface ManageParentChildrenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parent: UserRow | null
  allStudents: UserRow[]
  onChanged?: () => void
}

export function ManageParentChildrenDialog({
  open,
  onOpenChange,
  parent,
  allStudents,
  onChanged,
}: ManageParentChildrenDialogProps) {
  const { toast } = useToast()
  const [children, setChildren] = useState<UserRow[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadChildren = async () => {
    if (!parent) return
    setLoading(true)
    try {
      const data = await fetchParentChildren(parent.user_id)
      setChildren(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && parent) {
      void loadChildren()
    }
  }, [open, parent])

  const handleAddChild = async () => {
    if (!parent || !selectedStudentId) return
    setSubmitting(true)
    try {
      await assignStudentToParent(parent.user_id, selectedStudentId)
      toast({
        title: 'Élève rattaché',
        description: 'L\'enfant a été associé au parent avec succès.',
      })
      setSelectedStudentId('')
      await loadChildren()
      onChanged?.()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de rattacher l\'enfant',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveChild = async (studentId: string) => {
    if (!parent) return
    try {
      await removeStudentFromParent(parent.user_id, studentId)
      toast({
        title: 'Lien retiré',
        description: 'L\'enfant n\'est plus rattaché à ce parent.',
      })
      await loadChildren()
      onChanged?.()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de retirer l\'enfant',
      })
    }
  }

  const availableStudents = allStudents.filter(
    (s) => !children.some((c) => c.user_id === s.user_id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-school-yellow" />
            Enfants associés
          </DialogTitle>
          <DialogDescription>
            Gérer les enfants rattachés au parent{' '}
            <span className="font-semibold text-school-black">
              {parent ? formatUserDisplayName(parent) : ''}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Liste des enfants déjà rattachés */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-school-black/60">
              Enfants rattachés ({children.length})
            </h4>
            {loading ? (
              <p className="text-sm text-school-black/50">Chargement...</p>
            ) : children.length === 0 ? (
              <p className="text-sm text-school-black/50 italic bg-gray-50 p-3 rounded-md text-center">
                Aucun enfant associé pour le moment.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {children.map((child) => (
                  <div
                    key={child.user_id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-school-yellow/20 bg-white"
                  >
                    <div>
                      <p className="text-sm font-medium text-school-black">
                        {formatUserDisplayName(child)}
                      </p>
                      <p className="text-xs text-school-black/60">{child.email ?? 'Pas d\'email'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemoveChild(child.user_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ajouter un enfant */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-xs font-semibold uppercase text-school-black/60">
              Rattacher un nouvel enfant
            </h4>
            <div className="flex gap-2">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un élève..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {formatUserDisplayName(student)} {student.class_name ? `(${student.class_name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                disabled={!selectedStudentId || submitting}
                onClick={handleAddChild}
                className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
