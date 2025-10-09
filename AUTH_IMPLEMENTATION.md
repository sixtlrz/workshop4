# 🔐 Authentification Supabase - Guide Complet

## 📋 Ce qui a été implémenté

### ✅ 1. Infrastructure d'authentification

#### **AuthContext** (`contexts/AuthContext.tsx`)
- Context React qui gère l'état d'authentification global
- Hook `useAuth()` pour accéder facilement à l'utilisateur et aux méthodes d'auth
- Écoute `auth.onAuthStateChange()` pour synchroniser l'état en temps réel
- Méthodes fournies :
  - `signIn(email, password)` - Connexion
  - `signUp(email, password)` - Inscription
  - `signOut()` - Déconnexion
  - `user` - Utilisateur actuel (ou null)
  - `loading` - État de chargement

#### **AuthForm** (`components/AuthForm.tsx`)
- Formulaire avec onglets Connexion/Inscription
- Validation des champs :
  - Email valide
  - Mot de passe min. 6 caractères
  - Confirmation du mot de passe (inscription)
- Messages d'erreur et de succès
- Redirection automatique après connexion/inscription

#### **Header** (`components/Header.tsx`)
- Affiche l'email de l'utilisateur si connecté
- Bouton de déconnexion
- Liens vers Login/Signup si non connecté
- Lien vers Dashboard si connecté

### ✅ 2. Pages

#### **Landing Page** (`/`)
- Page d'accueil attractive avec gradient
- Section Hero avec CTA vers inscription
- Section Features
- Section CTA finale
- Liens vers Login et Signup

#### **Page Login** (`/login`)
- Utilise AuthForm en mode "signin"
- Redirection vers /dashboard après connexion

#### **Page Signup** (`/signup`)
- Utilise AuthForm en mode "signup"
- Message de confirmation après inscription
- Redirection vers /login après 3 secondes

#### **Page Dashboard** (`/dashboard`) 🔒
- **Protégée** - Redirige vers /login si non authentifié
- Formulaire de génération d'images :
  - Upload multiple d'images
  - Champ prompt
  - Aperçus avec boutons de suppression
- Galerie "Mes projets" :
  - Affiche uniquement les projets de l'utilisateur (`WHERE user_id = auth.uid()`)
  - Cartes avec image output, prompt, date
  - Boutons Télécharger et Supprimer

### ✅ 3. APIs

#### **API Generate** (`/api/generate`) 🔒
- **Protégée** - Vérifie l'authentification via token
- Retourne 401 si non authentifié
- Upload des images vers Supabase Storage
- Génération via SDXL (Replicate)
- **Ajoute automatiquement `user_id`** lors de l'INSERT dans `projects`

#### **API Delete** (`/api/delete`) 🔒
- **Protégée** - Vérifie l'authentification
- Vérifie que le projet appartient à l'utilisateur
- Supprime les images des buckets Supabase (`input-images` et `output-images`)
- Supprime l'enregistrement dans la table `projects`

### ✅ 4. Middleware (`middleware.ts`)
- Protège automatiquement :
  - `/dashboard` et toutes ses sous-routes
  - `/api/generate`
  - `/api/delete`
- Vérifie la présence du cookie de session Supabase
- Redirige vers `/login` si non authentifié (pages)
- Retourne 401 si non authentifié (APIs)

### ✅ 5. Configuration

#### **Layout mis à jour** (`app/layout.tsx`)
- Enveloppe l'app avec `<AuthProvider>`
- Ajoute le `<Header>` global
- Tous les composants peuvent utiliser `useAuth()`

## 🚀 Comment utiliser

### 1. **Configuration Supabase**

Suivez les instructions dans `SUPABASE_AUTH_SETUP.md` :
- Activer l'authentification Email
- Configurer la colonne `user_id` dans `projects`
- Appliquer les Row Level Security (RLS) policies
- Vérifier que les buckets sont publics

### 2. **Tester l'authentification**

```bash
# Démarrer le serveur
npm run dev
```

