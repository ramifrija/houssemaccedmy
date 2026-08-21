import { supabase } from '@/integrations/supabase/client'

export interface Expense {
  id: string
  name: string
  amount: number
  expense_date: string
  notes: string | null
  created_at: string
}

export interface FinanceStats {
  totalPaid: number
  totalPending: number
  totalExpenses: number
}

// Helper pour avoir le début et fin du mois courant
function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  // Format for DB: YYYY-MM-DD
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

export async function fetchFinancesStats(): Promise<FinanceStats> {
  const { start, end } = getCurrentMonthRange()

  // 1. Fetch payments for current month
  const { data: payments, error: payErr } = await supabase
    .from('student_payments')
    .select('amount, status')
    .gte('payment_date', start)
    .lte('payment_date', end)

  if (payErr) {
    console.error('Erreur paiements:', payErr)
  }

  // 2. Fetch expenses for current month
  const { data: expenses, error: expErr } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', start)
    .lte('expense_date', end)

  if (expErr) {
    // Si la table n'existe pas encore (le client n'a pas exécuté la requête SQL),
    // Supabase va renvoyer une erreur, on l'attrape pour ne pas tout bloquer
    console.error('Erreur dépenses:', expErr)
  }

  let totalPaid = 0
  let totalPending = 0
  let totalExpenses = 0

  if (payments) {
    payments.forEach(p => {
      if (p.status === 'completed') totalPaid += Number(p.amount)
      else if (p.status === 'pending') totalPending += Number(p.amount)
    })
  }

  if (expenses) {
    expenses.forEach((e: any) => {
      totalExpenses += Number(e.amount)
    })
  }

  return {
    totalPaid,
    totalPending,
    totalExpenses
  }
}

export async function fetchExpenses(): Promise<Expense[]> {
  const { start, end } = getCurrentMonthRange()

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', start)
    .lte('expense_date', end)
    .order('expense_date', { ascending: false })

  if (error) {
    console.error('Fetch expenses error', error)
    return []
  }

  return data as Expense[]
}

export async function addExpense(name: string, amount: number, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .insert({
      name,
      amount,
      notes: notes || null,
      expense_date: new Date().toISOString().split('T')[0]
    } as any)

  if (error) throw error
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
