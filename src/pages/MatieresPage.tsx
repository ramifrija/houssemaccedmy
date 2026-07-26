import { useState } from 'react'
import { PageContent } from '@/components/layout/PageContent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function MatieresPage() {
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newMatiereName, setNewMatiereName] = useState('')

  const { data: matieres, isLoading } = useQuery({
    queryKey: ['matieres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matieres')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('matieres')
        .insert([{ name }])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] })
      setIsAddDialogOpen(false)
      setNewMatiereName('')
      toast.success('Matière ajoutée avec succès')
    },
    onError: (error: any) => {
      console.error('Supabase error:', error)
      if (error.code === '23505') {
        toast.error('Cette matière existe déjà')
      } else {
        toast.error(`Erreur: ${error.message || 'Impossible d\'ajouter la matière'}`)
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('matieres')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matieres'] })
      toast.success('Matière supprimée avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la matière')
    }
  })

  const handleAddMatiere = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMatiereName.trim()) return
    addMutation.mutate(newMatiereName.trim())
  }

  return (
    <PageContent 
      title="Gestion des Matières" 
      subtitle="Ajouter et configurer les matières enseignées"
      icon={<BookOpen className="w-8 h-8 text-school-yellow" />}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-school-black">Liste des matières</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une matière
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle Matière</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMatiere} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la matière</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Mathématiques, Physique..."
                    value={newMatiereName}
                    onChange={(e) => setNewMatiereName(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-school-yellow text-school-black hover:bg-school-yellow-dark"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-school-yellow/20 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-school-yellow/10">
                <TableRow>
                  <TableHead className="font-semibold text-school-black">Nom de la matière</TableHead>
                  <TableHead className="text-right font-semibold text-school-black">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-school-black/60">
                      Chargement des matières...
                    </TableCell>
                  </TableRow>
                ) : matieres?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-school-black/60">
                      Aucune matière n'a été ajoutée pour le moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  matieres?.map((matiere) => (
                    <TableRow key={matiere.id} className="hover:bg-school-yellow/5">
                      <TableCell className="font-medium text-school-black">
                        {matiere.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Voulez-vous vraiment supprimer la matière "${matiere.name}" ?`)) {
                              deleteMutation.mutate(matiere.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  )
}
