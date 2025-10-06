'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/vault');
    }
  }, [isAuthenticated, router]);

  const handleAuth = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      let success = false;
      
      if (mode === 'signup') {
        const response = await apiClient.signup(email, password);
        if (response.success && response.data) {
          success = await login(email, password);
        }
      } else {
        success = await login(email, password);
      }

      if (!success) {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Password Vault
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Secure password management with client-side encryption.
            </p>
          </div>
        </div>
        
        <AuthForm
          mode={mode}
          onSubmit={handleAuth}
          onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
          loading={loading}
          error={error || undefined}
        />
      </div>
    </div>
  );
}