# AI Image Editor 🎨

Un éditeur d'images alimenté par l'IA utilisant Next.js, Supabase et Replicate.

## 🚀 Fonctionnalités

- **Upload multiple d'images** - Téléchargez plusieurs images à la fois
- **Transformation d'images via IA** - Utilise le modèle Instruct-Pix2Pix de Replicate
- **Image-to-Image avec prompt** - Transforme une image selon vos instructions textuelles
- **Stockage dans Supabase** - Toutes les images sont stockées de manière sécurisée
- **Interface moderne et intuitive** - Design épuré et facile à utiliser
- **Historique des transformations** - Toutes les générations sont sauvegardées en base de données

## 📋 Prérequis

Avant de commencer, vous devez avoir :

1. **Un compte Supabase** avec :
   - Un projet créé
   - Deux buckets de storage : `input-images` et `output-images` (publics)
   - Une table `projects` créée

2. **Un compte Replicate** avec :
   - Un token API
   - L'identifiant du modèle que vous souhaitez utiliser

## 🛠️ Configuration Supabase

### 1. Créer les buckets de storage

Dans votre dashboard Supabase, allez dans **Storage** et créez deux buckets :

- `input-images` (public)
- `output-images` (public)

### 2. Créer la table projects

Dans **SQL Editor**, exécutez :

\`\`\`sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Désactiver RLS pour faciliter le développement (à sécuriser en production)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
\`\`\`

## 📦 Installation

1. **Installez les dépendances :**

\`\`\`bash
npm install
\`\`\`

2. **Configurez vos variables d'environnement :**

Éditez le fichier `.env.local` et remplacez les valeurs par les vôtres :

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Replicate Configuration
REPLICATE_API_TOKEN=votre_token_replicate

# Supabase Storage Buckets
NEXT_PUBLIC_INPUT_BUCKET=input-images
NEXT_PUBLIC_OUTPUT_BUCKET=output-images

# Replicate Model
REPLICATE_MODEL_ID=owner/model:version
\`\`\`

### 🔑 Où trouver vos clés ?

**Supabase :**
- URL du projet : Dashboard > Settings > API > Project URL
- Anon Key : Dashboard > Settings > API > Project API keys > anon public
- Service Role Key : Dashboard > Settings > API > Project API keys > service_role

**Replicate :**
- API Token : https://replicate.com/account/api-tokens
- Model ID : Sur la page du modèle, format `owner/model:version`

## 🎯 Utilisation

1. **Lancez le serveur de développement :**

\`\`\`bash
npm run dev
\`\`\`

2. **Ouvrez votre navigateur :**

Allez sur [http://localhost:3000](http://localhost:3000)

3. **Utilisez l'application :**

- Sélectionnez une image
- Décrivez la transformation souhaitée
- Cliquez sur "Générer"
- Attendez que l'IA transforme votre image
- Téléchargez le résultat

## 📁 Structure du projet

\`\`\`
ImageEditor/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # API route pour la génération
│   ├── page.tsx               # Page principale
│   ├── layout.tsx             # Layout
│   └── globals.css            # Styles globaux
├── lib/
│   └── supabaseClient.ts      # Configuration Supabase
├── .env.local                 # Variables d'environnement
├── package.json
└── README.md
\`\`\`

## 🔧 Comment ça marche ?

1. L'utilisateur upload une image via le formulaire
2. L'image est envoyée à l'API `/api/generate`
3. L'API upload l'image dans Supabase Storage (bucket `input-images`)
4. L'API appelle Replicate avec l'URL de l'image et le prompt
5. Replicate génère une nouvelle image
6. L'API télécharge l'image générée
7. L'API upload l'image générée dans Supabase Storage (bucket `output-images`)
8. L'API sauvegarde les URLs et le prompt dans la table `projects`
9. L'URL de l'image générée est retournée au client
10. L'image générée s'affiche dans l'interface

## 🚨 Résolution de problèmes

### Erreur "Bucket does not exist"
- Vérifiez que les buckets `input-images` et `output-images` existent dans Supabase Storage
- Vérifiez qu'ils sont bien configurés comme publics

### Erreur "Table projects does not exist"
- Exécutez le script SQL fourni dans la section Configuration

### Erreur Replicate
- Vérifiez que votre token API est valide
- Vérifiez que l'ID du modèle est correct (format `owner/model:version`)
- Assurez-vous d'avoir des crédits sur votre compte Replicate

### Images non visibles
- Vérifiez que les buckets sont bien publics dans Supabase
- Vérifiez les politiques RLS si activées

## 📝 Notes importantes

- Les buckets de storage doivent être **publics** pour que les images soient accessibles
- La table `projects` doit avoir **RLS désactivé** ou des politiques configurées
- Replicate facture selon l'utilisation, surveillez vos crédits
- En production, sécurisez mieux l'accès à l'API

## 🎨 Personnalisation

Vous pouvez personnaliser :
- Le modèle Replicate utilisé (changez `REPLICATE_MODEL_ID`)
- Les styles de l'interface (modifiez `app/page.tsx`)
- Les paramètres passés à Replicate (dans `app/api/generate/route.ts`)

## 📄 Licence

Ce projet est libre d'utilisation pour vos projets personnels et commerciaux.

---

Fait avec ❤️ en utilisant Next.js, Supabase et Replicate
