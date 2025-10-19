'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SubscribeButton from '@/components/SubscribeButton';
import { CSSProperties } from 'react';

export default function PricingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Styles pour la page - Inspiré du design moderne
    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
        } as CSSProperties,
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            maxWidth: '1000px',
            margin: '0 auto',
        } as CSSProperties,
        card: {
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '1px solid #E8DCC4',
            position: 'relative',
        } as CSSProperties,
        cardHighlighted: {
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            border: '2px solid #6B7F5C',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(107, 127, 92, 0.15)',
        } as CSSProperties,
        cardHeader: {
            padding: '3rem 2.5rem',
            borderBottom: '1px solid #E8DCC4',
        } as CSSProperties,
        cardTitle: {
            fontSize: '1.5rem',
            fontWeight: '900',
            color: '#4A5D3F',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
        } as CSSProperties,
        priceContainer: {
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem',
        } as CSSProperties,
        price: {
            fontSize: '4.5rem',
            fontWeight: '900',
            color: '#2C3A2B',
            lineHeight: '1',
        } as CSSProperties,
        period: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#8B956D',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        } as CSSProperties,
        featureList: {
            marginTop: '2rem',
            listStyleType: 'none',
            padding: '0',
        } as CSSProperties,
        featureItem: {
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '1.2rem',
            paddingLeft: '0',
        } as CSSProperties,
        featureCheck: {
            color: '#6B7F5C',
            marginRight: '0.75rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            minWidth: '20px',
        } as CSSProperties,
        featureText: {
            fontSize: '0.95rem',
            color: '#6B7F5C',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '600',
        } as CSSProperties,
        cardFooter: {
            padding: '2.5rem',
            backgroundColor: '#F5F1E8',
        } as CSSProperties,
        pageHeader: {
            textAlign: 'center',
            marginBottom: '5rem',
            paddingTop: '4rem',
        } as CSSProperties,
        heading: {
            fontSize: '4.5rem',
            fontWeight: '900',
            marginBottom: '1.5rem',
            color: '#2C3A2B',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: '1.1',
        } as CSSProperties,
        subheading: {
            fontSize: '1.1rem',
            color: '#8B956D',
            maxWidth: '600px',
            margin: '1.5rem auto 0',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: '600',
        } as CSSProperties,
        badge: {
            backgroundColor: '#6B7F5C',
            color: '#F5F1E8',
            fontSize: '0.7rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0.6rem 1.2rem',
            display: 'inline-block',
            position: 'absolute',
            top: '2rem',
            right: '2rem',
        } as CSSProperties,
        subscriptionActive: {
            marginBottom: '3rem',
            padding: '1.5rem 2.5rem',
            border: '2px solid #9CAF88',
            backgroundColor: '#FFFFFF',
            maxWidth: '700px',
            margin: '0 auto 3rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: '#4A5D3F',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.95rem',
        } as CSSProperties,
        footer: {
            marginTop: '5rem',
            textAlign: 'center',
            color: '#8B956D',
            fontSize: '0.75rem',
            maxWidth: '700px',
            margin: '5rem auto 0 auto',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: '600',
        } as CSSProperties,
        pageContainer: {
            minHeight: '100vh',
            background: '#F5F1E8',
            paddingBottom: '5rem',
        } as CSSProperties,
        mainContent: {
            paddingTop: '2rem',
            paddingBottom: '4rem',
        } as CSSProperties,
    };

    // Vérifie si l'utilisateur a déjà un abonnement
    useEffect(() => {
        const checkSubscription = async () => {
            if (!user) return;

            try {
                const { supabase } = await import('@/lib/supabaseClient');
                const { data, error } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (!error && data && data.length > 0) {
                    setCurrentSubscription(data[0]);
                }
            } catch (err) {
                console.error('Erreur lors de la vérification de l\'abonnement:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading) {
            checkSubscription();
        }
    }, [user, loading]);

    // Redirection vers login si non connecté
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=pricing');
        }
    }, [user, loading, router]);

    // Affiche la page d'abonnement si l'utilisateur est connecté
    if (loading || (!user && typeof window !== 'undefined')) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
                <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#6B7F5C' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <main style={{ ...styles.container, ...styles.mainContent }}>
                <div style={styles.pageHeader}>
                    <h1 style={styles.heading}>
                        PLANS & TARIFS
                    </h1>
                    <p style={styles.subheading}>
                        Choisissez le plan qui correspond à vos besoins
                    </p>
                </div>

                {currentSubscription && currentSubscription.status === 'active' && (
                    <div style={styles.subscriptionActive}>
                        <span style={{ fontWeight: 'bold' }}>✓</span>
                        ABONNEMENT ACTIF — {currentSubscription.stripe_price_id?.includes('prod_TFLmxTVdTMis5P') ? 'PRO' : 'BASIC'}
                    </div>
                )}

                <div style={styles.grid}>
                    {/* Plan Basic */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Basic</h2>
                            <div style={styles.priceContainer}>
                                <span style={styles.price}>9€</span>
                                <span style={styles.period}>/mois</span>
                            </div>

                            <ul style={styles.featureList}>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>50 générations / mois</span>
                                </li>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>Toutes les fonctionnalités</span>
                                </li>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>Support par email</span>
                                </li>
                            </ul>
                        </div>
                        <div style={styles.cardFooter}>
                            <SubscribeButton
                                priceId="price_1SIqz8PkubGVJLhJr3Nhw2mP"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '1.2rem 2rem',
                                    border: '2px solid #6B7F5C',
                                    fontSize: '0.85rem',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    backgroundColor: 'transparent',
                                    color: '#6B7F5C',
                                    cursor: currentSubscription?.status === 'active' ? 'not-allowed' : 'pointer',
                                    opacity: currentSubscription?.status === 'active' ? 0.5 : 1,
                                    transition: 'all 0.3s ease',
                                }}
                                label={currentSubscription?.status === 'active' ? "DÉJÀ ABONNÉ" : "S'ABONNER"}
                                disabled={currentSubscription?.status === 'active'}
                            />
                        </div>
                    </div>

                    {/* Plan Pro */}
                    <div style={styles.cardHighlighted}>
                        <div style={styles.badge}>
                            POPULAIRE
                        </div>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Pro</h2>
                            <div style={styles.priceContainer}>
                                <span style={styles.price}>19€</span>
                                <span style={styles.period}>/mois</span>
                            </div>

                            <ul style={styles.featureList}>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>200 générations / mois</span>
                                </li>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>Accès prioritaire</span>
                                </li>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>Support prioritaire</span>
                                </li>
                                <li style={styles.featureItem}>
                                    <span style={styles.featureCheck}>—</span>
                                    <span style={styles.featureText}>Fonctionnalités avancées</span>
                                </li>
                            </ul>
                        </div>
                        <div style={styles.cardFooter}>
                            <SubscribeButton
                                priceId="price_1SIr5PPkubGVJLhJyc0zC9od"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '1.2rem 2rem',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    backgroundColor: '#6B7F5C',
                                    color: '#F5F1E8',
                                    cursor: currentSubscription?.status === 'active' ? 'not-allowed' : 'pointer',
                                    opacity: currentSubscription?.status === 'active' ? 0.5 : 1,
                                    transition: 'all 0.3s ease',
                                }}
                                label={currentSubscription?.status === 'active' ? "DÉJÀ ABONNÉ" : "S'ABONNER"}
                                disabled={currentSubscription?.status === 'active'}
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <p>ABONNEMENTS MENSUELS • ANNULATION À TOUT MOMENT • PAIEMENT SÉCURISÉ VIA STRIPE</p>
                </div>
            </main>
        </div>
    );
}