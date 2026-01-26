# Cloudflare R2 Storage Setup Guide

## Overview

Readmigo uses Cloudflare R2 for storing:
- Book EPUB files
- Book cover images
- Chapter HTML content
- User-generated content (postcards, etc.)

## Prerequisites

- Cloudflare account
- R2 subscription enabled (free tier includes 10GB storage, 1M Class A operations, 10M Class B operations)

## Step 1: Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**
4. Enter bucket name: `readmigo` (or your preferred name)
5. Select location hint (optional): Choose region closest to your users
6. Click **Create bucket**

## Step 2: Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure token:
   - **Token name**: `readmigo-backend`
   - **Permissions**: Select `Object Read & Write`
   - **TTL**: Never expires (or set based on your security policy)
   - **Bucket scope**: Specify your bucket name
4. Click **Create API Token**
5. **IMPORTANT**: Copy the following values immediately (they won't be shown again):
   - **Access Key ID**
   - **Secret Access Key**

## Step 3: Get Account ID

1. Go to any page in Cloudflare Dashboard
2. Look at the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/...`
3. Copy the 32-character Account ID

## Step 4: Configure Custom Domain (Recommended)

For public assets (book covers, etc.), set up a custom domain:

1. Go to your R2 bucket settings
2. Click **Settings** tab
3. Under **Public access**, click **Connect Domain**
4. Enter your domain: `cdn.readmigo.app` (or your domain)
5. Follow DNS configuration instructions

Alternatively, enable R2.dev subdomain:
1. Under **Public access**, toggle **R2.dev subdomain**
2. Note the public URL: `https://<bucket>.<account-id>.r2.dev`

## Step 5: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-32-character-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=readmigo
R2_PUBLIC_URL=https://cdn.readmigo.app  # or your R2.dev URL
```

## Step 6: Configure CORS (Optional)

If accessing R2 directly from the iOS app:

1. Go to bucket **Settings**
2. Under **CORS policy**, add:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Folder Structure

The storage service organizes files as follows:

```
readmigo/
├── books/
│   └── {bookId}/
│       ├── cover.jpg
│       ├── cover-thumb.jpg
│       ├── book.epub
│       └── chapters/
│           ├── {chapterId}.html
│           └── ...
├── users/
│   └── {userId}/
│       ├── avatar.jpg
│       └── postcards/
│           └── {postcardId}.png
└── assets/
    └── templates/
        └── ...
```

## Verification

After configuration, verify storage is working:

```bash
# Check health endpoint
curl http://localhost:3000/api/v1/health

# Response should show storage status
{
  "status": "ok",
  "services": {
    "storage": {
      "status": "ok"
    }
  }
}
```

## Production Checklist

- [ ] R2 bucket created
- [ ] API token generated with proper permissions
- [ ] Environment variables configured in Fly.io secrets
- [ ] Custom domain configured (optional but recommended)
- [ ] CORS policy set if needed
- [ ] Backup strategy defined

## Fly.io Configuration

Set secrets in Fly.io:

```bash
flyctl secrets set \
  R2_ACCOUNT_ID=your-account-id \
  R2_ACCESS_KEY_ID=your-access-key \
  R2_SECRET_ACCESS_KEY=your-secret-key \
  R2_BUCKET_NAME=readmigo \
  R2_PUBLIC_URL=https://cdn.readmigo.app
```

## Troubleshooting

### "Storage service not configured"
- Verify all R2 environment variables are set
- Check for typos in environment variable names
- Restart the backend service after updating env vars

### "Access Denied"
- Verify API token has correct bucket permissions
- Check bucket name matches exactly
- Ensure token hasn't expired

### Images not loading
- Verify R2_PUBLIC_URL is correct
- Check CORS policy allows your domain
- Verify objects are uploaded to correct paths
