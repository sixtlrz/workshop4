import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
        // Vérifier la signature du webhook
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err: any) {
        console.error('⚠️ Erreur de signature webhook:', err.message);
        return NextResponse.json({ error: `Signature webhook invalide: ${err.message}` }, { status: 400 });
    }

    console.log(`✅ Événement webhook reçu: ${event.type}`);

    try {
        // Traiter les différents types d'événements
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                // Récupérer les données importantes
                const userId = session.metadata?.user_id || session.client_reference_id;
                const quotaLimit = parseInt(session.metadata?.quota_limit || '0');
                const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;

                if (userId) {
                    // Insérer ou mettre à jour l'abonnement dans la base de données
                    const { error } = await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_customer_id: stripeCustomerId,
                        status: 'active',
                        quota_limit: quotaLimit,
                        quota_used: 0,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    });

                    if (error) {
                        console.error('❌ Erreur lors de l\'upsert de l\'abonnement:', error);
                    } else {
                        console.log(`✅ Abonnement créé/mis à jour pour l'utilisateur ${userId}`);
                    }
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const stripeSubscriptionId = subscription.id;
                const stripeCustomerId = subscription.customer as string;
                const priceId = subscription.items.data[0]?.price.id;
                const status = subscription.status;

                // Déterminer le quota en fonction du plan
                const quotaLimit = priceId?.includes('prod_TFLmxTVdTMis5P') ? 200 : 50;

                // Dates de début et fin de période
                const current_period_start = (subscription as any).current_period_start
                    ? new Date(((subscription as any).current_period_start as number) * 1000).toISOString()
                    : null;
                const current_period_end = (subscription as any).current_period_end
                    ? new Date(((subscription as any).current_period_end as number) * 1000).toISOString()
                    : null;

                // Trouver l'utilisateur associé au client Stripe
                let userId: string | null = subscription.metadata?.user_id;

                if (!userId) {
                    const { data } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_id')
                        .eq('stripe_customer_id', stripeCustomerId)
                        .limit(1)
                        .single();

                    userId = data?.user_id || null;
                }

                if (userId) {
                    // Mettre à jour l'abonnement dans la base de données
                    const { error } = await supabaseAdmin.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_customer_id: stripeCustomerId,
                        stripe_subscription_id: stripeSubscriptionId,
                        stripe_price_id: priceId,
                        status,
                        quota_limit: quotaLimit,
                        quota_used: 0, // Réinitialiser le quota utilisé au début d'une période
                        current_period_start,
                        current_period_end,
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id'
                    });

                    if (error) {
                        console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
                    } else {
                        console.log(`✅ Abonnement mis à jour pour l'utilisateur ${userId}`);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const stripeCustomerId = subscription.customer as string;

                // Trouver l'utilisateur associé au client Stripe
                const { data } = await supabaseAdmin
                    .from('subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', stripeCustomerId)
                    .limit(1)
                    .single();

                const userId = data?.user_id;

                if (userId) {
                    // Mettre à jour le statut de l'abonnement
                    const { error } = await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: 'canceled',
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userId);

                    if (error) {
                        console.error('❌ Erreur lors de l\'annulation de l\'abonnement:', error);
                    } else {
                        console.log(`✅ Abonnement annulé pour l'utilisateur ${userId}`);
                    }
                }
                break;
            }

            default:
                // Ignorer les autres types d'événements
                console.log(`ℹ️ Événement ignoré: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('❌ Erreur lors du traitement du webhook:', err);
        return NextResponse.json(
            { error: 'Erreur lors du traitement du webhook', details: err.message },
            { status: 500 }
        );
    }
}