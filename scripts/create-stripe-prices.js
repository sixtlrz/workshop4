// Script pour créer les prix Stripe pour les plans Basic et Pro
// Usage: node scripts/create-stripe-prices.js <STRIPE_SECRET_KEY>
// Exemple: node scripts/create-stripe-prices.js sk_test_xxx...

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// Lire le fichier .env.local
let stripeSecretKey;
let basicProductId = 'prod_TFLgwWmjoHmfAO';
let proProductId = 'prod_TFLmxTVdTMis5P';

try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    lines.forEach(line => {
        if (line.startsWith('STRIPE_SECRET_KEY=')) {
            stripeSecretKey = line.split('=')[1].trim();
        }
        if (line.startsWith('STRIPE_BASIC_PRICE_ID=') && line.includes('prod_')) {
            basicProductId = line.split('=')[1].trim();
        }
        if (line.startsWith('STRIPE_PRO_PRICE_ID=') && line.includes('prod_')) {
            proProductId = line.split('=')[1].trim();
        }
    });
} catch (error) {
    console.error('❌ Impossible de lire le fichier .env.local');
    process.exit(1);
}

if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY non trouvée dans .env.local');
    process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

async function createPrices() {
    try {
        console.log('🚀 Création des prix Stripe...\n');

        // Créer le prix pour le plan Basic (9€/mois)
        console.log('📦 Création du prix pour le plan Basic...');
        const basicPrice = await stripe.prices.create({
            product: basicProductId,
            unit_amount: 900, // 9€ en centimes
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
            nickname: 'Plan Basic - 9€/mois',
        });
        console.log(`✅ Prix Basic créé: ${basicPrice.id}\n`);

        // Créer le prix pour le plan Pro (19€/mois)
        console.log('📦 Création du prix pour le plan Pro...');
        const proPrice = await stripe.prices.create({
            product: proProductId,
            unit_amount: 1900, // 19€ en centimes
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
            nickname: 'Plan Pro - 19€/mois',
        });
        console.log(`✅ Prix Pro créé: ${proPrice.id}\n`);

        console.log('🎉 Tous les prix ont été créés avec succès!\n');
        console.log('📝 Mettez à jour ces valeurs dans votre fichier .env.local :\n');
        console.log(`STRIPE_BASIC_PRICE_ID=${basicPrice.id}`);
        console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
        console.log('\n⚠️  Ensuite, mettez à jour le fichier app/pricing/page.tsx avec ces IDs.');
        console.log('⚠️  Redémarrez le serveur Next.js après avoir modifié .env.local');

    } catch (error) {
        console.error('❌ Erreur lors de la création des prix:', error.message);
        if (error.type === 'StripeAuthenticationError') {
            console.error('⚠️  Vérifiez que votre STRIPE_SECRET_KEY est correcte dans .env.local');
        }
    }
}

createPrices();