import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from './AuthProvider'

export const AuthPage = () => {
  // Login form state
  const [activeTab, setActiveTab] = useState('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('student')
  const [signupLoading, setSignupLoading] = useState(false)

  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    
    try {
      await signIn(loginEmail, loginPassword)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    
    try {
      const { error } = await signUp(signupEmail, signupPassword, {
        first_name: firstName,
        last_name: lastName,
        role
      })
      if (!error) {
        setActiveTab('login')
      }
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4 safe-area-pt safe-area-pb">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/3e4bbc9d-9aac-4075-9c18-7bd64ab1fdf5.png" 
              alt="Houssem Academy Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Houssem Academy</CardTitle>
          <CardDescription>Connectez-vous ou créez un compte</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre.email@example.com"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
              

            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="first-name">Prénom</Label>
                    <Input
                      id="first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Nom</Label>
                    <Input
                      id="last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="votre.email@example.com"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="student">Élève</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupLoading}
                >
                  {signupLoading ? 'Inscription...' : "S'inscrire"}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Un mail de validation a été envoyé à votre adresse mail, vérifiez-le.
                </p>
              </form>
              

            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}