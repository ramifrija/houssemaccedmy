import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock } from "lucide-react"
import { useAuth } from './AuthProvider'

export const PendingApproval = () => {
  const { signOut, userProfile } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900">Compte en attente</CardTitle>
          <CardDescription className="text-gray-600">
            Votre compte est en cours de validation
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Validation requise</p>
                <p>
                  Votre compte <strong>{userProfile?.role || 'utilisateur'}</strong> a été créé avec succès 
                  mais doit être validé par un administrateur avant que vous puissiez accéder à la plateforme.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Informations de votre compte :</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Email : {userProfile?.email}</li>
              <li>Nom : {userProfile?.first_name} {userProfile?.last_name}</li>
              <li>Rôle : {userProfile?.role}</li>
              <li>Statut : En attente de validation</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700 mb-1">Que faire maintenant ?</p>
            <p>
              Un administrateur examinera votre demande et validera votre compte. 
              Vous recevrez une notification par email une fois votre compte activé.
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={signOut}
              className="w-full"
            >
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}