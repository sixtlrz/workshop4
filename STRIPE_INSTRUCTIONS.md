# Configuration du système d'abonnement Stripe

## 1. Configuration de l'environnement

Ajoutez les variables suivantes à votre fichier `.env.local` :

```
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_BASIC_PRICE_ID=prod_VOTRE_PRODUCT_ID_BASIC
STRIPE_PRO_PRICE_ID=prod_VOTRE_PRODUCT_ID_PRO
STRIPE_WEBHOOK_SECRET=whsec_xxx...  # À obtenir via Stripe CLI ou le Dashboard Stripe
```

**Important** : Remplacez les valeurs ci-dessus par vos vraies clés Stripe depuis https://dashboard.stripe.com/test/apikeys

## 2. Configuration de la base de données Supabase

Exécutez le script SQL présent dans `SUBSCRIPTIONS_SQL.md` dans l'éditeur SQL de Supabase pour créer la table et les politiques de sécurité.

## 3. Configurer le webhook Stripe

### En développement (local)

1. Installez Stripe CLI : https://stripe.com/docs/stripe-cli
2. Exécutez `stripe login` pour vous connecter à votre compte Stripe
3. Exécutez `stripe listen --forward-to localhost:3001/api/stripe-webhook`
4. Copiez le webhook signing secret affiché et ajoutez-le à votre fichier .env.local

### En production

1. Allez dans le Dashboard Stripe > Developers > Webhooks
2. Ajoutez un endpoint : `https://votre-domaine.com/api/stripe-webhook`
3. Sélectionnez les événements à écouter :
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded

## 4. Tester le système d'abonnement

1. Accédez à la page `/pricing` pour voir les offres d'abonnement
2. Cliquez sur un des boutons "S'abonner"
3. Complétez le paiement avec une carte de test:
   - Numéro : 4242 4242 4242 4242
   - Date d'expiration : une date future
   - CVC : 3 chiffres
   - Code postal : 5 chiffres

4. Après paiement réussi, vous serez redirigé vers le dashboard
5. Le webhook mettra à jour la table `subscriptions` dans Supabase
6. Vous pourrez alors générer des images selon votre quota

## 5. Comment fonctionne la limitation du quota

1. Chaque plan a un quota mensuel:
   - Plan Basic: 50 générations
   - Plan Pro: 200 générations
   
2. À chaque génération réussie, le compteur `quota_used` est incrémenté
3. L'API vérifie si `quota_used < quota_limit` avant chaque génération
4. Le compteur est réinitialisé au début de chaque période de facturation

## 6. Comment afficher l'état de l'abonnement

Vous pouvez créer une page `/account` pour afficher:
- Le plan actuel
- La date de renouvellement
- Le quota utilisé/disponible
- Un bouton pour changer/annuler l'abonnement

## 7. Dépannage

Si vous rencontrez des problèmes:

1. Vérifiez les logs du webhook dans la console où vous exécutez `stripe listen`
2. Vérifiez les logs du serveur Next.js
3. Consultez le Dashboard Stripe > Events pour voir si les événements sont bien déclenchés
4. Consultez la table `subscriptions` dans Supabase pour vérifier l'état des abonnements