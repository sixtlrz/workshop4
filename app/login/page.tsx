"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    // Afficher un loader pendant la vérification
    if (loading) {
        return (
            <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#F5F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#6B7F5C', fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chargement...</div>
            </main>
        );
    }

    // Si déjà connecté, ne rien afficher (la redirection est en cours)
    if (user) {
        return null;
    }

    return (
        <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#F5F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AuthForm mode="signin" />
        </main>
    );
}
