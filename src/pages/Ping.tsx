import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export default function PingPage() {
  const [pingResult, setPingResult] = useState<{message: string, date: string, time: string, studentsCount: number | null} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        setLoading(true)
        setError(null)
        
        // Simuler un appel API / test de base de données
        const { count, error: dbError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', 3)

        if (dbError) throw dbError

        const now = new Date()
        setPingResult({
          message: "Ping avec succès ! Le serveur de base de données est accessible.",
          studentsCount: count, // Note: affichera 0 si vous n'êtes pas connecté à cause de la sécurité (RLS)
          date: now.toLocaleDateString('fr-FR'),
          time: now.toLocaleTimeString('fr-FR')
        })
      } catch (err: any) {
        setError(err.message || 'Erreur de connexion à la base de données')
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader title="Test de connexion (Ping)" description="Vérification de l'état du système" />

        <div className="p-6 space-y-6 animate-fade-in max-w-2xl mx-auto">
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-school-black">
                <Server className="w-5 h-5" />
                État du système
              </CardTitle>
              <CardDescription>Résultat de la vérification de la base de données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {loading && (
                <div className="flex items-center gap-3 p-4 text-school-black/70">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p>Vérification en cours...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Erreur de connexion</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {pingResult && (
                <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">{pingResult.message}</p>
                      <p className="text-sm text-green-700 mt-1">Nombre d'étudiants trouvés : {pingResult.studentsCount}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-green-700 pt-2 border-t border-green-200/50">
                    <span>📅 Date : {pingResult.date}</span>
                    <span>⏱ Heure : {pingResult.time}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
