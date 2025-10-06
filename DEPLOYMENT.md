# Deployment Guide

This guide will help you deploy the Password Vault application to Vercel with MongoDB Atlas.

## Prerequisites

- GitHub account
- Vercel account
- MongoDB Atlas account

## Step 1: Set up MongoDB Atlas

1. **Create a MongoDB Atlas account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a new cluster**
   - Choose the free tier (M0)
   - Select a region close to your users
   - Name your cluster (e.g., "password-vault")

3. **Create a database user**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a strong password and save it
   - Give the user "Read and write to any database" privileges

4. **Whitelist IP addresses**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, you can add "0.0.0.0/0" to allow all IPs
   - For production, add specific IP addresses

5. **Get your connection string**
   - Go to "Clusters" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `password-vault`

## Step 2: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In the Vercel dashboard, go to your project
   - Click on "Settings" → "Environment Variables"
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A random string (use a password generator)
     - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)

4. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for the deployment to complete
   - Your app will be available at `https://your-app.vercel.app`

## Step 3: Test the Application

1. **Visit your deployed app**
   - Go to your Vercel URL
   - You should see the login/signup page

2. **Create an account**
   - Click "Sign up"
   - Enter your email and password
   - Click "Sign up"

3. **Test the vault**
   - You should be redirected to the vault page
   - Try adding a new password item
   - Test the password generator
   - Test copying passwords

## Step 4: Verify Security

1. **Check database encryption**
   - Go to MongoDB Atlas
   - View your database collections
   - Verify that vault items are stored as encrypted blobs
   - Confirm no plaintext passwords are visible

2. **Test client-side encryption**
   - Open browser developer tools
   - Go to Network tab
   - Add a new vault item
   - Verify that only encrypted data is sent to the server

## Troubleshooting

### Common Issues

1. **"MONGODB_URI not defined" error**
   - Make sure you've added the environment variable in Vercel
   - Check that the connection string is correct
   - Ensure the database user has proper permissions

2. **"Authentication failed" error**
   - Check that JWT_SECRET is set in Vercel
   - Verify the MongoDB connection string is correct

3. **"Failed to initialize encryption" error**
   - This is expected during build time
   - The error should not occur during runtime

### Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/password-vault` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-jwt-key-here` |
| `NEXTAUTH_URL` | Application URL | `https://your-app.vercel.app` |

## Security Considerations

- **Never commit environment variables** to your repository
- **Use strong JWT secrets** (at least 32 characters)
- **Restrict MongoDB access** to specific IP ranges in production
- **Regularly rotate secrets** and database passwords
- **Monitor your application** for suspicious activity

## Production Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Database user has minimal required permissions
- [ ] IP whitelist is configured (not 0.0.0.0/0)
- [ ] Environment variables are set in Vercel
- [ ] JWT secret is strong and unique
- [ ] Application is accessible via HTTPS
- [ ] Test all functionality works correctly
- [ ] Verify encryption is working (no plaintext in database)

## Support

If you encounter issues:

1. Check the Vercel deployment logs
2. Check MongoDB Atlas logs
3. Verify all environment variables are set correctly
4. Test locally with the same environment variables
