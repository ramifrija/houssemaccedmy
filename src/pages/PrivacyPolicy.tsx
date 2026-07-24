import { PageHeader } from '@/components/layout/PageHeader'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader title="Politique de Confidentialité" description="Protection de vos données personnelles" />

        <div className="p-6 max-w-3xl mx-auto space-y-8 text-sm text-school-black/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">1. Introduction</h2>
            <p>
              Houssem Academy (ci-après « l'Application ») s'engage à protéger la vie privée de ses utilisateurs.
              Cette politique de confidentialité décrit les données personnelles que nous collectons, comment nous les
              utilisons, et les droits dont vous disposez concernant vos informations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">2. Données collectées</h2>
            <p>Nous collectons les données suivantes lors de votre utilisation de l'Application :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Données d'identification</strong> : prénom, nom, adresse e-mail.</li>
              <li><strong>Données scolaires</strong> : notes, présences, emploi du temps, classe, matières.</li>
              <li><strong>Données de communication</strong> : messages envoyés via la messagerie intégrée.</li>
              <li><strong>Données de paiement</strong> : montants et statuts des paiements scolaires (aucune donnée bancaire n'est stockée directement).</li>
              <li><strong>Données techniques</strong> : type d'appareil, système d'exploitation, adresse IP (à des fins de sécurité).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Gérer votre compte utilisateur et votre authentification.</li>
              <li>Fournir les services éducatifs (notes, présences, calendrier).</li>
              <li>Permettre la communication entre enseignants, élèves, parents et administration.</li>
              <li>Générer des rapports et statistiques scolaires.</li>
              <li>Envoyer des notifications et annonces.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">4. Base légale</h2>
            <p>
              Le traitement de vos données repose sur votre consentement lors de la création de votre compte,
              ainsi que sur l'exécution du contrat de services éducatifs entre l'établissement et ses utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">5. Partage des données</h2>
            <p>
              Vos données personnelles ne sont partagées avec aucun tiers à des fins commerciales.
              Elles sont accessibles uniquement par :
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>L'administration de l'établissement (dans le cadre de la gestion scolaire).</li>
              <li>Les enseignants concernés (notes, présences de leurs classes).</li>
              <li>Les parents (données de leurs enfants uniquement).</li>
              <li>Notre hébergeur technique (Supabase) pour le stockage sécurisé des données.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">6. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
              chiffrement en transit (HTTPS/TLS), politiques de sécurité au niveau des lignes (RLS) dans la base de données,
              authentification sécurisée avec tokens JWT, et accès restreint aux données selon les rôles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">7. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant la durée de votre inscription à l'établissement.
              Après suppression de votre compte, vos données personnelles sont effacées dans un délai de 30 jours,
              sauf obligation légale de conservation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles.</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes (via la page Paramètres).</li>
              <li><strong>Droit à l'effacement</strong> : supprimer votre compte et vos données (via la page Paramètres).</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données.</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous à l'adresse : <strong>contact@houssemacademy.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">9. Suppression de compte</h2>
            <p>
              Vous pouvez à tout moment supprimer votre compte depuis la page <strong>Paramètres</strong> de l'application.
              Cette action est irréversible et entraîne la suppression définitive de toutes vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">10. Modifications</h2>
            <p>
              Cette politique de confidentialité peut être mise à jour. La date de dernière mise à jour est indiquée ci-dessous.
              Nous vous informerons de tout changement significatif par notification dans l'application.
            </p>
            <p className="mt-2 text-xs text-school-black/50">
              Dernière mise à jour : 24 juillet 2026
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-school-black mb-2">11. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité ou à vos données personnelles,
              vous pouvez nous contacter à : <strong>contact@houssemacademy.com</strong>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPolicy
