import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        // Extraire le token d'authentification de l'en-tête
        const authHeader = request.headers.get('authorization') || '';
        const token = authHeader.replace('Bearer ', '').trim();

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Vérifier l'utilisateur avec le token
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

        if (userError || !userData?.user) {
            console.error('Erreur d\'authentification:', userError);
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Récupérer les données de la requête
        const body = await request.json();
        const priceId = body.priceId;

        if (!priceId) {
            return NextResponse.json({ error: 'ID de prix manquant' }, { status: 400 });
        }

        // Déterminer le quota en fonction du plan
        const quotaLimit = priceId === 'prod_TFLgwWmjoHmfAO' ? 50 : 200;

        // Créer une session de paiement Stripe
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            customer_email: userData.user.email,
            client_reference_id: userData.user.id,
            metadata: {
                user_id: userData.user.id,
                quota_limit: quotaLimit.toString()
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/dashboard?subscription=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/pricing?subscription=cancelled`
        });

        // Retourner l'URL de la session Stripe
        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Erreur lors de la création de la session de paiement:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la création de la session de paiement', details: error.message },
            { status: 500 }
        );
    }
}