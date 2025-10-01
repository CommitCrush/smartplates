# Environment Setup Guide

This guide explains how to set up environment variables for the SmartPlates application.

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your actual values (the file already has development defaults)

3. **Start your MongoDB server** (if using local MongoDB)

4. **Run the application:**
   ```bash
   bun run dev
   ```

## Required Environment Variables

### Database Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB` | Database name | `smartplates` |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Generate with `openssl rand -base64 32` |

## Optional Environment Variables

### Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Application base URL |
| `NODE_ENV` | `development` | Environment mode |
| `DEBUG` | `false` | Enable debug logging |

### Image Upload (Cloudinary)

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |

### External APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `SPOONACULAR_API_KEY` | Spoonacular recipe API key | `your-spoonacular-key` |

### Future Features (Optional)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project for AI features |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `EMAIL_SERVICE_API_KEY` | Email service API key |

## Environment Files

- **`.env.example`** - Template with all possible variables
- **`.env.local`** - Your local development configuration (git-ignored)
- **`.env.production`** - Production configuration (create when deploying)

## MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB on your system
2. Start MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017`

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Use your Atlas connection string for `MONGODB_URI`

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env.local` or `.env.production`** - they're git-ignored for security
2. **Use strong JWT secrets** in production - generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** in production environments
4. **Use environment-specific values** - don't use development secrets in production

## Validation

The application automatically validates required environment variables on startup. If any required variables are missing, you'll see an error message listing what needs to be set.

## Troubleshooting

### "Missing required environment variables" Error

Make sure your `.env.local` file exists and contains:
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=smartplates
JWT_SECRET=your-secret-key-here
```

### Database Connection Issues

1. Check if MongoDB is running
2. Verify your `MONGODB_URI` is correct
3. Ensure database permissions are set up properly

### JWT Token Issues

1. Make sure `JWT_SECRET` is set and is a strong secret
2. Don't use spaces or special characters that might cause parsing issues

## Example Configuration

For local development, your `.env.local` should look like:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=smartplates

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
DEBUG=true
```
