import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
    return (
        <main style={{ minHeight: 'calc(100vh - 73px)', padding: 48, background: '#f3f6fb' }}>
            <AuthForm mode="signup" />
        </main>
    );
}
