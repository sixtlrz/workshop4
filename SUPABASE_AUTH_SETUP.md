# Configuration Supabase pour l'authentification

## 🔐 Configuration de l'authentification

### 1. Activer l'authentification Email dans Supabase Dashboard

1. Allez dans **Authentication** > **Providers**
2. Activez **Email**
3. Désactivez "Confirm email" si vous voulez tester rapidement (sinon les utilisateurs doivent confirmer leur email)

### 2. Mettre à jour la table `projects`

La colonne `user_id` doit être de type UUID et faire référence à `auth.users(id)`.

Exécutez ce SQL dans **SQL Editor** :

```sql
-- Ajouter la colonne user_id si elle n'existe pas déjà
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances des requêtes filtrées par user_id
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
```

### 3. Configurer les Row Level Security (RLS) Policies

Exécutez ce SQL pour sécuriser la table `projects` :

```sql
-- Activer RLS sur la table projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres projets
CREATE POLICY "Users can view their own projects" 
ON projects FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer des projets (avec leur propre user_id)
CREATE POLICY "Users can insert their own projects" 
ON projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour uniquement leurs propres projets
CREATE POLICY "Users can update their own projects" 
ON projects FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer uniquement leurs propres projets
CREATE POLICY "Users can delete their own projects" 
ON projects FOR DELETE 
USING (auth.uid() = user_id);
```

### 4. Vérifier la configuration des Storage Buckets

Les buckets `input-images` et `output-images` doivent être **publics** pour que les URLs fonctionnent.

1. Allez dans **Storage**
2. Pour chaque bucket (`input-images` et `output-images`) :
   - Cliquez sur les 3 points > **Edit bucket**
   - Assurez-vous que **Public bucket** est coché
   - Sauvegardez

### 5. (Optionnel) Policies RLS pour les Storage Buckets

Si vous voulez que seuls les utilisateurs authentifiés puissent uploader :

```sql
-- Policy: Tout le monde peut lire (car les buckets sont publics)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('input-images', 'output-images'));

-- Policy: Seulement les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('input-images', 'output-images') 
  AND auth.role() = 'authenticated'
);

-- Policy: Les utilisateurs peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('input-images', 'output-images') 
  AND auth.role() = 'authenticated'
);
```

## ✅ Vérification

Une fois ces configurations appliquées :

1. **Créez un compte** sur `/signup`
2. **Connectez-vous** sur `/login`
3. **Accédez au dashboard** `/dashboard`
4. **Générez une image** - elle devrait être associée à votre user_id
5. **Vérifiez dans Supabase** que la colonne `user_id` est bien remplie
6. **Déconnectez-vous** et reconnectez-vous avec un autre compte - vous ne devriez voir que vos propres projets

## 🔧 Dépannage

### Erreur "row-level security policy"
- Vérifiez que les policies RLS sont bien créées
- Vérifiez que `user_id` est bien rempli dans les nouveaux projets

### Erreur "Cannot read properties of null"
- Vérifiez que l'utilisateur est bien authentifié avant d'accéder au dashboard
- Vérifiez que le middleware protège bien les routes

### Les images ne s'affichent pas
- Vérifiez que les buckets sont bien **publics**
- Vérifiez les URLs dans la console du navigateur
