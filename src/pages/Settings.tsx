
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'

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

  const handleSaveSettings = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ notifications }))
    toast({ title: 'Préférences enregistrées' })
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
        </div>
      </main>
    </div>
  )
}

export default Settings
