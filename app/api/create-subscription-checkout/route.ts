import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { priceId } = await request.json();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur authentifié
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Créer ou récupérer le customer Stripe
        let customerId: string;

        // Vérifier si l'utilisateur a déjà un customer Stripe
        const { data: existingCustomer } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (existingCustomer?.stripe_customer_id) {
            customerId = existingCustomer.stripe_customer_id;
        } else {
            // Créer un nouveau customer Stripe
            const customer = await stripe.customers.create({
                email: user.email!,
                metadata: {
                    supabase_user_id: user.id,
                },
            });

            customerId = customer.id;

            // Sauvegarder le customer ID dans Supabase
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // Construire l'URL de base
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

        // Créer une Checkout Session avec mode: 'subscription'
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/pricing`,
            metadata: {
                user_id: user.id,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
