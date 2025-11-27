# Admin DOCX Import System Documentation

## Overview

This documentation covers the automated DOCX CV import system for the Dr. Sadeghi-Niaraki website. The system allows the professor to upload his CV in DOCX format, which is then parsed into structured JSON data and committed to the repository.

## Environment Variables

### Required Variables

Set these in your Vercel project settings under **Settings > Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Personal Access Token with `repo` write/contents scope | Yes (for GitHub commits) |
| `GITHUB_REPO` | Repository in format `owner/repo` (default: `azizbekdevuz/dr-niaraki-website`) | No |
| `BRANCH` | Branch to commit to (default: `main`) | No |
| `ADMIN_PASSWORD` | Password for admin login | Yes |
| `ADMIN_SECRET` | Secret key for signing JWT tokens | Yes |
| `PARSER_VERSION` | Parser version string (default: `v1.0.0`) | No |

### How to Get a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Dr-Niaraki-Website-Deploy")
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)
7. Add it to Vercel as `GITHUB_TOKEN`

### Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable with appropriate values
4. For `ADMIN_PASSWORD`, use a strong password
5. For `ADMIN_SECRET`, generate a random 32+ character string

## Running Locally

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/azizbekdevuz/dr-niaraki-website.git
   cd dr-niaraki-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   GITHUB_TOKEN=your_github_token
   GITHUB_REPO=azizbekdevuz/dr-niaraki-website
   BRANCH=main
   ADMIN_PASSWORD=your_admin_password
   ADMIN_SECRET=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the admin panel at `http://localhost:3000/admin`

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run
```

## Admin Panel Usage

### 1. Login

1. Navigate to `/admin`
2. Enter the admin password
3. If this is your first time on this device, you'll be prompted to register it

### 2. Device Registration

- Each device must be registered to perform commit operations
- Give your device a meaningful label (e.g., "Office Laptop")
- The device token is stored in a secure HttpOnly cookie
- Tokens expire after 1 year by default

### 3. Uploading a CV

1. Go to `/admin/upload`
2. Select a DOCX file
3. Click "Upload & Parse"
4. Review the parsed data in the preview tabs:
   - Profile
   - About
   - Publications
   - Patents
   - Contact

### 4. Handling Warnings

- The parser is conservative and will generate warnings for ambiguous data
- Review each warning carefully
- If warnings exist, you must check "I have reviewed and accept the warnings" before committing

### 5. Committing Changes

1. After reviewing, click "Commit to GitHub"
2. The system will:
   - Save the DOCX file to `/public/uploads/`
   - Commit `details.json` to the repository
   - Trigger a Vercel deployment
3. You'll see the commit SHA and a link to GitHub

### 6. Upload History

- View all previously uploaded files at `/admin/history`
- Download or delete files as needed
- Deleting removes the file but does NOT revert any commits

## Rollback Instructions

If you need to revert changes made by a commit:

### Option 1: GitHub Web UI

1. Go to the commit URL (shown after upload)
2. Click the "..." menu
3. Select "Revert" and follow the prompts
4. This creates a new commit that undoes the changes

### Option 2: Git CLI

```bash
# Fetch the latest changes
git fetch origin main

# Checkout the main branch
git checkout main

# Revert the specific commit (replace COMMIT_SHA)
git revert COMMIT_SHA

# Push the revert
git push origin main
```

### Option 3: Hard Reset (Destructive)

⚠️ **Warning**: This rewrites history. Only use if you're certain.

```bash
git fetch origin main
git checkout main
git reset --hard COMMIT_SHA^
git push origin main --force
```

## Managing Admin Devices

### Viewing Devices

Go to `/admin/devices` to see all registered devices.

### Revoking a Device

1. Go to `/admin/devices`
2. Find the device you want to revoke
3. Click the trash icon
4. Confirm the revocation

### Adding a New Device

1. Log in on the new device
2. You'll be prompted to register
3. Enter a label and click "Register"

## File Structure

```
/src/
  /parser/           # DOCX parsing logic
  /validators/       # Zod schemas
  /lib/              # GitHub, storage, auth helpers
  /app/
    /admin/          # Admin UI pages
    /api/admin/      # Admin API routes
  /types/            # TypeScript type definitions
  /tests/            # Unit tests

/public/
  /uploads/          # Uploaded DOCX files and metadata
```

## Troubleshooting

### "Unauthorized" error on admin pages

- Make sure `ADMIN_PASSWORD` is set in environment variables
- Clear cookies and try logging in again

### "Device not registered" error

- Go to `/admin/devices` and register your device
- Ensure cookies are enabled in your browser

### GitHub commit fails

- Verify `GITHUB_TOKEN` has the correct permissions
- Check the token hasn't expired
- Ensure the repository name is correct

### Parser warnings

- Warnings are normal for complex documents
- Review each warning and either:
  - Fix the source DOCX file
  - Accept the warnings if the data is correct

### Uploads not showing

- Check that `/public/uploads/` directory exists
- Verify write permissions on the directory

## Security Notes

- Admin passwords and secrets should never be committed to the repository
- Device tokens are stored as HttpOnly cookies
- All admin routes require authentication
- GitHub tokens should have minimal required permissions

## Support

For issues or questions:
1. Check the issues tab on GitHub
2. Contact the project maintainer
3. Review error messages in browser console and server logs