1. **Inscription** :
   - Allez sur http://localhost:3001
   - Cliquez sur "Commencer gratuitement"
   - Créez un compte avec email/mot de passe

2. **Connexion** :
   - Allez sur http://localhost:3001/login
   - Connectez-vous avec vos identifiants

3. **Dashboard** :
   - Vous êtes automatiquement redirigé vers `/dashboard`
   - Uploadez une image et générez
   - Vos projets apparaissent dans la galerie

4. **Sécurité** :
   - Déconnectez-vous
   - Essayez d'accéder à `/dashboard` → Redirection vers `/login`
   - Créez un 2e compte → Vous ne verrez que VOS projets

## 📁 Structure des fichiers créés/modifiés

```
ImageEditor/
├── contexts/
│   └── AuthContext.tsx          ✨ NOUVEAU - Context d'authentification
├── components/
│   ├── AuthForm.tsx              ✨ NOUVEAU - Formulaire de connexion/inscription
│   └── Header.tsx                ✨ NOUVEAU - Header avec état d'auth
├── app/
│   ├── layout.tsx                📝 MODIFIÉ - AuthProvider + Header
│   ├── page.tsx                  📝 MODIFIÉ - Landing page
│   ├── login/
│   │   └── page.tsx              ✨ NOUVEAU - Page de connexion
│   ├── signup/
│   │   └── page.tsx              ✨ NOUVEAU - Page d'inscription
│   ├── dashboard/
│   │   └── page.tsx              ✨ NOUVEAU - Dashboard protégé
│   └── api/
│       ├── generate/
│       │   └── route.ts          📝 MODIFIÉ - Vérif auth + user_id
│       └── delete/
│           └── route.ts          ✨ NOUVEAU - API de suppression
├── middleware.ts                 ✨ NOUVEAU - Protection des routes
├── SUPABASE_AUTH_SETUP.md        ✨ NOUVEAU - Config Supabase
└── AUTH_IMPLEMENTATION.md        ✨ NOUVEAU - Ce fichier
```

## 🔐 Sécurité

### Row Level Security (RLS)
- ✅ **Activé** sur la table `projects`
- ✅ Users ne peuvent voir que leurs propres projets
- ✅ Users ne peuvent créer que des projets avec leur propre `user_id`
- ✅ Users ne peuvent supprimer que leurs propres projets

### Protection des routes
- ✅ Middleware vérifie l'authentification
- ✅ Dashboard inaccessible sans auth
- ✅ APIs retournent 401 si non authentifié

### Validation
- ✅ Email validé (regex)
- ✅ Mot de passe min. 6 caractères
- ✅ Confirmation du mot de passe à l'inscription

## 🐛 Dépannage

### "Non authentifié" lors de la génération
- Vérifiez que vous êtes bien connecté (email affiché dans le header)
- Essayez de vous déconnecter et reconnecter

### Les projets d'un autre utilisateur s'affichent
- Vérifiez les RLS policies dans Supabase
- Vérifiez que `user_id` est bien rempli dans les projets

### Erreur lors de la suppression
- Vérifiez que les noms de buckets dans `.env.local` sont corrects
- Vérifiez les permissions des buckets dans Supabase Storage

### Redirection infinie vers /login
- Vérifiez que le cookie Supabase est bien défini
- Videz le cache du navigateur
- Vérifiez la configuration du middleware

## 📊 Base de données

### Table `projects`

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 🔑 NOUVEAU
  input_image_url TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL
);
```

### Index

```sql
CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX projects_created_at_idx ON projects(created_at DESC);
```

## 🎉 Résultat final

Vous avez maintenant un système d'authentification complet avec :
- ✅ Inscription/Connexion/Déconnexion
- ✅ Dashboard personnel protégé
- ✅ Projets isolés par utilisateur
- ✅ APIs sécurisées
- ✅ Row Level Security
- ✅ Suppression de projets
- ✅ Landing page attractive

Enjoy ! 🚀
