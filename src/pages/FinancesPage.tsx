import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchFinancesStats, fetchExpenses, addExpense, deleteExpense, Expense } from '@/lib/finances-api'
import { Receipt, PiggyBank, CreditCard, Trash2, Plus, Wallet } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/use-responsive'
import { Lock } from 'lucide-react'

const FinancesPage = () => {
  const { isMobile, isTablet } = useResponsive()
  const { toast } = useToast()

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pinInput, setPinInput] = useState('')

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [newExpenseName, setNewExpenseName] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpenseNotes, setNewExpenseNotes] = useState('')

  const { data: finances = { totalPaid: 0, totalPending: 0, totalExpenses: 0 }, isLoading: loadingFinances, refetch: refetchFinances } = useQuery({
    queryKey: ['admin-finances-stats'],
    queryFn: fetchFinancesStats,
  })

  const { data: expensesList = [], isLoading: loadingExpensesList, refetch: refetchExpenses } = useQuery({
    queryKey: ['admin-expenses-list'],
    queryFn: fetchExpenses,
  })

  const netProfit = finances.totalPaid - finances.totalExpenses

  const handleAddExpense = async () => {
    if (!newExpenseName || !newExpenseAmount) return
    try {
      await addExpense(newExpenseName, parseFloat(newExpenseAmount), newExpenseNotes)
      toast({ title: 'Dépense ajoutée avec succès' })
      setNewExpenseName('')
      setNewExpenseAmount('')
      setNewExpenseNotes('')
      setIsExpenseModalOpen(false)
      refetchFinances()
      refetchExpenses()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter la dépense" })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette dépense ?')) return
    try {
      await deleteExpense(id)
      toast({ title: 'Dépense supprimée' })
      refetchFinances()
      refetchExpenses()
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de supprimer la dépense" })
    }
  }

  const financeStatsData = [
    { title: 'Revenus (Ce mois)', value: `${finances.totalPaid} DT`, change: 'Paiements encaissés', icon: PiggyBank, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Dépenses (Ce mois)', value: `${finances.totalExpenses} DT`, change: 'Charges et factures', icon: Receipt, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { title: 'Bénéfice Net', value: `${netProfit} DT`, change: 'Revenus nets', icon: Wallet, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Reste à payer', value: `${finances.totalPending} DT`, change: 'Paiements en attente', icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ]

  const gridGap = isMobile ? 'gap-3' : 'gap-6'
  const statsGrid = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === '1590') {
      setIsUnlocked(true)
    } else {
      toast({ variant: 'destructive', title: 'Code PIN incorrect', description: 'Accès refusé.' })
      setPinInput('')
    }
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-school-gray-light">
        <Card className="w-full max-w-sm border-school-yellow/20 shadow-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-school-yellow/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-school-yellow-dark" />
            </div>
            <CardTitle className="text-xl">Zone Sécurisée</CardTitle>
            <CardDescription>
              Veuillez saisir le code PIN pour accéder aux finances.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Code PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="text-center text-lg tracking-widest h-12"
                autoFocus
              />
              <Button type="submit" className="w-full bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                Déverrouiller
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title="Finances"
        description="Gestion des revenus et dépenses"
      />

      <div className={`${isMobile ? 'p-3' : 'p-6'} space-y-6`}>
        {/* Section Finance */}
        <div className={`grid ${gridGap} ${statsGrid}`}>
          {loadingFinances
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-school-yellow/20">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : financeStatsData.map((stat) => (
                <Card key={stat.title} className="border-school-yellow/20 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-school-black">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.value.startsWith('-') ? 'text-red-500' : 'text-school-black'}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-school-black/60 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className={`grid ${gridGap} grid-cols-1`}>
          {/* Section Dépenses */}
          <Card className="border-school-yellow/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-school-black">Gestion des Dépenses</CardTitle>
                <CardDescription>Liste des dépenses (loyers, salaires, factures) du mois.</CardDescription>
              </div>
              <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter une dépense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nature de la dépense</label>
                      <Input 
                        placeholder="Ex: Loyer, Salaire Prof X, Électricité" 
                        value={newExpenseName}
                        onChange={(e) => setNewExpenseName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Montant (DT)</label>
                      <Input 
                        type="number" 
                        placeholder="Ex: 500" 
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes (Optionnel)</label>
                      <Input 
                        placeholder="Ex: Mois d'Octobre" 
                        value={newExpenseNotes}
                        onChange={(e) => setNewExpenseNotes(e.target.value)}
                      />
                    </div>
                    <Button className="w-full bg-school-yellow text-school-black hover:bg-school-yellow-dark" onClick={handleAddExpense}>
                      Enregistrer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loadingExpensesList ? (
                <p className="text-sm text-center text-school-black/50 py-4">Chargement...</p>
              ) : expensesList.length === 0 ? (
                <p className="text-sm text-center text-school-black/50 py-8">Aucune dépense enregistrée ce mois-ci.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dépense</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesList.map((exp: Expense) => (
                        <TableRow key={exp.id}>
                          <TableCell>
                            <p className="font-medium">{exp.name}</p>
                            {exp.notes && <p className="text-xs text-muted-foreground">{exp.notes}</p>}
                          </TableCell>
                          <TableCell className="font-bold text-rose-600">{exp.amount} DT</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteExpense(exp.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default FinancesPage
