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
            <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#f3f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Chargement...</div>
            </main>
        );
    }

    // Si déjà connecté, ne rien afficher (la redirection est en cours)
    if (user) {
        return null;
    }

    return (
        <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#f3f6fb' }}>
            <AuthForm mode="signin" />
        </main>
    );
}
