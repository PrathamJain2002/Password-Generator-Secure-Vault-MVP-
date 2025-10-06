'use client';

import { useState, useCallback } from 'react';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeLookalikes, setExcludeLookalikes] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = useCallback(() => {
    let charset = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (excludeLookalikes) {
      charset = charset.replace(/[0OoIl1]/g, '');
    }
    
    if (charset.length === 0) {
      setGeneratedPassword('');
      return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setGeneratedPassword(password);
    onPasswordGenerated(password);
  }, [length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, excludeLookalikes, onPasswordGenerated]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Password Generator</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Length: {length}
        </label>
        <input
          type="range"
          min="4"
          max="128"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="space-y-2 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            className="mr-2"
          />
          Include lowercase letters (a-z)
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="mr-2"
          />
          Include uppercase letters (A-Z)
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="mr-2"
          />
          Include numbers (0-9)
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="mr-2"
          />
          Include symbols (!@#$%^&*)
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={excludeLookalikes}
            onChange={(e) => setExcludeLookalikes(e.target.checked)}
            className="mr-2"
          />
          Exclude look-alikes (0, O, o, I, l, 1)
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Generate Password
      </button>

      {generatedPassword && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Generated Password:</label>
          <div className="flex">
            <input
              type="text"
              value={generatedPassword}
              readOnly
              className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(generatedPassword)}
              className="bg-gray-600 text-white px-3 py-2 rounded-r-md hover:bg-gray-700 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
