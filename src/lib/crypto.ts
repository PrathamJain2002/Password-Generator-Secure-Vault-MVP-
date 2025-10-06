export interface VaultItemData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface EncryptedVaultItem {
  cipher: string;
  iv: string;
  titleHint: string;
}
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}
export async function encryptVaultItem(
  data: VaultItemData,
  key: CryptoKey
): Promise<EncryptedVaultItem> {
  const iv = generateIV();
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    plaintext
  );

  return {
    cipher: arrayBufferToBase64(ciphertext),
    iv: uint8ArrayToBase64(iv),
    titleHint: data.title.toLowerCase().trim(),
  };
}

export async function decryptVaultItem(
  encrypted: EncryptedVaultItem,
  key: CryptoKey
): Promise<VaultItemData> {
  const ciphertext = base64ToArrayBuffer(encrypted.cipher);
  const iv = base64ToArrayBuffer(encrypted.iv);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return arrayBufferToBase64(uint8Array.buffer as ArrayBuffer);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64));
}
