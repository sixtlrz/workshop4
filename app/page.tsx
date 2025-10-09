import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: 'calc(100vh - 73px)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ 
          fontSize: 56, 
          fontWeight: 800, 
          margin: '0 0 24px 0', 
          lineHeight: 1.2,
          textShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          Transformez vos images avec l'IA
        </h1>
        <p style={{ 
          fontSize: 24, 
          margin: '0 0 48px 0', 
          opacity: 0.95,
          maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Utilisez le pouvoir de SDXL pour modifier vos images simplement avec du texte
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            href="/signup" 
            style={{ 
              padding: '16px 32px', 
              background: 'white', 
              color: '#667eea', 
              borderRadius: 12, 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: 18,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
          >
            Commencer gratuitement →
          </Link>
          <Link 
            href="/login" 
            style={{ 
              padding: '16px 32px', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              borderRadius: 12, 
              textDecoration: 'none', 
              fontWeight: 600, 
              fontSize: 18,
              border: '2px solid white'
            }}
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, textAlign: 'center', marginBottom: 64 }}>
            Fonctionnalités puissantes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Image-to-Image</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Transformez vos images existantes en utilisant simplement des instructions textuelles
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>IA Puissante</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Propulsé par SDXL, le modèle d'IA le plus avancé pour la génération d'images
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
              <h3 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Vos Projets</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                Sauvegardez et gérez tous vos projets dans un dashboard personnel sécurisé
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', background: '#f3f6fb', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>
          Prêt à commencer ?
        </h2>
        <p style={{ fontSize: 20, color: '#6b7280', marginBottom: 40 }}>
          Créez un compte gratuitement et commencez à transformer vos images
        </p>
        <Link 
          href="/signup" 
          style={{ 
            display: 'inline-block',
            padding: '16px 48px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            borderRadius: 12, 
            textDecoration: 'none', 
            fontWeight: 600, 
            fontSize: 18,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}
        >
          Créer mon compte →
        </Link>
      </section>
    </main>
  );
}

