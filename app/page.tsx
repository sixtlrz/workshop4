'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <main style={{ minHeight: 'calc(100vh - 73px)', background: '#F5F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#6B7F5C' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ margin: '0 auto 16px', borderColor: '#6B7F5C' }}></div>
        <p style={{ fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Chargement...</p>
      </div>
    </main>
  );
}
