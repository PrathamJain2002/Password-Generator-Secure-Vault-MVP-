'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { deriveKey, base64ToUint8Array } from '@/lib/crypto';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  encryptionKey: CryptoKey | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const response = await Promise.race([
          apiClient.getSalt(),
          timeoutPromise
        ]) as { success: boolean; error?: string; data?: { salt: string } };
        
        if (response.success) {
          const hasKey = sessionStorage.getItem('encryptionKey');
          if (hasKey) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('encryptionKey');
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
        sessionStorage.removeItem('encryptionKey');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const salt = base64ToUint8Array(response.data.salt);
        const key = await deriveKey(password, salt);
        
        setEncryptionKey(key);
        setIsAuthenticated(true);
        sessionStorage.setItem('encryptionKey', 'true');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setEncryptionKey(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('encryptionKey');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      encryptionKey,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
