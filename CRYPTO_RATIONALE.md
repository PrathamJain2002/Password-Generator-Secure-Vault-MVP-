# Cryptographic Design Rationale

## Overview

This password vault implements client-side encryption using industry-standard cryptographic primitives to ensure that sensitive data never leaves the user's device in plaintext.

## Cryptographic Choices

### 1. Key Derivation: PBKDF2
- **Algorithm**: PBKDF2 with SHA-256
- **Iterations**: 100,000
- **Salt**: 32-byte random salt per user
- **Rationale**: PBKDF2 is a well-established, NIST-recommended key derivation function that provides strong protection against rainbow table attacks and brute force attempts. The 100,000 iterations provide a good balance between security and performance.

### 2. Encryption: AES-GCM
- **Algorithm**: AES-256-GCM
- **Key Length**: 256 bits
- **IV Length**: 96 bits (12 bytes)
- **Rationale**: AES-GCM provides both confidentiality and authenticity in a single operation, preventing both passive eavesdropping and active tampering. The 96-bit IV is the recommended length for GCM mode and provides sufficient randomness for the expected number of encryptions.

### 3. Implementation Details
- **Client-side only**: All encryption/decryption happens in the browser using the Web Crypto API
- **Zero-knowledge**: The server never sees plaintext data or encryption keys
- **Per-item IVs**: Each vault item uses a unique random IV for maximum security
- **Base64 encoding**: Encrypted data is base64-encoded for safe transmission and storage

## Security Properties

1. **Confidentiality**: AES-256-GCM ensures that encrypted data cannot be read without the correct key
2. **Integrity**: GCM mode provides authentication, preventing tampering with encrypted data
3. **Forward secrecy**: Each item uses a unique IV, so compromising one item doesn't affect others
4. **Key isolation**: Each user's encryption key is derived from their password and unique salt

## Threat Model

This design protects against:
- **Server compromise**: Even if the server is compromised, attackers cannot decrypt user data
- **Database breaches**: Encrypted data in the database is useless without user passwords
- **Network interception**: All data transmitted is encrypted
- **Insider threats**: Server administrators cannot access user data

## Limitations

- **Password-based security**: The security of the entire system depends on the strength of user passwords
- **Client-side key storage**: Encryption keys are stored in browser memory during the session
- **No key rotation**: There's no mechanism for rotating encryption keys without re-encrypting all data

## Recommendations for Production

1. **Password policies**: Implement strong password requirements
2. **Rate limiting**: Add rate limiting to prevent brute force attacks
3. **Session management**: Implement proper session timeout and key cleanup
4. **Audit logging**: Log authentication attempts and key operations
5. **Backup encryption**: Ensure backups are also encrypted
