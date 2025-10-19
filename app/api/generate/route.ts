import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { createServerClient } from '@supabase/ssr';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    // Créer un client Supabase qui utilise les cookies de la requête
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Pas besoin de set dans une API route
          },
          remove(name: string, options: any) {
            // Pas besoin de remove dans une API route
          },
        },
      }
    );

    // Vérifier l'authentification via les cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Erreur auth:', authError);
      return NextResponse.json(
        { error: 'Non authentifié', details: authError?.message },
        { status: 401 }
      );
    }

    console.log('✅ Utilisateur authentifié:', user.email);

    // --- Subscription / quota check ---
    try {
      const { data: subsData, error: subsError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (subsError) {
        console.warn('Could not fetch subscription info:', subsError.message);
      }

      const subscription = Array.isArray(subsData) && subsData.length > 0 ? subsData[0] : null;

      if (!subscription || subscription.status !== 'active') {
        return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
      }

      const quotaLimit = subscription.quota_limit ?? 0;
      const quotaUsed = subscription.quota_used ?? 0;

      if (quotaLimit > 0 && quotaUsed >= quotaLimit) {
        return NextResponse.json({ error: 'Quota exceeded' }, { status: 403 });
      }
    } catch (e) {
      console.warn('Subscription check failed', e);
    }

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

    // 3. Appeler Replicate avec l'image principale et le prompt (SDXL img2img)
    console.log('🤖 Appel à Replicate SDXL img2img...');
    console.log('Modèle utilisé:', process.env.REPLICATE_MODEL_ID);
    console.log('Image source:', mainImageUrl);
    console.log('Prompt:', enhancedPrompt);

    const output = await replicate.run(
      process.env.REPLICATE_MODEL_ID as `${string}/${string}:${string}`,
      {
        input: {
          image: mainImageUrl,  // L'image source pour img2img
          prompt: enhancedPrompt,  // Le prompt de transformation
          refine: "expert_ensemble_refiner",  // Pour une meilleure qualité
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "ugly, distorted, low quality, blurry",
          prompt_strength: 0.8,  // Force du prompt (0.8 = transformation modérée)
          num_inference_steps: 40,
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

    // 9. Sauvegarder dans la table projects avec user_id
    console.log('💾 Sauvegarde dans la base de données...');
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id, // ID de l'utilisateur authentifié
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

    // 10. Mettre à jour le quota utilisé
    try {
      const { data: subscription, error: subsGetError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!subsGetError && subscription) {
        const currentQuota = subscription.quota_used || 0;

        const { error: subsUpdateError } = await supabaseAdmin
          .from('subscriptions')
          .update({
            quota_used: currentQuota + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (subsUpdateError) {
          console.error('❌ Erreur mise à jour quota:', subsUpdateError);
        } else {
          console.log(`✅ Quota utilisé mis à jour: ${currentQuota} → ${currentQuota + 1}`);
        }
      }
    } catch (e) {
      console.error('❌ Erreur lors de la mise à jour du quota:', e);
    }

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
