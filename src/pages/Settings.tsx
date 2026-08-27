import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Shield, Trash2, FileText, Server } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Link } from 'react-router-dom'
import { requestAndRegisterPush, disablePushNotifications } from '@/hooks/usePushNotifications'

const PREFS_KEY = 'houssem-app-prefs'

type AppPrefs = {
  notifications: boolean
}

function loadPrefs(): AppPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { notifications: true }
    return JSON.parse(raw) as AppPrefs
  } catch {
    return { notifications: true }
  }
}

const Settings = () => {
  const [notifications, setNotifications] = useState(true)
  const { toast } = useToast()
  const { user, userProfile, signOut } = useAuth()
  
  const [firstName, setFirstName] = useState(userProfile?.first_name || '')
  const [lastName, setLastName] = useState(userProfile?.last_name || '')
  const [password, setPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [pingResult, setPingResult] = useState<{message: string, date: string, time: string} | null>(null)
  const [isPinging, setIsPinging] = useState(false)

  const handlePing = async () => {
    setIsPinging(true)
    setPingResult(null)
    try {
      const res = await fetch('/api/ping')
      const data = await res.json()
      if (res.ok) {
        setPingResult({ message: data.message, date: data.date, time: data.time })
        toast({ title: 'Ping réussi' })
      } else {
        throw new Error(data.error || 'Erreur API')
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur Ping', description: err.message })
    } finally {
      setIsPinging(false)
    }
  }

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.first_name || '')
      setLastName(userProfile.last_name || '')
    }
  }, [userProfile])

  useEffect(() => {
    const prefs = loadPrefs()
    setNotifications(prefs.notifications)
  }, [])

  const handleSaveSettings = async () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ notifications }))
    
    if (notifications) {
      const success = await requestAndRegisterPush()
      if (!success) {
        toast({ 
          variant: 'destructive',
          title: 'Permission refusée',
          description: "Impossible d'activer les notifications push. Veuillez les autoriser dans les paramètres de votre téléphone."
        })
      } else {
        toast({ title: 'Préférences enregistrées et notifications activées' })
      }
    } else {
      if (user) {
        await disablePushNotifications(user.id)
      }
      toast({ title: 'Préférences enregistrées et notifications désactivées' })
    }
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader title="Paramètres" description="Votre compte et préférences" />

        <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-school-black">
                <Shield className="w-5 h-5" />
                Mon compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nouveau mot de passe (laisser vide pour ne pas changer)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              
              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Button 
                  className="bg-school-yellow text-school-black hover:bg-school-yellow-dark" 
                  onClick={async () => {
                    if (!user) return
                    setIsUpdating(true)
                    try {
                      if (password) {
                        const { error: authErr } = await supabase.auth.updateUser({ password })
                        if (authErr) throw authErr
                      }
                      
                      const { error: profErr } = await supabase
                        .from('profiles')
                        .update({ first_name: firstName, last_name: lastName })
                        .eq('user_id', user.id)
                        
                      if (profErr) throw profErr
                      
                      toast({ title: 'Profil mis à jour' })
                      setPassword('')
                    } catch (err: any) {
                      toast({ variant: 'destructive', title: 'Erreur', description: err.message })
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                  disabled={isUpdating}
                >
                  Enregistrer les modifications
                </Button>
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => signOut()}>
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-school-black">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Préférences locales sur cet appareil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-school-black font-medium">
                    Alertes dans l&apos;application
                  </Label>
                  <p className="text-sm text-school-black/60">Annonces et rappels de cours</p>
                </div>
                <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator className="bg-school-yellow/20" />
              <Button
                onClick={handleSaveSettings}
                className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
              >
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          {/* Test de connexion API */}
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-school-black">
                <Server className="w-5 h-5" />
                Test de connexion API
              </CardTitle>
              <CardDescription>Vérifier la connexion avec le serveur et la base de données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePing} 
                disabled={isPinging}
                className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
              >
                {isPinging ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              
              {pingResult && (
                <div className="p-4 bg-green-50 text-green-800 rounded-md border border-green-200 space-y-2">
                  <p className="font-semibold text-green-900">{pingResult.message}</p>
                  <div className="flex gap-4 text-sm text-green-700">
                    <span>📅 Date : {pingResult.date}</span>
                    <span>⏱ Heure : {pingResult.time}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Liens légaux */}
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-school-black">
                <FileText className="w-5 h-5" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/privacy-policy" className="block text-sm text-blue-600 hover:underline">
                📄 Politique de confidentialité
              </Link>
              <Link to="/terms-of-service" className="block text-sm text-blue-600 hover:underline">
                📋 Conditions d'utilisation
              </Link>
            </CardContent>
          </Card>

          {/* Suppression de compte */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Zone dangereuse
              </CardTitle>
              <CardDescription>Actions irréversibles sur votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-school-black/70">
                La suppression de votre compte est <strong>définitive et irréversible</strong>. Toutes vos données
                personnelles, messages, notes et historique seront supprimés.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>Cette action est <strong>irréversible</strong>. Toutes vos données seront supprimées :</p>
                      <ul className="list-disc ml-6 text-sm space-y-1">
                        <li>Profil et informations personnelles</li>
                        <li>Messages et conversations</li>
                        <li>Notes et historique de présences</li>
                        <li>Tous les liens avec les classes et cours</li>
                      </ul>
                      <p className="pt-2">Tapez <strong>{user?.email}</strong> pour confirmer :</p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Tapez votre adresse e-mail ici..."
                        className="border-red-200"
                      />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirmText !== user?.email || isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        setIsDeleting(true)
                        try {
                          const { error } = await supabase.rpc('delete_own_account')
                          if (error) throw error
                          toast({ title: 'Compte supprimé', description: 'Votre compte a été supprimé avec succès.' })
                          window.location.replace('/')
                        } catch (err: any) {
                          toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Impossible de supprimer le compte' })
                        } finally {
                          setIsDeleting(false)
                          setDeleteConfirmText('')
                        }
                      }}
                    >
                      {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Settings
