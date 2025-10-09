# Changelog - Image Editor

## Version 2.0 - Multi-images et Image-to-Image

### ✨ Nouvelles fonctionnalités

#### 1. **Modèle Replicate Image-to-Image**
- ✅ **Changement de modèle** : Passage de `google/nano-banana` à `timothybrooks/instruct-pix2pix`
- ✅ Le nouveau modèle prend en compte **à la fois l'image ET le prompt**
- ✅ Génération d'images basée sur une image source + instructions textuelles
- ✅ Paramètres optimisés :
  - `num_inference_steps: 50` - Qualité de génération
  - `guidance_scale: 7.5` - Fidélité au prompt
  - `image_guidance_scale: 1.5` - Fidélité à l'image source

#### 2. **Upload multiple d'images**
- ✅ **Interface mise à jour** : Possibilité de sélectionner plusieurs images
- ✅ **Aperçu des images** : Affichage de toutes les images sélectionnées
- ✅ **Suppression individuelle** : Bouton × pour retirer une image
- ✅ **Compteur d'images** : Le bouton affiche le nombre d'images sélectionnées

#### 3. **Gestion backend améliorée**
- ✅ **Upload de toutes les images** : Toutes les images sont uploadées sur Supabase
- ✅ **Image principale** : La première image est utilisée pour la génération IA
- ✅ **Prompt enrichi** : Mention du nombre d'images de référence
- ✅ **Retour complet** : L'API renvoie toutes les URLs des images uploadées

### 🔧 Modifications techniques

#### Frontend (`app/page.tsx`)
```typescript
// Avant : Une seule image
const [file, setFile] = useState<File | null>(null);
const [preview, setPreview] = useState<string | null>(null);

// Après : Plusieurs images
const [files, setFiles] = useState<File[]>([]);
const [previews, setPreviews] = useState<string[]>([]);
```

#### Backend (`app/api/generate/route.ts`)
```typescript
// Avant : Une image
const image = formData.get('image') as File;

// Après : Plusieurs images
const images = formData.getAll('images') as File[];

// Upload de toutes les images
for (let i = 0; i < images.length; i++) {
  // ... upload logic
}

// Utilisation de la première image pour Replicate
const mainImageUrl = inputImageUrls[0];
```

### 📝 Configuration

Mise à jour du fichier `.env.local` :
```bash
# Nouveau modèle Replicate
REPLICATE_MODEL_ID=timothybrooks/instruct-pix2pix
```

### 🎯 Comment utiliser

1. **Sélectionnez une ou plusieurs images** en cliquant sur le bouton de sélection
2. **Visualisez** toutes vos images avec possibilité de les supprimer individuellement
3. **Décrivez la transformation** dans le champ prompt (ex: "make it look like a painting", "add a sunset", etc.)
4. **Générez** - L'image principale sera transformée selon vos instructions
5. **Téléchargez** le résultat

### ⚠️ Notes importantes

- Le modèle `instruct-pix2pix` nécessite une image source
- Seule la première image est utilisée pour la génération (les autres sont uploadées mais pas transformées pour l'instant)
- Le prompt doit être en anglais pour de meilleurs résultats
- Le temps de génération est d'environ 10-30 secondes

### 🔜 Améliorations futures possibles

- Fusion/composition de plusieurs images en une seule avant génération
- Sélection de l'image principale parmi celles uploadées
- Batch processing : générer une image par image uploadée
- Choix du modèle Replicate depuis l'interface
