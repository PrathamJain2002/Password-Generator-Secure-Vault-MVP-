'use client';

import { useState, useEffect } from 'react';
import { VaultItemData } from '@/lib/crypto';
import { VaultItemResponse } from '@/lib/api';
import VaultItemEditor from './VaultItemEditor';
import PasswordGenerator from './PasswordGenerator';

interface VaultListProps {
  vaultItems: VaultItemResponse[];
  onEdit: (item: VaultItemResponse & VaultItemData) => void;
  onDelete: (id: string) => void;
  onDecrypt: (item: VaultItemResponse) => Promise<VaultItemData>;
  onAddNew: (item: VaultItemData) => void;
}

export default function VaultList({ 
  vaultItems, 
  onEdit, 
  onDelete, 
  onDecrypt,
  onAddNew
}: VaultListProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<(VaultItemResponse & VaultItemData) | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [decryptedItems, setDecryptedItems] = useState<Map<string, VaultItemData>>(new Map());
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [clipboardCountdown, setClipboardCountdown] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const decryptAll = async () => {
      const decrypted = new Map<string, VaultItemData>();
      for (const item of vaultItems) {
        try {
          const decryptedItem = await onDecrypt(item);
          decrypted.set(item._id, decryptedItem);
        } catch (error) {
          console.error('Failed to decrypt item:', error);
        }
      }
      setDecryptedItems(decrypted);
    };

    if (vaultItems.length > 0) {
      decryptAll();
    }
  }, [vaultItems, onDecrypt]);

  const filteredItems = vaultItems.filter(item => {
    if (!searchTerm) return true;
    const decrypted = decryptedItems.get(item._id);
    if (!decrypted) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      decrypted.title.toLowerCase().includes(searchLower) ||
      decrypted.username.toLowerCase().includes(searchLower) ||
      decrypted.url.toLowerCase().includes(searchLower)
    );
  });

  const handleAddNew = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const handleEdit = (item: VaultItemResponse) => {
    const decrypted = decryptedItems.get(item._id);
    if (decrypted) {
      setEditingItem({ ...item, ...decrypted });
      setShowEditor(true);
    }
  };

  const handleSave = async (itemData: VaultItemData) => {
    if (editingItem) {
      onEdit({ ...editingItem, ...itemData });
    } else {
      onAddNew(itemData);
    }
    setShowEditor(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(id);
    }
  };

  const handleCopyPassword = async (password: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(password);
      
      // Start countdown
      let countdown = 12;
      setClipboardCountdown(prev => new Map(prev.set(itemId, countdown)));
      
      const interval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          navigator.clipboard.writeText('');
          setClipboardCountdown(prev => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
          });
          clearInterval(interval);
        } else {
          setClipboardCountdown(prev => new Map(prev.set(itemId, countdown)));
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const togglePasswordVisibility = (itemId: string) => {
    setShowPasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Generate Password
        </button>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search vault items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Password Generator */}
      {showGenerator && (
        <PasswordGenerator
          onPasswordGenerated={setGeneratedPassword}
        />
      )}

      {/* Vault Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const decrypted = decryptedItems.get(item._id);
          if (!decrypted) return null;

          const isPasswordVisible = showPasswords.has(item._id);
          const countdown = clipboardCountdown.get(item._id);

          return (
            <div key={item._id} className="bg-white p-4 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{decrypted.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {decrypted.username && (
                <p className="text-gray-600 mb-1">
                  <strong>Username:</strong> {decrypted.username}
                </p>
              )}

              <div className="flex items-center space-x-2 mb-2">
                <strong className="text-gray-600">Password:</strong>
                <span className="font-mono text-sm">
                  {isPasswordVisible ? decrypted.password : '••••••••'}
                </span>
                <button
                  onClick={() => togglePasswordVisibility(item._id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  onClick={() => handleCopyPassword(decrypted.password, item._id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
                {countdown !== undefined && (
                  <span className="text-sm text-orange-600">
                    (Clears in {countdown}s)
                  </span>
                )}
              </div>

              {decrypted.url && (
                <p className="text-gray-600 mb-1">
                  <strong>URL:</strong>{' '}
                  <a
                    href={decrypted.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {decrypted.url}
                  </a>
                </p>
              )}

              {decrypted.notes && (
                <p className="text-gray-600">
                  <strong>Notes:</strong> {decrypted.notes}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Updated: {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No items match your search.' : 'No vault items yet. Add your first item!'}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <VaultItemEditor
          item={editingItem || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingItem(null);
          }}
          generatedPassword={generatedPassword}
        />
      )}
    </div>
  );
}
