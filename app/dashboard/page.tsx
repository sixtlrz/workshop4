"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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
            const { data, error } = await supabase
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
                {/* En-tête */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{
                        fontSize: 40,
                        marginBottom: 8,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        ✨ Mon Dashboard
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: 18 }}>Transformez vos images avec l'intelligence artificielle</p>
                </div>

                {/* Formulaire de génération */}
                <section style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    padding: 32,
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.15)',
                    marginBottom: 48,
                    border: '2px solid #e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24
                        }}>
                            🚀
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, margin: 0, fontWeight: 700 }}>Nouvelle génération</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Uploadez vos images et décrivez la transformation souhaitée</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 24 }}>
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 600,
                                marginBottom: 12,
                                fontSize: 15,
                                color: '#374151'
                            }}>
                                <span>📁</span> Sélectionnez vos images
                            </label>
                            <div style={{
                                position: 'relative',
                                border: '2px dashed #d1d5db',
                                borderRadius: 12,
                                padding: 24,
                                textAlign: 'center',
                                background: '#fafafa',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={onFiles}
                                    disabled={loading}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                                <div style={{ pointerEvents: 'none' }}>
                                    <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
                                    <p style={{ fontSize: 15, color: '#6b7280', margin: 0 }}>
                                        Cliquez ou glissez vos images ici
                                    </p>
                                    <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
                                        (Plusieurs images acceptées)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {previews.length > 0 && (
                            <div style={{
                                display: 'flex',
                                gap: 16,
                                flexWrap: 'wrap',
                                padding: 20,
                                background: '#f9fafb',
                                borderRadius: 12,
                                border: '1px solid #e5e7eb'
                            }}>
                                {previews.map((preview, index) => (
                                    <div key={index} style={{
                                        position: 'relative',
                                        width: 140,
                                        height: 140,
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        border: '3px solid white'
                                    }}>
                                        <img src={preview} alt={`preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={loading}
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 32,
                                                height: 32,
                                                cursor: 'pointer',
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            ×
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            fontSize: 12,
                                            textAlign: 'center'
                                        }}>
                                            Image {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 600,
                                marginBottom: 12,
                                fontSize: 15,
                                color: '#374151'
                            }}>
                                <span>💬</span> Décrivez la transformation
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={4}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: 16,
                                    borderRadius: 12,
                                    border: '2px solid #e5e7eb',
                                    boxSizing: 'border-box',
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="Ex: Add a crown on the dog's head and a Coca-Cola can next to it..."
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>
                                💡 Conseil : Décrivez en anglais pour de meilleurs résultats
                            </p>
                        </div>

                        <button
                            onClick={generate}
                            disabled={loading || files.length === 0 || !prompt}
                            style={{
                                padding: '18px 32px',
                                borderRadius: 12,
                                background: (loading || files.length === 0 || !prompt)
                                    ? '#d1d5db'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                cursor: (loading || files.length === 0 || !prompt) ? 'not-allowed' : 'pointer',
                                fontWeight: 700,
                                fontSize: 16,
                                boxShadow: (loading || files.length === 0 || !prompt) ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && files.length > 0 && prompt) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = (loading || files.length === 0 || !prompt) ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                    Génération en cours...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    Générer l'image {files.length > 1 && `(${files.length} images)`}
                                </>
                            )}
                        </button>

                        {loading && loadingMessage && (
                            <div style={{
                                padding: 16,
                                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                                borderRadius: 12,
                                border: '2px solid #c7d2fe',
                                fontSize: 15,
                                fontWeight: 500,
                                color: '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <div style={{ animation: 'spin 1s linear infinite' }}>⚙️</div>
                                {loadingMessage}
                            </div>
                        )}
                        {error && (
                            <div style={{
                                padding: 16,
                                background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                                color: '#b91c1c',
                                borderRadius: 12,
                                border: '2px solid #fecdd3',
                                fontSize: 15,
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <span>⚠️</span>
                                {error}
                            </div>
                        )}
                    </div>
                </section>

                {/* Galerie de projets - Comparaison Avant/Après */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Mes projets</h2>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '8px 20px',
                            borderRadius: 20,
                            fontWeight: 600,
                            fontSize: 14
                        }}>
                            {projects.length} {projects.length > 1 ? 'projets' : 'projet'}
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                            padding: 64,
                            borderRadius: 16,
                            textAlign: 'center',
                            border: '2px dashed #667eea50'
                        }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
                            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#1f2937' }}>Aucun projet pour le moment</h3>
                            <p style={{ color: '#6b7280', fontSize: 16 }}>Créez votre première génération ci-dessus pour commencer !</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 32 }}>
                            {projects.map((project) => (
                                <div key={project.id} style={{
                                    background: 'white',
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(16,24,40,0.08)',
                                    border: '1px solid #f3f4f6',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    {/* En-tête du projet */}
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', background: 'linear-gradient(90deg, #f9fafb 0%, #ffffff 100%)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                    <span style={{ fontSize: 20 }}>💬</span>
                                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: 0 }}>Prompt</h3>
                                                </div>
                                                <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>
                                                    {project.prompt}
                                                </p>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                                📅 {new Date(project.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comparaison des images */}
                                    <div style={{ padding: 24 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                            {/* Image originale */}
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    marginBottom: 12,
                                                    paddingBottom: 12,
                                                    borderBottom: '2px solid #f3f4f6'
                                                }}>
                                                    <span style={{ fontSize: 18 }}>📸</span>
                                                    <h4 style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Image Originale
                                                    </h4>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingBottom: '75%',
                                                    borderRadius: 12,
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    border: '3px solid #e5e7eb'
                                                }}>
                                                    <Image
                                                        src={project.input_image_url}
                                                        alt="Image originale"
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Flèche de transformation */}
                                            <div style={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    left: '-36px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    fontSize: 32,
                                                    color: '#667eea',
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    ✨
                                                </div>

                                                {/* Image transformée */}
                                                <div style={{ width: '100%' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        marginBottom: 12,
                                                        paddingBottom: 12,
                                                        borderBottom: '2px solid #f3f4f6'
                                                    }}>
                                                        <span style={{ fontSize: 18 }}>🎨</span>
                                                        <h4 style={{ fontSize: 15, fontWeight: 600, color: '#667eea', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                            Image Générée
                                                        </h4>
                                                    </div>
                                                    <div style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        paddingBottom: '75%',
                                                        borderRadius: 12,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                                        border: '3px solid #667eea'
                                                    }}>
                                                        <Image
                                                            src={project.output_image_url}
                                                            alt="Image générée"
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                            <a
                                                href={project.output_image_url}
                                                download
                                                style={{
                                                    flex: 1,
                                                    padding: '14px 20px',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: 'white',
                                                    borderRadius: 10,
                                                    textAlign: 'center',
                                                    textDecoration: 'none',
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 8
                                                }}
                                            >
                                                <span>📥</span> Télécharger l'image
                                            </a>
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                style={{
                                                    padding: '14px 24px',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 10,
                                                    cursor: 'pointer',
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8
                                                }}
                                            >
                                                <span>🗑️</span> Supprimer
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
