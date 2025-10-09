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
            background: 'white',
            borderBottom: '1px solid #e6e9ef',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(16,24,40,0.04)',
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
                        fontSize: 24,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                    }}>
                        ✨ AI Image Editor
                    </h1>
                </Link>

                {/* Navigation */}
                {!loading && (
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {user ? (
                            <>
                                <Link href="/dashboard" style={{
                                    textDecoration: 'none',
                                    color: '#4f46e5',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    transition: 'background 0.2s',
                                }}>
                                    Dashboard
                                </Link>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '8px 16px',
                                    background: '#f3f4f6',
                                    borderRadius: 8,
                                }}>
                                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                                        {user.email}
                                    </span>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            fontWeight: 500,
                                            cursor: 'pointer',
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
                                    color: '#4f46e5',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                }}>
                                    Connexion
                                </Link>
                                <Link href="/signup" style={{
                                    textDecoration: 'none',
                                    color: 'white',
                                    background: '#4f46e5',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: 8,
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
