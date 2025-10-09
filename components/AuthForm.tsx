"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 6px 24px rgba(16,24,40,0.06)' }}>
        {/* Onglets */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e6e9ef' }}>
          <button
            onClick={() => setMode('signin')}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'signin' ? '2px solid #4f46e5' : '2px solid transparent',
              color: mode === 'signin' ? '#4f46e5' : '#6b7280',
              fontWeight: mode === 'signin' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -2,
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
              borderBottom: mode === 'signup' ? '2px solid #4f46e5' : '2px solid transparent',
              color: mode === 'signup' ? '#4f46e5' : '#6b7280',
              fontWeight: mode === 'signup' ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            Inscription
          </button>
        </div>

        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>
          {mode === 'signin' ? 'Bienvenue' : 'Créer un compte'}
        </h2>
        <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: 14 }}>
          {mode === 'signin' 
            ? 'Connectez-vous pour accéder à vos projets' 
            : 'Inscrivez-vous pour commencer à utiliser l\'éditeur IA'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
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
                padding: 12,
                border: '1px solid #e6e9ef',
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
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
                padding: 12,
                border: '1px solid #e6e9ef',
                borderRadius: 8,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
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
                  padding: 12,
                  border: '1px solid #e6e9ef',
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ padding: 12, background: '#fff1f2', color: '#b91c1c', borderRadius: 8, fontSize: 14 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: 12, background: '#f0fdf4', color: '#15803d', borderRadius: 8, fontSize: 14 }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '⏳ Chargement...' : mode === 'signin' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
}
