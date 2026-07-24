import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, RefreshCw, Pencil, Trash2, Users as UsersIcon, ShieldCheck, ShieldOff, Mail, Calendar, BookOpen, GraduationCap, UserCircle2 } from 'lucide-react'
import { UserApproval } from '@/components/admin/UserApproval'
import { CreateUserDialog } from '@/components/admin/CreateUserDialog'
import { EditUserDialog } from '@/components/admin/EditUserDialog'
import { ManageParentChildrenDialog } from '@/components/admin/ManageParentChildrenDialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CreatableRole } from '@/lib/role-ids'
import { Skeleton } from '@/components/ui/skeleton'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { deleteUser, fetchStudents, fetchTeachers, fetchParents, fetchAdmins, updateUserStatus, UserRow } from '@/lib/users-api'
import { queryKeys } from '@/lib/query-keys'
import { useToast } from '@/hooks/use-toast'

function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-10 space-y-3">
      <p className="text-sm text-red-600">Impossible de charger la liste : {message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Réessayer
      </Button>
    </div>
  )
}

const Users = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogRole, setDialogRole] = useState<CreatableRole>('student')
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editIsStudent, setEditIsStudent] = useState(false)
  const [parentManageUser, setParentManageUser] = useState<UserRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    data: students = [],
    isLoading: loadingStudents,
    isError: studentsError,
    error: studentsErrorDetail,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: queryKeys.adminStudents,
    queryFn: fetchStudents,
  })

  const {
    data: teachers = [],
    isLoading: loadingTeachers,
    isError: teachersError,
    error: teachersErrorDetail,
    refetch: refetchTeachers,
  } = useQuery({
    queryKey: queryKeys.adminTeachers,
    queryFn: fetchTeachers,
  })

  const {
    data: parents = [],
    isLoading: loadingParents,
    isError: parentsError,
    error: parentsErrorDetail,
    refetch: refetchParents,
  } = useQuery({
    queryKey: ['adminParents'],
    queryFn: fetchParents,
  })

  const {
    data: admins = [],
    isLoading: loadingAdmins,
    isError: adminsError,
    error: adminsErrorDetail,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ['adminAdmins'],
    queryFn: fetchAdmins,
  })

  const openCreateDialog = (role: CreatableRole) => {
    setDialogRole(role)
    setDialogOpen(true)
  }

  const refreshAll = () => {
    refetchStudents()
    refetchTeachers()
    refetchParents()
    refetchAdmins()
    queryClient.invalidateQueries({ queryKey: queryKeys.adminPending })
  }

  const filterUsers = (users: UserRow[]) => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const name = formatUserDisplayName(u).toLowerCase()
      const rawName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase()
      const email = (u.email ?? '').toLowerCase()
      const cls = (u.class_name ?? '').toLowerCase()
      return name.includes(q) || rawName.includes(q) || email.includes(q) || cls.includes(q)
    })
  }

  const filteredStudents = useMemo(() => filterUsers(students), [students, search])
  const filteredTeachers = useMemo(() => filterUsers(teachers), [teachers, search])
  const filteredParents = useMemo(() => filterUsers(parents), [parents, search])
  const filteredAdmins = useMemo(() => filterUsers(admins), [admins, search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.user_id)
      toast({ title: 'Compte supprimé', description: 'Le profil a été retiré de la plateforme.' })
      setDeleteTarget(null)
      refreshAll()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Suppression impossible',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (user: UserRow) => {
    const newStatus = user.status === 'approved' ? 'rejected' : 'approved'
    try {
      await updateUserStatus(user.user_id, newStatus)
      toast({
        title: newStatus === 'approved' ? 'Compte approuvé' : 'Compte suspendu',
        description: `Le statut de ${formatUserDisplayName(user)} a été mis à jour.`,
      })
      refreshAll()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de mise à jour',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
      })
    }
  }

  const renderStatusBadge = (status: string | null | undefined) => {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-800 border-red-200">Suspendu</Badge>
    return <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">En attente</Badge>
  }

  const renderActions = (user: UserRow, isStudent: boolean, isParent: boolean = false) => (
    <div className="flex gap-1 justify-end">
      {isParent && (
        <Button
          variant="outline"
          size="sm"
          className="border-school-yellow/40 hover:bg-school-yellow/10"
          onClick={() => setParentManageUser(user)}
        >
          <UsersIcon className="w-4 h-4 mr-1 text-school-black" />
          Enfants
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setEditUser(user)
          setEditIsStudent(isStudent)
        }}
        aria-label="Modifier"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-red-50 hover:text-red-600"
        onClick={() => setDeleteTarget(user)}
        aria-label="Supprimer"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  // Génère les initiales à partir du nom complet
  const getInitials = (user: UserRow) => {
    const first = (user.first_name ?? '').charAt(0).toUpperCase()
    const last = (user.last_name ?? '').charAt(0).toUpperCase()
    return first + last || '?'
  }

  // Palette de couleurs pour les avatars
  const avatarColors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
  ]
  const getAvatarColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length]

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader
          title="Gestion des Utilisateurs"
          description="Créer et gérer les comptes élèves, professeurs et parents"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-school-black/40 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-48 lg:w-64 border-school-yellow/30"
                />
              </div>
              <Button variant="outline" size="sm" onClick={refreshAll} aria-label="Actualiser">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          }
        />

        <div className="px-4 lg:px-6 pb-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-school-black/40 w-4 h-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-school-yellow/30"
            />
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4">
          <UserApproval onChanged={refreshAll} />

          <Tabs defaultValue="students" className="space-y-4">
            <TabsList className="bg-white border border-school-yellow/20">
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-school-yellow data-[state=active]:text-school-black"
              >
                Élèves ({students.length})
              </TabsTrigger>
              <TabsTrigger
                value="teachers"
                className="data-[state=active]:bg-school-yellow data-[state=active]:text-school-black"
              >
                Professeurs ({teachers.length})
              </TabsTrigger>
              <TabsTrigger
                value="parents"
                className="data-[state=active]:bg-school-yellow data-[state=active]:text-school-black"
              >
                Parents ({parents.length})
              </TabsTrigger>
              <TabsTrigger
                value="admins"
                className="data-[state=active]:bg-school-yellow data-[state=active]:text-school-black"
              >
                Administrateurs ({admins.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <Card className="border-school-yellow/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-school-black">Liste des élèves</CardTitle>
                      <CardDescription>Comptes actifs enregistrés dans l&apos;établissement</CardDescription>
                    </div>
                    <Button
                      className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                      onClick={() => openCreateDialog('student')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un élève
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingStudents ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : studentsError ? (
                    <ListError
                      message={(studentsErrorDetail as Error)?.message ?? 'Erreur inconnue'}
                      onRetry={() => refetchStudents()}
                    />
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-16">
                      <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-school-black/50">
                        {search ? 'Aucun élève ne correspond à la recherche.' : 'Aucun élève enregistré. Cliquez sur « Ajouter un élève ».'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredStudents.map((student) => {
                        const initials = (student.first_name ?? '').charAt(0).toUpperCase() + (student.last_name ?? '').charAt(0).toUpperCase() || '?'
                        const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500']
                        const color = colors[student.id.charCodeAt(0) % colors.length]
                        return (
                          <div
                            key={student.id}
                            className="relative flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-school-yellow/40 transition-all group"
                          >
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{formatUserDisplayName(student)}</p>
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  {student.email ?? '—'}
                                </p>
                              </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {student.class_name ? (
                                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                                  <BookOpen className="w-3 h-3" />
                                  {student.class_name}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Sans classe</span>
                              )}
                              {renderStatusBadge(student.status)}
                              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {new Date(student.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 justify-between border-t border-slate-50 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                title={student.status === 'approved' ? 'Suspendre' : 'Approuver'}
                                onClick={() => handleToggleStatus(student)}
                                className={`h-7 px-2 text-xs gap-1 ${student.status === 'approved' ? 'hover:bg-amber-50 hover:text-amber-600' : 'hover:bg-green-50 hover:text-green-600'}`}
                              >
                                {student.status === 'approved' ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                {student.status === 'approved' ? 'Suspendre' : 'Approuver'}
                              </Button>
                              <div className="flex gap-0.5">
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 w-7 p-0 hover:bg-school-yellow/10"
                                  onClick={() => { setEditUser(student); setEditIsStudent(true) }}
                                  aria-label="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => setDeleteTarget(student)}
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers">
              <Card className="border-school-yellow/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-school-black">Liste des professeurs</CardTitle>
                      <CardDescription>Comptes enseignants actifs</CardDescription>
                    </div>
                    <Button
                      className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                      onClick={() => openCreateDialog('teacher')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un professeur
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingTeachers ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : teachersError ? (
                    <ListError
                      message={(teachersErrorDetail as Error)?.message ?? 'Erreur inconnue'}
                      onRetry={() => refetchTeachers()}
                    />
                  ) : filteredTeachers.length === 0 ? (
                    <div className="text-center py-16">
                      <UserCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-school-black/50">
                        {search ? 'Aucun professeur ne correspond à la recherche.' : 'Aucun professeur enregistré. Cliquez sur « Ajouter un professeur ».'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredTeachers.map((teacher) => {
                        const initials = (teacher.first_name ?? '').charAt(0).toUpperCase() + (teacher.last_name ?? '').charAt(0).toUpperCase() || '?'
                        const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500']
                        const color = colors[teacher.id.charCodeAt(0) % colors.length]
                        return (
                          <div
                            key={teacher.id}
                            className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-school-yellow/40 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">{formatUserDisplayName(teacher)}</p>
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  {teacher.email ?? '—'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">Actif</Badge>
                              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {new Date(teacher.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>

                            <div className="flex justify-end gap-0.5 border-t border-slate-50 pt-2">
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 hover:bg-school-yellow/10"
                                onClick={() => { setEditUser(teacher); setEditIsStudent(false) }}
                                aria-label="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setDeleteTarget(teacher)}
                                aria-label="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parents">
              <Card className="border-school-yellow/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-school-black">Liste des parents</CardTitle>
                      <CardDescription>Comptes parents actifs et gestion des enfants rattachés</CardDescription>
                    </div>
                    <Button
                      className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                      onClick={() => openCreateDialog('parent')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un parent
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingParents ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : parentsError ? (
                    <ListError
                      message={(parentsErrorDetail as Error)?.message ?? 'Erreur inconnue'}
                      onRetry={() => refetchParents()}
                    />
                  ) : filteredParents.length === 0 ? (
                    <div className="text-center py-16">
                      <UsersIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-school-black/50">
                        {search ? 'Aucun parent ne correspond à la recherche.' : 'Aucun parent enregistré.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredParents.map((parent) => {
                        const initials = (parent.first_name ?? '').charAt(0).toUpperCase() + (parent.last_name ?? '').charAt(0).toUpperCase() || '?'
                        const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500']
                        const color = colors[parent.id.charCodeAt(0) % colors.length]
                        return (
                          <div
                            key={parent.id}
                            className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-school-yellow/40 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">{formatUserDisplayName(parent)}</p>
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  {parent.email ?? '—'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">Actif</Badge>
                              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {new Date(parent.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 justify-between border-t border-slate-50 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1 border-school-yellow/40 hover:bg-school-yellow/10"
                                onClick={() => setParentManageUser(parent)}
                              >
                                <UsersIcon className="w-3 h-3" />
                                Enfants
                              </Button>
                              <div className="flex gap-0.5">
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 w-7 p-0 hover:bg-school-yellow/10"
                                  onClick={() => { setEditUser(parent); setEditIsStudent(false) }}
                                  aria-label="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost" size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => setDeleteTarget(parent)}
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins">
              <Card className="border-school-yellow/20">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-school-black">Liste des administrateurs</CardTitle>
                      <CardDescription>Comptes avec accès complet au système</CardDescription>
                    </div>
                    <Button
                      className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                      onClick={() => openCreateDialog('admin')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un admin
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAdmins ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : adminsError ? (
                    <ListError
                      message={(adminsErrorDetail as Error)?.message ?? 'Erreur inconnue'}
                      onRetry={() => refetchAdmins()}
                    />
                  ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-16">
                      <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-school-black/50">
                        {search ? 'Aucun administrateur ne correspond à la recherche.' : 'Aucun administrateur enregistré.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredAdmins.map((admin) => {
                        const initials = (admin.first_name ?? '').charAt(0).toUpperCase() + (admin.last_name ?? '').charAt(0).toUpperCase() || '?'
                        const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500']
                        const color = colors[admin.id.charCodeAt(0) % colors.length]
                        return (
                          <div
                            key={admin.id}
                            className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-school-yellow/40 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">{formatUserDisplayName(admin)}</p>
                                <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  {admin.email ?? '—'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">Actif</Badge>
                              <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                                <Calendar className="w-3 h-3" />
                                {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>

                            <div className="flex justify-end gap-0.5 border-t border-slate-50 pt-2">
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 hover:bg-school-yellow/10"
                                onClick={() => { setEditUser(admin); setEditIsStudent(false) }}
                                aria-label="Modifier"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setDeleteTarget(admin)}
                                aria-label="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <CreateUserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          defaultRole={dialogRole}
          onCreated={refreshAll}
        />

        <EditUserDialog
          open={Boolean(editUser)}
          onOpenChange={(open) => !open && setEditUser(null)}
          user={editUser}
          isStudent={editIsStudent}
          onUpdated={refreshAll}
        />

        <ManageParentChildrenDialog
          open={Boolean(parentManageUser)}
          onOpenChange={(open) => !open && setParentManageUser(null)}
          parent={parentManageUser}
          allStudents={students}
          onChanged={refreshAll}
        />

        <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le profil de {deleteTarget ? formatUserDisplayName(deleteTarget) : ''} sera définitivement retiré.
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  void handleDelete()
                }}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}

export default Users
