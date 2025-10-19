'use client';

import React from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface SubscribeButtonProps {
    priceId: string;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export default function SubscribeButton({
    priceId,
    label = "S'abonner",
    className = "",
    style,
    disabled = false
}: SubscribeButtonProps) {
    const handleSubscribe = async () => {
        try {
            // Créer un client Supabase côté navigateur
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // Récupérer la session utilisateur
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                // Rediriger vers login si non connecté
                window.location.href = '/login?redirect=pricing';
                return;
            }

            // Appeler l'API pour créer une session de paiement
            const res = await fetch('/api/create-subscription-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priceId })
            });

            const json = await res.json();

            if (json?.url) {
                // Rediriger vers la page de paiement Stripe
                window.location.href = json.url;
            } else {
                alert(json?.error || "Impossible de créer une session de paiement");
            }
        } catch (err: any) {
            console.error("Erreur lors de la création de la session de paiement", err);
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        }
    };

    const defaultClasses = disabled
        ? "px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed opacity-70"
        : "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-none transition-colors";

    const buttonClasses = className || defaultClasses;

    return (
        <button
            onClick={handleSubscribe}
            className={style ? '' : buttonClasses}
            style={style}
            disabled={disabled}
            title={disabled ? "Vous avez déjà un abonnement actif" : undefined}
        >
            {disabled ? "Déjà abonné" : label}
        </button>
    );
}