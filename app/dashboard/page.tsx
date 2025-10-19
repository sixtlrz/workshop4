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
            <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#F5F1E8', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#6B7F5C', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>⏳ Chargement...</div>
            </main>
        );
    }

    if (!user) return null;

    return (
        <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#F5F1E8' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* En-tête */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{
                        fontSize: 48,
                        marginBottom: 12,
                        fontWeight: 900,
                        color: '#2C3A2B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        MON DASHBOARD
                    </h1>
                    <p style={{ color: '#8B956D', fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Transformez vos images avec l'intelligence artificielle</p>
                </div>

                {/* Bannière abonnement */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    padding: '16px 24px',
                    marginBottom: 32,
                    border: '2px solid #9CAF88'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', color: '#4A5D3F', fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            🌟 Débloquez tout le potentiel de l'IA
                        </h3>
                        <p style={{ margin: 0, color: '#6B7F5C', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Abonnez-vous pour accéder à plus de générations
                        </p>
                    </div>
                    <a href="/pricing" style={{
                        backgroundColor: '#6B7F5C',
                        color: '#F5F1E8',
                        padding: '12px 24px',
                        fontWeight: 900,
                        textDecoration: 'none',
                        fontSize: 13,
                        transition: 'all 0.2s',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                    }}>
                        Voir les abonnements
                    </a>
                </div>

                {/* Formulaire de génération */}
                <section style={{
                    background: '#FFFFFF',
                    padding: 40,
                    marginBottom: 48,
                    border: '1px solid #E8DCC4'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            background: '#6B7F5C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 28
                        }}>
                            🚀
                        </div>
                        <div>
                            <h2 style={{ fontSize: 24, margin: 0, fontWeight: 900, color: '#2C3A2B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nouvelle génération</h2>
                            <p style={{ fontSize: 13, color: '#8B956D', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Uploadez vos images et décrivez la transformation</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 28 }}>
                        <div>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                fontWeight: 700,
                                marginBottom: 16,
                                fontSize: 14,
                                color: '#4A5D3F',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <span>📁</span> Sélectionnez vos images
                            </label>
                            <div style={{
                                position: 'relative',
                                border: '2px dashed #9CAF88',
                                padding: 32,
                                textAlign: 'center',
                                background: '#F5F1E8',
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
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                                    <p style={{ fontSize: 14, color: '#6B7F5C', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                        Cliquez ou glissez vos images ici
                                    </p>
                                    <p style={{ fontSize: 12, color: '#8B956D', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                                padding: 24,
                                background: '#F5F1E8',
                                border: '1px solid #E8DCC4'
                            }}>
                                {previews.map((preview, index) => (
                                    <div key={index} style={{
                                        position: 'relative',
                                        width: 140,
                                        height: 140,
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 12px rgba(107, 127, 92, 0.15)',
                                        border: '2px solid #E8DCC4'
                                    }}>
                                        <img src={preview} alt={`preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={loading}
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                background: '#4A5D3F',
                                                color: '#F5F1E8',
                                                border: 'none',
                                                width: 32,
                                                height: 32,
                                                cursor: 'pointer',
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 8px rgba(74, 93, 63, 0.3)',
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
                                            background: 'rgba(74, 93, 63, 0.9)',
                                            color: '#F5F1E8',
                                            padding: '6px 8px',
                                            fontSize: 11,
                                            textAlign: 'center',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontWeight: 600
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
                                gap: 10,
                                fontWeight: 700,
                                marginBottom: 16,
                                fontSize: 14,
                                color: '#4A5D3F',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
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
                                    border: '2px solid #E8DCC4',
                                    boxSizing: 'border-box',
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.2s',
                                    background: '#FFFFFF'
                                }}
                                placeholder="Ex: Add a crown on the dog's head and a Coca-Cola can next to it..."
                                onFocus={(e) => e.target.style.borderColor = '#6B7F5C'}
                                onBlur={(e) => e.target.style.borderColor = '#E8DCC4'}
                            />
                            <p style={{ fontSize: 12, color: '#8B956D', marginTop: 10, marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                💡 Conseil : Décrivez en anglais pour de meilleurs résultats
                            </p>
                        </div>

                        <button
                            onClick={generate}
                            disabled={loading || files.length === 0 || !prompt}
                            style={{
                                padding: '20px 40px',
                                background: (loading || files.length === 0 || !prompt)
                                    ? '#E8DCC4'
                                    : '#6B7F5C',
                                color: (loading || files.length === 0 || !prompt) ? '#8B956D' : '#F5F1E8',
                                border: 'none',
                                cursor: (loading || files.length === 0 || !prompt) ? 'not-allowed' : 'pointer',
                                fontWeight: 900,
                                fontSize: 15,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                boxShadow: (loading || files.length === 0 || !prompt) ? 'none' : '0 8px 24px rgba(107, 127, 92, 0.3)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 12
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && files.length > 0 && prompt) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(107, 127, 92, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = (loading || files.length === 0 || !prompt) ? 'none' : '0 8px 24px rgba(107, 127, 92, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                                    GÉNÉRATION EN COURS...
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    GÉNÉRER {files.length > 1 && `(${files.length} IMAGES)`}
                                </>
                            )}
                        </button>

                        {loading && loadingMessage && (
                            <div style={{
                                padding: 18,
                                background: '#FFFFFF',
                                border: '2px solid #9CAF88',
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#4A5D3F',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
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
                                padding: 18,
                                background: '#FFFFFF',
                                color: '#4A5D3F',
                                border: '2px solid #4A5D3F',
                                fontSize: 14,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: '#2C3A2B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mes projets</h2>
                        <div style={{
                            background: '#6B7F5C',
                            color: '#F5F1E8',
                            padding: '10px 24px',
                            fontWeight: 900,
                            fontSize: 13,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            {projects.length} {projects.length > 1 ? 'PROJETS' : 'PROJET'}
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div style={{
                            background: '#FFFFFF',
                            padding: 64,
                            textAlign: 'center',
                            border: '2px dashed #9CAF88'
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 20 }}>🎨</div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12, color: '#2C3A2B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aucun projet</h3>
                            <p style={{ color: '#8B956D', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Créez votre première génération ci-dessus</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 32 }}>
                            {projects.map((project) => (
                                <div key={project.id} style={{
                                    background: '#FFFFFF',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 24px rgba(107, 127, 92, 0.1)',
                                    border: '1px solid #E8DCC4',
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}>
                                    {/* En-tête du projet */}
                                    <div style={{ padding: '24px 28px', borderBottom: '1px solid #E8DCC4', background: '#F5F1E8' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                    <span style={{ fontSize: 20 }}>💬</span>
                                                    <h3 style={{ fontSize: 15, fontWeight: 900, color: '#2C3A2B', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt</h3>
                                                </div>
                                                <p style={{ fontSize: 14, color: '#6B7F5C', lineHeight: 1.6, margin: 0 }}>
                                                    {project.prompt}
                                                </p>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8B956D', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
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
                                    <div style={{ padding: 28 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                                            {/* Image originale */}
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    marginBottom: 16,
                                                    paddingBottom: 12,
                                                    borderBottom: '2px solid #E8DCC4'
                                                }}>
                                                    <span style={{ fontSize: 18 }}>📸</span>
                                                    <h4 style={{ fontSize: 14, fontWeight: 900, color: '#6B7F5C', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Image Originale
                                                    </h4>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingBottom: '75%',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(107, 127, 92, 0.15)',
                                                    border: '2px solid #E8DCC4'
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
                                                    color: '#6B7F5C',
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    ✨
                                                </div>

                                                {/* Image transformée */}
                                                <div style={{ width: '100%' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                        marginBottom: 16,
                                                        paddingBottom: 12,
                                                        borderBottom: '2px solid #E8DCC4'
                                                    }}>
                                                        <span style={{ fontSize: 18 }}>🎨</span>
                                                        <h4 style={{ fontSize: 14, fontWeight: 900, color: '#6B7F5C', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Image Générée
                                                        </h4>
                                                    </div>
                                                    <div style={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        paddingBottom: '75%',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 8px 24px rgba(107, 127, 92, 0.25)',
                                                        border: '2px solid #6B7F5C'
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
                                        <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
                                            <a
                                                href={project.output_image_url}
                                                download
                                                style={{
                                                    flex: 1,
                                                    padding: '16px 24px',
                                                    background: '#6B7F5C',
                                                    color: '#F5F1E8',
                                                    textAlign: 'center',
                                                    textDecoration: 'none',
                                                    fontSize: 14,
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    boxShadow: '0 4px 12px rgba(107, 127, 92, 0.25)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 10,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span>📥</span> Télécharger
                                            </a>
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                style={{
                                                    padding: '16px 28px',
                                                    background: '#4A5D3F',
                                                    color: '#F5F1E8',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    boxShadow: '0 4px 12px rgba(74, 93, 63, 0.25)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    transition: 'all 0.2s'
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
