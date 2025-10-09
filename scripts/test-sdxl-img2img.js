// Test rapide du modèle SDXL img2img
const fs = require('fs');
const path = require('path');

// Charger manuellement le .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
    }
});

const Replicate = require('replicate');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function testSDXL() {
    console.log('🧪 Test du modèle SDXL img2img...');
    console.log('Modèle:', process.env.REPLICATE_MODEL_ID);

    try {
        // Utiliser votre image uploadée sur Supabase
        const testImageUrl = 'https://jjewkbqgvkafiylcrqsh.supabase.co/storage/v1/object/public/input-images/1760014724628-0-testIA.webp';
        const testPrompt = 'a dog wearing a red hat and holding a ball in its mouth';

        console.log('\n📸 Image de test:', testImageUrl);
        console.log('📝 Prompt:', testPrompt);
        console.log('\n⏳ Génération en cours...\n');

        const output = await replicate.run(
            process.env.REPLICATE_MODEL_ID,
            {
                input: {
                    image: testImageUrl,
                    prompt: testPrompt,
                    refine: "expert_ensemble_refiner",
                    scheduler: "K_EULER",
                    lora_scale: 0.6,
                    num_outputs: 1,
                    guidance_scale: 7.5,
                    apply_watermark: false,
                    high_noise_frac: 0.8,
                    negative_prompt: "ugly, distorted, low quality, blurry",
                    prompt_strength: 0.8,
                    num_inference_steps: 40,
                }
            }
        );

        console.log('✅ SUCCESS! Réponse:', output);
        console.log('\n🎉 Le modèle fonctionne correctement!');

        if (Array.isArray(output) && output.length > 0) {
            console.log('\n🖼️  URL de l\'image générée:', output[0]);
        }

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        console.error('\nDétails:', error);
    }
}

testSDXL();
