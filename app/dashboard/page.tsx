"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseClient';

interface Project {
  id: string;
  created_at: string;
  input_image_url: string;
  output_image_url: string;
  prompt: string;
  status: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Rediriger si pas authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Charger les projets de l'utilisateur
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des projets:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError(null);
    setPreviews(selectedFiles.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const generate = async () => {
    if (files.length === 0 || !prompt) return setError('Au moins une image et un prompt requis');
    setLoading(true);
    setError(null);
    setLoadingMessage('📤 Upload des images...');

    try {
      const form = new FormData();
      files.forEach((file) => {
        form.append('images', file);
      });
      form.append('prompt', prompt);

      setLoadingMessage('🤖 Génération en cours (Replicate)...');

      const res = await fetch('/api/generate', { 
        method: 'POST', 
        body: form,
        credentials: 'include',
      });
      
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = [data?.error, data?.details].filter(Boolean).join('\n');
        throw new Error(msg || 'Erreur lors de la génération');
      }

      setLoadingMessage('✅ Image générée');
      
      // Réinitialiser le formulaire
      setFiles([]);
      setPreviews([]);
      setPrompt('');
      
      // Recharger les projets
      await loadProjects();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      // Recharger les projets
      await loadProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || (user && loadingProjects)) {
    return (
      <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#f3f6fb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>⏳ Chargement...</div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#f3f6fb' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>Créez et gérez vos projets d'édition d'images</p>

        {/* Formulaire de génération */}
        <section style={{ background: 'white', padding: 32, borderRadius: 12, boxShadow: '0 6px 24px rgba(16,24,40,0.06)', marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Nouvelle génération</h2>
          
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Images (plusieurs acceptées)</label>
              <input type="file" accept="image/*" multiple onChange={onFiles} disabled={loading} />
            </div>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {previews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', width: 150, height: 150, borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
                    <img src={preview} alt={`preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      onClick={() => removeFile(index)}
                      disabled={loading}
                      style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Prompt</label>
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                rows={4} 
                disabled={loading} 
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e6e9ef', boxSizing: 'border-box' }} 
                placeholder="Décrivez la transformation souhaitée (en anglais pour de meilleurs résultats)..." 
              />
            </div>

            <button 
              onClick={generate} 
              disabled={loading || files.length === 0 || !prompt} 
              style={{ 
                padding: '14px 20px', 
                borderRadius: 8, 
                background: '#4f46e5', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 600,
                opacity: (loading || files.length === 0 || !prompt) ? 0.5 : 1 
              }}
            >
              {loading ? '⏳ Génération...' : `🚀 Générer (${files.length} image${files.length > 1 ? 's' : ''})`}
            </button>

            {loading && loadingMessage && <div style={{ padding: 12, background: '#eef2ff', borderRadius: 8 }}>{loadingMessage}</div>}
            {error && <div style={{ padding: 12, background: '#fff1f2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>}
          </div>
        </section>

        {/* Galerie de projets */}
        <section>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Mes projets ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div style={{ background: 'white', padding: 48, borderRadius: 12, textAlign: 'center', color: '#6b7280' }}>
              Aucun projet pour le moment. Créez votre première génération ci-dessus !
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {projects.map((project) => (
                <div key={project.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 24px rgba(16,24,40,0.06)' }}>
                  <div style={{ position: 'relative', width: '100%', height: 300 }}>
                    <Image src={project.output_image_url} alt="Output" fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>Prompt:</strong> {project.prompt}
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                      {new Date(project.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a 
                        href={project.output_image_url} 
                        download 
                        style={{ flex: 1, padding: '8px 12px', background: '#059669', color: 'white', borderRadius: 6, textAlign: 'center', textDecoration: 'none', fontSize: 14 }}
                      >
                        Télécharger
                      </a>
                      <button 
                        onClick={() => deleteProject(project.id)}
                        style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
