# Password Vault - Secure Password Manager

A privacy-first password manager built with Next.js, TypeScript, and MongoDB. All vault data is encrypted client-side using the Web Crypto API before being sent to the server, ensuring your passwords are never stored in plaintext.

## 🔐 Security Features

- **Client-side encryption**: All vault data is encrypted using AES-GCM before leaving your device
- **PBKDF2 key derivation**: Your password is used to derive encryption keys using industry-standard PBKDF2
- **Zero-knowledge architecture**: The server never sees your plaintext passwords or encryption keys
- **Secure authentication**: Passwords are hashed with bcrypt on the server
- **JWT-based sessions**: Secure session management with HTTP-only cookies

## ✨ Features

- **Password Generator**: Create strong passwords with customizable options
  - Adjustable length (4-128 characters)
  - Include/exclude character types (lowercase, uppercase, numbers, symbols)
  - Exclude look-alike characters (0, O, o, I, l, 1)
- **Secure Vault**: Store and manage passwords
  - Encrypted storage of passwords, usernames, URLs, and notes
  - Search and filter functionality
  - Copy passwords with auto-clear after 12 seconds
  - Edit and delete vault items
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (free tier available)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrathamJain2002/Password-Generator-Secure-Vault-MVP-.git
   cd password-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Create `.env.local` with your values:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/password-vault
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```
   
   **⚠️ Important:** Replace the placeholder values with your actual credentials. Never commit real credentials to version control!

4. **Set up MongoDB Atlas**
   - Create a new cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a database user and get your connection string
   - Update `MONGODB_URI` in your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Client-Side Encryption Flow

1. **Registration/Login**: User enters password
2. **Key Derivation**: Client derives encryption key using PBKDF2 with server-provided salt
3. **Data Encryption**: All vault items encrypted with AES-GCM before sending to server
4. **Storage**: Server stores only encrypted blobs and metadata
5. **Decryption**: Data decrypted client-side when needed

### Database Schema

```typescript
// User collection
{
  _id: ObjectId,
  email: string,
  passwordHash: string, // bcrypt hash
  salt: string,         // base64 encoded salt for key derivation
  createdAt: Date,
  updatedAt: Date
}

// VaultItem collection
{
  _id: ObjectId,
  ownerId: ObjectId,
  cipher: string,       // base64 encrypted vault data
  iv: string,          // base64 IV for AES-GCM
  titleHint: string,   // lowercase title for search (optional)
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/crypto/salt` - Get user's salt for key derivation

### Vault Management
- `GET /api/vault` - Get all vault items for authenticated user
- `POST /api/vault` - Create new vault item
- `PUT /api/vault/:id` - Update vault item
- `DELETE /api/vault/:id` - Delete vault item

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NEXTAUTH_URL` (your Vercel domain)

3. **Set up MongoDB Atlas**
   - Create a cluster
   - Add your Vercel domain to IP whitelist (or use 0.0.0.0/0 for development)
   - Update `MONGODB_URI` in Vercel environment variables

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key-here` |
| `NEXTAUTH_URL` | Application URL | `https://password-generator-secure-vault-mvp-iota.vercel.app` |

## 🔒 Security Considerations

### What's Encrypted
- All vault item data (title, username, password, URL, notes)
- Encryption happens client-side before transmission

### What's Not Encrypted
- User email addresses (for authentication)
- Password hashes (stored server-side for authentication)
- Metadata (timestamps, IDs)

### Key Management
- Encryption keys are derived from user passwords using PBKDF2
- Keys are never stored on the server
- Keys exist only in browser memory during session

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes
│   ├── vault/         # Vault page
│   └── page.tsx       # Home/login page
├── components/        # React components
├── lib/              # Utilities (crypto, API client)
└── models/           # MongoDB models
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Crypto Rationale

**AES-GCM with PBKDF2**: We use AES-GCM for authenticated encryption (confidentiality + integrity) and PBKDF2 for key derivation from passwords. This combination provides strong security against both passive and active attacks while being widely supported and audited.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🔮 Future Enhancements

- [ ] TOTP 2FA support
- [ ] Tags and folders for organization
- [ ] Dark mode theme
- [ ] Import/export encrypted backups
- [ ] Browser extension
- [ ] Mobile app
- [ ] Password strength analysis
- [ ] Breach detection integration