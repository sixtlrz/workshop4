import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image et prompt requis' },
        { status: 400 }
      );
    }

    console.log('📤 Upload de l\'image vers Supabase...');

    // 1. Convertir le fichier en buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload de l'image originale dans input-images bucket
    const fileName = `${Date.now()}-${image.name}`;
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
        { error: 'Erreur lors de l\'upload de l\'image', details: uploadError.message },
        { status: 500 }
      );
    }

    // 3. Récupérer l'URL publique de l'image uploadée
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
      .getPublicUrl(fileName);

    const inputImageUrl = publicUrlData.publicUrl;
    console.log('✅ Image uploadée:', inputImageUrl);

    // 4. Appeler Replicate avec l'URL de l'image
    console.log('🤖 Appel à Replicate...');
    const output = await replicate.run(
      process.env.REPLICATE_MODEL_ID as `${string}/${string}:${string}`,
      {
        input: {
          image: inputImageUrl,
          prompt: prompt,
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
        input_image_url: inputImageUrl,
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
      inputImageUrl,
      outputImageUrl,
      prompt,
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
