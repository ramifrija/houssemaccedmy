import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { DollarSign, Bell, CheckCircle, AlertTriangle, Trash2, BookOpen, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import { useQuery } from '@tanstack/react-query'

interface StudentOption {
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
}

interface PaymentRow {
  id: string
  student_id: string
  amount: number
  payment_date: string
  payment_method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  reference: string | null
  notes: string | null
  student_name?: string
}

export default function PaymentsPage() {
  const { toast } = useToast()
  
  // Drill-down states
  const [listClassId, setListClassId] = useState<number | null>(null)
  const [selectedStudentForPayments, setSelectedStudentForPayments] = useState<{id: string, name: string} | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states for adding payment
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [status, setStatus] = useState<'completed' | 'pending'>('completed')
  const [notes, setNotes] = useState('')

  // 1. Fetch all classes
  const { data: classes = [] } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*').order('name')
      if (error) throw error
      return data || []
    },
  })

  // 2. Fetch students for the selected class
  const { data: listClassStudents = [], isLoading: loadingListStudents } = useQuery({
    queryKey: ['students-for-class', listClassId],
    queryFn: async () => {
      if (!listClassId) return []
      
      const { data: enrollments, error: enrollErr } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('class_id', listClassId)

      if (enrollErr) throw enrollErr
      
      if (!enrollments || enrollments.length === 0) return []

      const studentIds = enrollments.map((e) => e.student_id)
      
      const { data: stProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', studentIds)

      if (profErr) throw profErr
        
      return (stProfiles as unknown as StudentOption[]) || []
    },
    enabled: listClassId != null
  })

  // 3. Fetch payments for the selected student
  const { data: payments = [], isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments-for-student', selectedStudentForPayments?.id],
    queryFn: async () => {
      if (!selectedStudentForPayments) return []
      
      const { data: payData, error } = await supabase
        .from('student_payments')
        .select('*')
        .eq('student_id', selectedStudentForPayments.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const enriched = ((payData as PaymentRow[]) ?? []).map((pay) => ({
        ...pay,
        student_name: selectedStudentForPayments.name,
      }))

      return enriched
    },
    enabled: !!selectedStudentForPayments
  })

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = listClassStudents.filter(s => 
    formatUserDisplayName(s).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSetListClassId = (id: number | null) => {
    setListClassId(id)
    setSearchQuery('')
  }

  const handleAddPayment = async () => {
    if (!selectedStudentForPayments || !amount) return
    try {
      const { error } = await supabase.from('student_payments').insert({
        student_id: selectedStudentForPayments.id,
        amount: parseFloat(amount),
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: paymentMethod,
        status: status,
        notes: notes.trim() || null,
      })

      if (error) throw error

      toast({
        title: 'Paiement enregistré',
        description: 'Le statut du règlement a été mis à jour.',
      })

      setAmount('')
      setNotes('')
      refetchPayments()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement',
      })
    }
  }

  const handleToggleStatus = async (payment: PaymentRow) => {
    const newStatus = payment.status === 'completed' ? 'pending' : 'completed'
    try {
      const { error } = await supabase
        .from('student_payments')
        .update({ status: newStatus })
        .eq('id', payment.id)

      if (error) throw error

      toast({
        title: 'Statut mis à jour',
        description: `Paiement passé à '${newStatus === 'completed' ? 'Payé' : 'En attente'}'`,
      })
      refetchPayments()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce paiement ?')) return
    try {
      const { error } = await supabase
        .from('student_payments')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      
      toast({ title: 'Paiement supprimé' })
      refetchPayments()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le paiement' })
    }
  }

  const handleSendReminderNotification = async (payment: PaymentRow) => {
    try {
      const { data: parentRels } = await supabase
        .from('parent_students')
        .select('parent_id')
        .eq('student_id', payment.student_id)

      const parentIds: string[] = (parentRels ?? []).map((r) => r.parent_id).filter(Boolean)

      if (parentIds.length === 0) {
        const { data: stProfile } = await supabase
          .from('profiles')
          .select('parent_id')
          .eq('user_id', payment.student_id)
          .single()

        if (stProfile?.parent_id) {
          parentIds.push(stProfile.parent_id)
        }
      }

      const targetUserIds = parentIds.length > 0 ? parentIds : [payment.student_id]

      for (const targetUserId of targetUserIds) {
        const { error } = await supabase.from('notifications').insert({
          user_id: targetUserId,
          title: 'Rappel de Règlement de Scolarité',
          content: `Rappel : Le paiement de scolarité de ${payment.amount} DT pour ${payment.student_name} est en attente. Veuillez régler votre solde.`,
          type: 'payment',
          priority: 'high',
        })
        if (error) throw error
      }

      toast({
        title: 'Rappel envoyé !',
        description: `Notification transmise (${targetUserIds.length} destinataire(s)).`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'envoi',
        description: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  const handleSendGlobalReminders = async () => {
    if (!confirm("Êtes-vous sûr de vouloir relancer TOUS les parents ayant des paiements en attente sur l'ensemble de l'école ?")) return
    
    toast({ title: 'Envoi en cours...', description: 'Veuillez patienter.' })

    try {
      const { data: pendingPayments, error: fetchErr } = await supabase
        .from('student_payments')
        .select('student_id, amount')
        .eq('status', 'pending')

      if (fetchErr) throw fetchErr

      if (!pendingPayments || pendingPayments.length === 0) {
        toast({ title: 'Aucun impayé', description: 'Tous les paiements sont à jour dans le système.' })
        return
      }

      let sentCount = 0
      
      for (const p of pendingPayments) {
        const { data: stProfile } = await supabase
          .from('profiles')
          .select('parent_id, first_name, last_name, email')
          .eq('user_id', p.student_id)
          .maybeSingle()

        const studentName = stProfile ? formatUserDisplayName(stProfile as any) : 'Élève inconnu'
        
        const { data: parentRels } = await supabase
          .from('parent_students')
          .select('parent_id')
          .eq('student_id', p.student_id)

        const parentIds: string[] = (parentRels ?? []).map((r) => r.parent_id).filter(Boolean)

        if (parentIds.length === 0 && stProfile?.parent_id) {
          parentIds.push(stProfile.parent_id)
        }

        const targetUserIds = parentIds.length > 0 ? parentIds : [p.student_id]

        for (const targetUserId of targetUserIds) {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            title: 'Rappel Urgent : Règlement de Scolarité',
            content: `Rappel de fin de mois : Un paiement de scolarité de ${p.amount} DT pour ${studentName} est toujours en attente. Veuillez régulariser votre situation.`,
            type: 'payment',
            priority: 'high',
          })
          sentCount++
        }
      }

      toast({
        title: 'Relance collective envoyée !',
        description: `${sentCount} notification(s) transmise(s) aux parents/élèves concernés.`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la relance',
        description: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  return (
    <>
      <PageHeader 
        title="Paiements" 
        description="Gestion des règlements et scolarité" 
        actions={
          <Button 
            className="bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
            onClick={handleSendGlobalReminders}
          >
            <Bell className="w-4 h-4 mr-2 text-amber-700" />
            Relancer tous les impayés
          </Button>
        }
      />

      <PageContent className="animate-fade-in space-y-6">
        <Card className="border-school-yellow/20">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg">Paiements par élève</CardTitle>
              {listClassId && (
                <Button variant="outline" size="sm" onClick={() => handleSetListClassId(null)}>
                  Retour aux classes
                </Button>
              )}
            </div>
            <div className="w-full sm:w-72">
              <Input 
                placeholder={listClassId === null ? "Rechercher une classe..." : "Rechercher un élève..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {listClassId === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <Button
                    key={cls.id}
                    variant="outline"
                    className="h-auto min-h-[6rem] flex items-center justify-start gap-4 p-4 text-school-black border-school-yellow/30 hover:border-school-yellow hover:bg-school-yellow/10 transition-all rounded-xl"
                    onClick={() => handleSetListClassId(cls.id)}
                  >
                    <div className="w-12 h-12 rounded-full bg-school-yellow/20 flex items-center justify-center text-school-yellow-dark flex-shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-bold text-base sm:text-lg text-left whitespace-normal leading-tight mb-1">{cls.name}</span>
                      <span className="text-sm text-school-black/60 font-medium">Sélectionner</span>
                    </div>
                  </Button>
                ))}
                {filteredClasses.length === 0 && (
                  <p className="text-sm text-school-black/50 col-span-full text-center py-6">Aucune classe trouvée</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-4 text-school-black">
                  Élèves de la classe {classes.find(c => c.id === listClassId)?.name}
                </h3>
                {loadingListStudents ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement des élèves...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucun élève trouvé.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredStudents.map((student) => {
                      const name = formatUserDisplayName(student)
                      const initials = name.substring(0, 2).toUpperCase() || '?'
                      const colors = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-rose-500','bg-amber-500','bg-cyan-500','bg-pink-500','bg-indigo-500']
                      const color = colors[student.user_id.charCodeAt(0) % colors.length]

                      return (
                        <Button
                          key={student.user_id}
                          variant="outline"
                          className="justify-start text-left h-auto py-3 px-4 border-slate-200 hover:border-school-yellow hover:bg-school-yellow/5 transition-all rounded-xl gap-3"
                          onClick={() => setSelectedStudentForPayments({ id: student.user_id, name })}
                        >
                          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{name}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">Gérer les paiements</p>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>

      <Dialog 
        open={selectedStudentForPayments !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentForPayments(null)
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Paiements de {selectedStudentForPayments?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="border border-school-yellow/30 rounded-md p-4 bg-school-yellow/5 space-y-4">
              <h4 className="font-semibold text-school-black text-sm">Nouveau paiement</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Montant (DT)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 250"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Notes / Mois concerné</label>
                  <Input
                    placeholder="Ex: Frais de scolarité Octobre"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Méthode</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                      <SelectItem value="virement">Virement bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Statut initial</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'completed' | 'pending')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Payé</SelectItem>
                      <SelectItem value="pending">En attente (Impayé)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                onClick={handleAddPayment}
                disabled={!amount}
              >
                Enregistrer le paiement
              </Button>
            </div>

            <div>
              <h4 className="font-semibold text-school-black mb-3">Historique</h4>
              {loadingPayments ? (
                <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
              ) : payments.length === 0 ? (
                <p className="text-sm text-center py-6 text-school-black/50">Aucun historique de paiement pour cet élève.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-school-yellow/30">
                  <Table>
                    <TableHeader className="bg-school-gray-light">
                      <TableRow>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Méthode</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-bold text-green-700 text-base">{p.amount} DT</TableCell>
                          <TableCell className="text-sm">
                            {new Date(p.payment_date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="text-sm capitalize">{p.payment_method}</TableCell>
                          <TableCell className="text-sm text-gray-600">{p.notes}</TableCell>
                          <TableCell>
                            {p.status === 'completed' ? (
                              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" /> Payé
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3" /> En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(p)}
                              >
                                Changer
                              </Button>
                              {p.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                                  onClick={() => handleSendReminderNotification(p)}
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeletePayment(p.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
