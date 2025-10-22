"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

type AuthMode = 'signin' | 'signup';

export default function AuthForm({ mode: initialMode = 'signin' }: { mode?: AuthMode }) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError('');
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) {
                setError(error.message);
                setLoading(false);
            }
            // Le loading reste true car on redirige vers Google
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la connexion avec Google');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!email || !password) {
            setError('Tous les champs sont requis');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email invalide');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signin') {
                const { error } = await signIn(email, password);
                if (error) {
                    setError(error);
                } else {
                    router.push('/dashboard');
                }
            } else {
                const { error } = await signUp(email, password);
                if (error) {
                    setError(error);
                } else {
                    setSuccess('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
                    // Optionnel : rediriger après quelques secondes
                    setTimeout(() => router.push('/login'), 3000);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
            <div style={{ background: '#FFFFFF', padding: '3rem 2.5rem', border: '1px solid #E8DCC4' }}>
                {/* Onglets */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '2px solid #E8DCC4' }}>
                    <button
                        onClick={() => setMode('signin')}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: mode === 'signin' ? '2px solid #6B7F5C' : '2px solid transparent',
                            color: mode === 'signin' ? '#6B7F5C' : '#8B956D',
                            fontWeight: mode === 'signin' ? 900 : 600,
                            cursor: 'pointer',
                            marginBottom: -2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.85rem',
                        }}
                    >
                        Connexion
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        style={{
                            flex: 1,
                            padding: '12px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: mode === 'signup' ? '2px solid #6B7F5C' : '2px solid transparent',
                            color: mode === 'signup' ? '#6B7F5C' : '#8B956D',
                            fontWeight: mode === 'signup' ? 900 : 600,
                            cursor: 'pointer',
                            marginBottom: -2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.85rem',
                        }}
                    >
                        Inscription
                    </button>
                </div>

                <h2 style={{ margin: '0 0 12px 0', fontSize: '2.5rem', fontWeight: 900, color: '#2C3A2B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    {mode === 'signin' ? 'BIENVENUE' : 'CRÉER UN COMPTE'}
                </h2>
                <p style={{ margin: '0 0 32px 0', color: '#8B956D', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, textAlign: 'center' }}>
                    {mode === 'signin'
                        ? 'Accédez à vos projets'
                        : 'Commencez à utiliser l\'éditeur IA'}
                </p>

                {/* Bouton Google OAuth */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#F5F1E8',
                        color: '#2C3A2B',
                        border: '2px solid #E8DCC4',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        marginBottom: 24,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.borderColor = '#6B7F5C';
                            e.currentTarget.style.background = '#E8DCC4';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E8DCC4';
                        e.currentTarget.style.background = '#F5F1E8';
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    Continuer avec Google
                </button>

                {/* Séparateur */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 28,
                    gap: 16
                }}>
                    <div style={{ flex: 1, height: 1, background: '#E8DCC4' }}></div>
                    <span style={{ color: '#8B956D', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>OU</span>
                    <div style={{ flex: 1, height: 1, background: '#E8DCC4' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 10, fontWeight: 900, fontSize: '0.75rem', color: '#4A5D3F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@exemple.com"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                border: '1px solid #E8DCC4',
                                background: '#F5F1E8',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                color: '#2C3A2B',
                                transition: 'all 0.3s',
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid #6B7F5C'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid #E8DCC4'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 10, fontWeight: 900, fontSize: '0.75rem', color: '#4A5D3F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '1rem 1.25rem',
                                border: '1px solid #E8DCC4',
                                background: '#F5F1E8',
                                fontSize: '1rem',
                                boxSizing: 'border-box',
                                color: '#2C3A2B',
                                transition: 'all 0.3s',
                            }}
                            onFocus={(e) => e.currentTarget.style.border = '2px solid #6B7F5C'}
                            onBlur={(e) => e.currentTarget.style.border = '1px solid #E8DCC4'}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: 10, fontWeight: 900, fontSize: '0.75rem', color: '#4A5D3F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    border: '1px solid #E8DCC4',
                                    background: '#F5F1E8',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                    color: '#2C3A2B',
                                    transition: 'all 0.3s',
                                }}
                                onFocus={(e) => e.currentTarget.style.border = '2px solid #6B7F5C'}
                                onBlur={(e) => e.currentTarget.style.border = '1px solid #E8DCC4'}
                            />
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '1rem 1.25rem', background: '#FEE2E2', color: '#991B1B', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #FCA5A5' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ padding: '1rem 1.25rem', background: '#ECFDF5', color: '#047857', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #6EE7B7' }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1.2rem 2rem',
                            background: '#6B7F5C',
                            color: '#F5F1E8',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.3s',
                            marginTop: '1rem',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = '#4A5D3F';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = '#6B7F5C';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {loading ? '⏳ CHARGEMENT...' : mode === 'signin' ? 'SE CONNECTER' : 'S\'INSCRIRE'}
                    </button>
                </form>
            </div>
        </div>
    );
}
