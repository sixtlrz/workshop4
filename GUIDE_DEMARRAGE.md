# 🎯 GUIDE DE DÉMARRAGE RAPIDE

## ✅ Ce qui a été créé :

Tous les fichiers du projet AI Image Editor sont maintenant dans le dossier :
`C:\Users\user\Desktop\XHEC\ELECTIVES\IA IN PROD\Workshop4\ImageEditor`

Les dépendances npm ont été installées avec succès !

## 📋 ÉTAPES SUIVANTES (IMPORTANT) :

### 1. Ouvrir le projet dans VS Code

Dans VS Code, allez dans : **File > Open Folder** 
Puis sélectionnez le dossier : 
`C:\Users\user\Desktop\XHEC\ELECTIVES\IA IN PROD\Workshop4\ImageEditor`

Vous verrez alors tous les fichiers dans la barre latérale !

### 2. Configurer vos clés API

Éditez le fichier `.env.local` et remplacez les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (votre vraie clé)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (votre vraie clé service)
REPLICATE_API_TOKEN=r8_... (votre vraie clé Replicate)
REPLICATE_MODEL_ID=owner/model:version (ID du modèle que vous voulez utiliser)
```

### 3. Créer la base de données Supabase

Dans votre dashboard Supabase (https://supabase.com/dashboard) :

#### A. Créer les buckets de storage :
- Allez dans **Storage**
- Créez un bucket nommé `input-images` (cochez **Public**)
- Créez un bucket nommé `output-images` (cochez **Public**)

#### B. Créer la table :
- Allez dans **SQL Editor**
- Cliquez sur **New Query**
- Copiez-collez ce code :

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  input_image_url TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Désactiver RLS pour le développement
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

- Cliquez sur **RUN**

### 4. Lancer le projet

Dans le terminal de VS Code (ou PowerShell dans le dossier ImageEditor) :

```bash
npm run dev
```

### 5. Tester l'application

Ouvrez votre navigateur sur : **http://localhost:3000**

## 🔑 Où trouver vos clés ?

### Supabase :
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → NEXT_PUBLIC_SUPABASE_URL
   - **anon public** → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service_role** (cliquez sur "Reveal") → SUPABASE_SERVICE_ROLE_KEY

### Replicate :
1. Allez sur https://replicate.com/account/api-tokens
2. Créez un token → REPLICATE_API_TOKEN
3. Choisissez un modèle (ex: stability-ai/stable-diffusion)
4. Copiez l'ID du modèle au format `owner/model:version`

## 🎨 Modèles Replicate recommandés :

- **stable-diffusion** : stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf
- **instruct-pix2pix** : timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f

## 📞 Besoin d'aide ?

Consultez le fichier **README.md** pour plus de détails et la résolution de problèmes !

---

🚀 Bon développement !
