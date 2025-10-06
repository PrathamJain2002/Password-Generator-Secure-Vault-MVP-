'use client';

import { useState } from 'react';
import { VaultItemData } from '@/lib/crypto';

interface VaultItemEditorProps {
  item?: VaultItemData & { id?: string };
  onSave: (item: VaultItemData) => void;
  onCancel: () => void;
  generatedPassword?: string;
}

export default function VaultItemEditor({ 
  item, 
  onSave, 
  onCancel, 
  generatedPassword 
}: VaultItemEditorProps) {
  const [formData, setFormData] = useState<VaultItemData>({
    title: item?.title || '',
    username: item?.username || '',
    password: item?.password || generatedPassword || '',
    url: item?.url || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    onSave(formData);
  };

  const handleChange = (field: keyof VaultItemData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {item?.id ? 'Edit Vault Item' : 'Add Vault Item'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Gmail Account"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username/Email</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="flex">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                    if (input) {
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }
                  }}
                  className="bg-gray-600 text-white px-3 py-2 rounded-r-md hover:bg-gray-700 transition-colors"
                >
                  👁️
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {item?.id ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
