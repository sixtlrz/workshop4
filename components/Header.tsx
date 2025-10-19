"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, signOut, loading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <header style={{
            background: '#F5F1E8',
            borderBottom: '1px solid #E8DCC4',
            padding: '20px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: 22,
                        fontWeight: 900,
                        color: '#4A5D3F',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                    }}>
                        AI IMAGE EDITOR
                    </h1>
                </Link>

                {/* Navigation */}
                {!loading && (
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        {user ? (
                            <>
                                <Link href="/dashboard" style={{
                                    textDecoration: 'none',
                                    color: '#6B7F5C',
                                    fontWeight: 600,
                                    padding: '10px 20px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.05em',
                                    transition: 'color 0.2s',
                                }}>
                                    Dashboard
                                </Link>
                                <Link href="/pricing" style={{
                                    textDecoration: 'none',
                                    color: '#6B7F5C',
                                    fontWeight: 600,
                                    padding: '10px 20px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.05em',
                                    transition: 'color 0.2s',
                                }}>
                                    Abonnements
                                </Link>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 20px',
                                    background: '#E8DCC4',
                                    borderRadius: '0',
                                }}>
                                    <span style={{ fontSize: 13, color: '#6B7F5C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#4A5D3F',
                                            color: '#F5F1E8',
                                            border: 'none',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" style={{
                                    textDecoration: 'none',
                                    color: '#6B7F5C',
                                    fontWeight: 600,
                                    padding: '10px 20px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.05em',
                                }}>
                                    Connexion
                                </Link>
                                <Link href="/signup" style={{
                                    textDecoration: 'none',
                                    color: '#F5F1E8',
                                    background: '#6B7F5C',
                                    fontWeight: 700,
                                    padding: '12px 24px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.05em',
                                }}>
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
