'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VaultItemData, encryptVaultItem, decryptVaultItem } from '@/lib/crypto';
import { VaultItemResponse, apiClient } from '@/lib/api';
import VaultList from '@/components/VaultList';
import { useAuth } from '@/contexts/AuthContext';

export default function VaultPage() {
  const router = useRouter();
  const { isAuthenticated, encryptionKey, logout, loading: authLoading } = useAuth();
  const [vaultItems, setVaultItems] = useState<VaultItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadVaultItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVaultItems();
      if (response.success && response.data) {
        setVaultItems(response.data);
      } else {
        setError(response.error || 'Failed to load vault items');
      }
    } catch (error) {
      console.error('Failed to load vault items:', error);
      setError('Failed to load vault items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && encryptionKey) {
      loadVaultItems();
    }
  }, [isAuthenticated, encryptionKey, loadVaultItems]);

  const handleDecrypt = useCallback(async (item: VaultItemResponse): Promise<VaultItemData> => {
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    return decryptVaultItem(
      {
        cipher: item.cipher,
        iv: item.iv,
        titleHint: item.titleHint || '',
      },
      encryptionKey
    );
  }, [encryptionKey]);

  const handleEdit = useCallback(async (item: VaultItemResponse & VaultItemData) => {
    if (!encryptionKey) {
      setError('Encryption key not available');
      return;
    }

    try {
      const encrypted = await encryptVaultItem(item, encryptionKey);
      const response = await apiClient.updateVaultItem(item._id!, encrypted);
      
      if (response.success) {
        loadVaultItems();
      } else {
        setError(response.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      setError('Failed to update item');
    }
  }, [encryptionKey, loadVaultItems]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await apiClient.deleteVaultItem(id);
      
      if (response.success) {
        loadVaultItems();
      } else {
        setError(response.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item');
    }
  }, [loadVaultItems]);

  const handleAddNew = useCallback(async (itemData: VaultItemData) => {
    if (!encryptionKey) {
      setError('Encryption key not available');
      return;
    }

    try {
      const encrypted = await encryptVaultItem(itemData, encryptionKey);
      const response = await apiClient.createVaultItem(encrypted);
      
      if (response.success) {
        loadVaultItems();
      } else {
        setError(response.error || 'Failed to create item');
      }
    } catch (error) {
      console.error('Failed to create item:', error);
      setError('Failed to create item');
    }
  }, [encryptionKey, loadVaultItems]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Checking authentication...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Password Vault</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <VaultList
          vaultItems={vaultItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDecrypt={handleDecrypt}
          onAddNew={handleAddNew}
        />
      </div>
    </div>
  );
}
