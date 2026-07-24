import { PageHeader } from '@/components/layout/PageHeader'

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader title="Conditions d'utilisation" description="Règles d'utilisation de l'application" />

        <div className="p-6 max-w-3xl mx-auto space-y-8 text-sm text-school-black/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">1. Acceptation des conditions</h2>
            <p>
              En créant un compte ou en utilisant l'application Houssem Academy, vous acceptez les présentes
              conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">2. Description du service</h2>
            <p>
              Houssem Academy est une application de gestion scolaire permettant la gestion des présences,
              des notes, du calendrier, de la messagerie et des paiements entre l'administration, les enseignants,
              les élèves et les parents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">3. Comptes utilisateurs</h2>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
              <li>Vous devez fournir des informations exactes et à jour.</li>
              <li>Les comptes professeurs et administrateurs sont créés exclusivement par l'administration.</li>
              <li>Les comptes élèves et parents sont soumis à approbation par l'administration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">4. Utilisation acceptable</h2>
            <p>Vous vous engagez à :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Utiliser l'application uniquement à des fins éducatives légitimes.</li>
              <li>Ne pas partager vos identifiants avec des tiers.</li>
              <li>Ne pas envoyer de contenu offensant, haineux ou illégal via la messagerie.</li>
              <li>Ne pas tenter d'accéder aux données d'autres utilisateurs sans autorisation.</li>
              <li>Respecter les droits de propriété intellectuelle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">5. Propriété intellectuelle</h2>
            <p>
              L'application Houssem Academy, son code source, son design et son contenu sont protégés par
              les droits de propriété intellectuelle. Toute reproduction ou distribution non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">6. Limitation de responsabilité</h2>
            <p>
              L'application est fournie « en l'état ». Houssem Academy ne garantit pas l'absence d'interruptions
              ou d'erreurs. En aucun cas, Houssem Academy ne saurait être tenu responsable des dommages indirects
              liés à l'utilisation de l'application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">7. Résiliation</h2>
            <p>
              L'administration se réserve le droit de suspendre ou supprimer un compte en cas de violation
              des présentes conditions. Vous pouvez supprimer votre compte à tout moment depuis les paramètres.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">8. Modifications</h2>
            <p>
              Ces conditions peuvent être modifiées à tout moment. Les utilisateurs seront informés des
              changements significatifs par notification dans l'application.
            </p>
            <p className="mt-2 text-xs text-school-black/50">
              Dernière mise à jour : 24 juillet 2026
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">9. Contact</h2>
            <p>
              Pour toute question, contactez-nous à : <strong>contact@houssemacademy.com</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default TermsOfService
