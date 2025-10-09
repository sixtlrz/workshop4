import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Image Editor',
  description: 'Transformez vos images avec l\'intelligence artificielle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
