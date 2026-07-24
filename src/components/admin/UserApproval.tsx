import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { User, Check, X, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLE_IDS } from '@/lib/role-ids'
import { formatUserDisplayName } from '@/lib/display-user-name'

interface PendingUser {
  id: string
  user_id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  requested_role?: string | null
  created_at: string
}

interface UserApprovalProps {
  onChanged?: () => void
}

export const UserApproval = ({ onChanged }: UserApprovalProps) => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, requested_role, created_at')
        .is('role_id', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending users:', error)
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: error.message || 'Impossible de charger les demandes en attente',
        })
        return
      }

      setPendingUsers(
        (profiles ?? []).map((profile) => ({
          ...profile,
          email: profile.email || `Compte ${profile.user_id.slice(0, 8)}…`,
        }))
      )
    } catch (error) {
      console.error('Error in fetchPendingUsers:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string, roleId: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId, status: 'approved' })
        .eq('user_id', userId)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible d'approuver l'utilisateur",
        })
        return
      }

      toast({
        title: 'Utilisateur approuvé',
        description: "L'utilisateur peut maintenant se connecter.",
      })

      fetchPendingUsers()
      onChanged?.()
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId)

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: "Impossible de rejeter l'utilisateur",
        })
        return
      }

      toast({
        title: 'Utilisateur rejeté',
        description: 'La demande a été supprimée.',
      })

      fetchPendingUsers()
      onChanged?.()
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const roleLabel = (role?: string | null) => {
    if (role === 'parent') return 'Parent'
    if (role === 'student') return 'Étudiant'
    return 'Non précisé'
  }

  if (loading) {
    return (
      <Card className="border-school-yellow/20">
        <CardContent className="py-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Aucune demande d&apos;inscription en attente
      </div>
    )
  }

  return (
    <Card className="border-school-yellow/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Validation des comptes ({pendingUsers.length})
        </CardTitle>
        <CardDescription>Demandes d&apos;inscription en attente de validation administrateur</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Demande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">{formatUserDisplayName(user)}</p>
                  </TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{roleLabel(user.requested_role)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveUser(user.user_id, ROLE_IDS.student)}
                        className="text-green-700 border-green-200 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Étudiant
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approveUser(user.user_id, ROLE_IDS.parent)}
                        className="text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Parent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectUser(user.user_id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
