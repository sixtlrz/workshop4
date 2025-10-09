# Configuration Google OAuth avec Supabase

## 📋 Prérequis

Avant de pouvoir utiliser la connexion Google, vous devez configurer OAuth dans Supabase et Google Cloud Console.

## 🔧 Étape 1 : Configuration dans Google Cloud Console

### 1.1 Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet

### 1.2 Activer l'API Google+
1. Dans le menu, allez dans **APIs & Services > Library**
2. Recherchez "Google+ API"
3. Cliquez sur **Enable**

### 1.3 Créer des identifiants OAuth 2.0
1. Allez dans **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > OAuth client ID**
3. Si demandé, configurez l'écran de consentement OAuth :
   - Type d'application : **External**
   - Nom de l'application : `AI Image Editor` (ou votre nom)
   - Email d'assistance : votre email
   - Domaine autorisé : `supabase.co`
   - Ajoutez les scopes : `email`, `profile`, `openid`

4. Choisissez le type d'application : **Web application**
5. Nom : `AI Image Editor Web`
6. **Authorized JavaScript origins** :
   ```
   https://jjewkbqgvkafiylcrqsh.supabase.co
   ```

7. **Authorized redirect URIs** :
   ```
   https://jjewkbqgvkafiylcrqsh.supabase.co/auth/v1/callback
   ```

8. Cliquez sur **Create**
9. **Notez le Client ID et le Client Secret** (vous en aurez besoin pour Supabase)

## 🗄️ Étape 2 : Configuration dans Supabase Dashboard

### 2.1 Accéder aux paramètres d'authentification
1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : `jjewkbqgvkafiylcrqsh`
3. Allez dans **Authentication > Providers**
4. Trouvez **Google** dans la liste

### 2.2 Activer Google OAuth
1. Cliquez sur **Google**
2. Activez le toggle **Enable Sign in with Google**
3. Entrez vos identifiants :
   - **Client ID** : collez le Client ID de Google Cloud Console
   - **Client Secret** : collez le Client Secret de Google Cloud Console
4. Vérifiez que l'URL de callback est correcte :
   ```
   https://jjewkbqgvkafiylcrqsh.supabase.co/auth/v1/callback
   ```
5. Cliquez sur **Save**

### 2.3 Configurer les URLs autorisées (optionnel)
1. Toujours dans **Authentication > URL Configuration**
2. Ajoutez vos URLs locales et de production :
   - Site URL : `http://localhost:3001`
   - Redirect URLs : 
     ```
     http://localhost:3001/dashboard
     http://localhost:3001/**
     ```

## 🧪 Étape 3 : Tester localement

### 3.1 Démarrer le serveur
```bash
npm run dev
```

### 3.2 Tester la connexion Google
1. Ouvrez http://localhost:3001/login
2. Cliquez sur le bouton **"Continuer avec Google"**
3. Vous serez redirigé vers la page de connexion Google
4. Sélectionnez votre compte Google
5. Acceptez les permissions
6. Vous devriez être redirigé vers `/dashboard` avec votre session active

## 🐛 Résolution des problèmes courants

### Erreur : "redirect_uri_mismatch"
- Vérifiez que l'URL de callback dans Google Cloud Console correspond exactement à celle de Supabase
- Format : `https://[votre-projet].supabase.co/auth/v1/callback`

### Erreur : "Access blocked: This app's request is invalid"
- Vérifiez que vous avez bien configuré l'écran de consentement OAuth
- Assurez-vous que les scopes `email`, `profile`, `openid` sont activés

### L'utilisateur est créé mais pas redirigé
- Vérifiez que `redirectTo` dans le code pointe vers la bonne URL
- Vérifiez les URLs autorisées dans Supabase Dashboard

### En production
N'oubliez pas d'ajouter votre domaine de production dans :
- Google Cloud Console > Authorized redirect URIs
- Supabase Dashboard > Authentication > URL Configuration

## 📝 Notes importantes

- Les utilisateurs connectés via Google n'ont **pas besoin de confirmer leur email**
- Le premier utilisateur Google créé aura automatiquement un `user_id` dans Supabase
- Les projets sont automatiquement liés à l'utilisateur via `user_id`
- Vous pouvez voir tous les utilisateurs dans **Authentication > Users** dans Supabase Dashboard

## 🔒 Sécurité

- Ne committez **JAMAIS** vos Client ID et Client Secret dans Git
- En production, utilisez des variables d'environnement sécurisées
- Activez les Row Level Security (RLS) policies dans Supabase
