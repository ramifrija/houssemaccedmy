import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import {
  attendanceStatusLabel,
  deleteStudentPayment,
  fetchStudentAttendanceHistory,
  fetchStudentDossierGrades,
  fetchStudentDossierProfile,
  fetchStudentPayments,
  paymentStatusLabel,
  insertStudentPayment,
} from '@/lib/student-dossier-api'
import { ArrowLeft, BookOpen, CreditCard, Trash2, UserCheck } from 'lucide-react'

const StudentDossierPage = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const now = new Date()
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split('T')[0])
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student-dossier-profile', studentId],
    queryFn: () => fetchStudentDossierProfile(studentId!),
    enabled: !!studentId,
  })

  const { data: attendance = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['student-dossier-attendance', studentId],
    queryFn: () => fetchStudentAttendanceHistory(studentId!),
    enabled: !!studentId,
  })

  const { data: grades = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['student-dossier-grades', studentId],
    queryFn: () => fetchStudentDossierGrades(studentId!),
    enabled: !!studentId,
  })

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['student-dossier-payments', studentId],
    queryFn: () => fetchStudentPayments(studentId!),
    enabled: !!studentId && isAdmin,
  })

  const savePayment = useMutation({
    mutationFn: async () => {
      if (!user?.id || !studentId) throw new Error('Session invalide')
      await insertStudentPayment({
        studentId,
        amount: Number(amount) || 0,
        paymentDate,
        paymentMethod,
        notes: paymentNotes,
        recordedBy: user.id,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student-dossier-payments', studentId] })
      await queryClient.invalidateQueries({ queryKey: ['student-dossiers'] })
      toast({ title: 'Paiement enregistré' })
      setAmount('')
      setPaymentNotes('')
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Erreur', description: e.message }),
  })

  const removePayment = useMutation({
    mutationFn: deleteStudentPayment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student-dossier-payments', studentId] })
      toast({ title: 'Paiement supprimé' })
    },
  })

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-school-gray-light flex items-center justify-center">
        <p className="text-school-black/50">Chargement...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-school-gray-light flex flex-col items-center justify-center gap-4">
        <p className="text-school-black/60">Élève introuvable</p>
        <Button variant="outline" onClick={() => navigate('/students')}>
          Retour
        </Button>
      </div>
    )
  }

  const presentCount = attendance.filter((a) => a.status === 'present').length
  const absentCount = attendance.filter((a) => a.status === 'absent').length
  const lateCount = attendance.filter((a) => a.status === 'late').length
  const avgGrade =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 20, 0) / grades.length).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title={profile.name}
        description={`Fiche élève · ${profile.className ?? 'Sans classe'}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/students')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        }
      />

      <div className="p-4">
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'} bg-school-yellow/10`}>
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="attendance">Présences</TabsTrigger>
            <TabsTrigger value="grades">Notes</TabsTrigger>
            {isAdmin && <TabsTrigger value="payments">Paiements</TabsTrigger>}
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Présences" value={String(presentCount)} />
              <StatCard label="Absences" value={String(absentCount)} />
              <StatCard label="Retards" value={String(lateCount)} />
              <StatCard label="Moyenne /20" value={avgGrade ?? '—'} />
            </div>
            <Card className="border-school-yellow/20">
              <CardContent className="p-4 space-y-2 text-sm">
                <p><span className="text-school-black/60">Email :</span> {profile.email ?? '—'}</p>
                <p><span className="text-school-black/60">Classe :</span> {profile.className ?? '—'}</p>
                <p>
                  <span className="text-school-black/60">Inscrit le :</span>{' '}
                  {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="border-school-yellow/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Historique des présences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
                ) : attendance.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucune présence enregistrée</p>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                      >
                        <div>
                          <p className="font-medium text-sm">{row.subject}</p>
                          <p className="text-xs text-school-black/60">
                            {row.className} · {new Date(row.sessionDate).toLocaleDateString('fr-FR')} à {row.startTime}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            row.status === 'present'
                              ? 'border-green-300 text-green-700'
                              : row.status === 'late'
                                ? 'border-amber-300 text-amber-700'
                                : 'border-red-300 text-red-700'
                          }
                        >
                          {attendanceStatusLabel(row.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades">
            <Card className="border-school-yellow/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGrades ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
                ) : grades.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucune note</p>
                ) : (
                  <div className="space-y-2">
                    {grades.map((grade) => (
                      <div
                        key={grade.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                      >
                        <div>
                          <p className="font-medium text-sm">{grade.subject}</p>
                          <p className="text-xs text-school-black/60">
                            {grade.teacherName} · {new Date(grade.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className="font-semibold text-school-black">
                          {grade.score}/{grade.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="payments" className="space-y-4">
              <Card className="border-school-yellow/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Enregistrer un paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date du paiement</Label>
                      <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Montant payé (DT)</Label>
                      <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mode de paiement</Label>
                    <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Espèces, virement..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Ex: Frais de scolarité pour le mois d'Avril" />
                  </div>
                  <Button
                    className="bg-school-yellow text-school-black"
                    disabled={savePayment.isPending}
                    onClick={() => savePayment.mutate()}
                  >
                    Enregistrer le paiement
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-school-yellow/20">
                <CardHeader>
                  <CardTitle className="text-lg">Historique des paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPayments ? (
                    <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-center py-6 text-school-black/50">Aucun paiement enregistré</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                        >
                          <div>
                            <p className="font-medium text-sm">{new Date(p.paymentDate).toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-school-black/60">
                              {p.amount} DT
                              {p.paymentMethod ? ` · ${p.paymentMethod}` : ''}
                              {p.notes ? ` · ${p.notes}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                p.status === 'completed' || p.status === 'paid'
                                  ? 'border-green-300 text-green-700'
                                  : p.status === 'pending'
                                    ? 'border-amber-300 text-amber-700'
                                    : 'border-red-300 text-red-700'
                              }
                            >
                              {paymentStatusLabel(p.status)}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePayment.mutate(p.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-school-yellow/20">
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-school-black">{value}</p>
        <p className="text-xs text-school-black/60 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

export default StudentDossierPage

