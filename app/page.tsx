"use client";

import React, { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResultUrl(null);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const generate = async () => {
    if (!file || !prompt) return setError('Image et prompt requis');
    setLoading(true);
    setError(null);
    setLoadingMessage('📤 Upload de l\'image...');

    try {
      const form = new FormData();
      form.append('image', file);
      form.append('prompt', prompt);

      setLoadingMessage('🤖 Génération en cours (Replicate)...');

      const res = await fetch('/api/generate', { method: 'POST', body: form });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = [data?.error, data?.details].filter(Boolean).join('\n');
        throw new Error(msg || 'Erreur lors de la génération');
      }

      setResultUrl(data.outputImageUrl);
      setLoadingMessage('✅ Image générée');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', background: '#f3f6fb' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>✨ AI Image Editor</h1>
          <p style={{ color: '#555' }}>Upload une image, décris la transformation, puis génère.</p>
        </header>

        <section style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 6px 24px rgba(16,24,40,0.06)' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ fontWeight: 600 }}>Image</label>
            <input type="file" accept="image/*" onChange={onFile} disabled={loading} />

            {preview && (
              <div style={{ width: 300, height: 300, borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 18px rgba(16,24,40,0.06)' }}>
                {/* Use native img for preview (blob URL) */}
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <label style={{ fontWeight: 600 }}>Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} disabled={loading} style={{ padding: 12, borderRadius: 8, border: '1px solid #e6e9ef' }} />

            <div>
              <button onClick={generate} disabled={loading || !file || !prompt} style={{ padding: '12px 18px', borderRadius: 8, background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}>
                {loading ? '⏳ Génération...' : '🚀 Générer'}
              </button>
            </div>

            {loading && loadingMessage && <div style={{ padding: 12, background: '#eef2ff', borderRadius: 8 }}>{loadingMessage}</div>}
            {error && <div style={{ padding: 12, background: '#fff1f2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>}

            {resultUrl && (
              <div style={{ marginTop: 12 }}>
                <h3>Image générée</h3>
                <div style={{ width: '100%', maxWidth: 600, height: 600, position: 'relative' }}>
                  <Image src={resultUrl} alt="result" fill style={{ objectFit: 'contain' }} />
                </div>
                <a href={resultUrl} download style={{ display: 'inline-block', marginTop: 12, padding: '10px 16px', background: '#059669', color: 'white', borderRadius: 8 }}>Télécharger</a>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

