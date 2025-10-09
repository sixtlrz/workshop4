import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    const prompt = formData.get('prompt') as string;

    if (!images || images.length === 0 || !prompt) {
      return NextResponse.json(
        { error: 'Au moins une image et un prompt requis' },
        { status: 400 }
      );
    }

    console.log(`📤 Upload de ${images.length} image(s) vers Supabase...`);

    // 1. Uploader toutes les images et récupérer leurs URLs
    const inputImageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `${Date.now()}-${i}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
        .upload(fileName, buffer, {
          contentType: image.type || 'application/octet-stream',
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('❌ Erreur upload:', uploadError);
        return NextResponse.json(
          { error: `Erreur lors de l'upload de l'image ${i + 1}`, details: uploadError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
        .getPublicUrl(fileName);

      inputImageUrls.push(publicUrlData.publicUrl);
      console.log(`✅ Image ${i + 1} uploadée:`, publicUrlData.publicUrl);
    }

    // 2. Utiliser la première image comme image principale pour Replicate
    const mainImageUrl = inputImageUrls[0];
    
    // Si plusieurs images, on peut les mentionner dans le prompt
    const enhancedPrompt = images.length > 1 
      ? `${prompt} (en tenant compte de ${images.length} images de référence)`
      : prompt;

    // 3. Appeler Replicate avec l'image principale et le prompt
    console.log('🤖 Appel à Replicate avec image principale...');
    const output = await replicate.run(
      process.env.REPLICATE_MODEL_ID as `${string}/${string}:${string}`,
      {
        input: {
          image: mainImageUrl,
          prompt: enhancedPrompt,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          image_guidance_scale: 1.5,
        }
      }
    );

    console.log('✅ Réponse de Replicate:', output);

    // 5. Récupérer l'URL de l'image générée
    let generatedImageUrl: string;
    if (Array.isArray(output) && output.length > 0) {
      generatedImageUrl = output[0];
    } else if (typeof output === 'string') {
      generatedImageUrl = output;
    } else {
      throw new Error('Format de réponse Replicate inattendu');
    }

    // 6. Télécharger l'image générée
    console.log('⬇️ Téléchargement de l\'image générée...');
    const imageResponse = await fetch(generatedImageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // 7. Upload de l'image générée dans output-images bucket
    const outputFileName = `output-${Date.now()}.png`;
    const { data: outputUploadData, error: outputUploadError } = await supabaseAdmin
      .storage
      .from(process.env.NEXT_PUBLIC_OUTPUT_BUCKET!)
      .upload(outputFileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (outputUploadError) {
      console.error('❌ Erreur upload image générée:', outputUploadError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload de l\'image générée', details: outputUploadError.message },
        { status: 500 }
      );
    }

    // 8. Récupérer l'URL publique de l'image générée
    const { data: outputPublicUrlData } = supabaseAdmin
      .storage
      .from(process.env.NEXT_PUBLIC_OUTPUT_BUCKET!)
      .getPublicUrl(outputFileName);

    const outputImageUrl = outputPublicUrlData.publicUrl;
    console.log('✅ Image générée uploadée:', outputImageUrl);

    // 9. Sauvegarder dans la table projects
    console.log('💾 Sauvegarde dans la base de données...');
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        input_image_url: mainImageUrl, // Image principale
        output_image_url: outputImageUrl,
        prompt: prompt,
        status: 'completed',
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Erreur sauvegarde projet:', projectError);
      // On continue quand même car l'image a été générée
    }

    console.log('✅ Projet sauvegardé:', projectData);

    return NextResponse.json({
      success: true,
      inputImageUrls, // Toutes les URLs d'input
      mainImageUrl, // Image principale utilisée
      outputImageUrl,
      prompt: enhancedPrompt,
      projectId: projectData?.id,
    });

  } catch (error: any) {
    console.error('❌ Erreur complète:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération de l\'image',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
