# Deployment Guide - YieldIQ

Follow these steps to deploy YieldIQ to GitHub and Vercel.

## 1. Prepare for GitHub

First, initialize your Git repository and push your code to GitHub.

### Step 1: Initialize Git
Open your terminal in the project root and run:
```bash
git init
git add .
git commit -m "Initial commit of YieldIQ platform"
```

### Step 2: Create GitHub Repository
1. Go to [github.com](https://github.com/new).
2. Create a new repository (name it `YieldIQ`).
3. Follow the instructions to push your existing repository from the command line:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YieldIQ.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

### Step 1: Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com/new).
2. Log in with your GitHub account.
3. Find your `YieldIQ` repository and click **Import**.

### Step 2: Configure Environment Variables
This is the most critical step. You must add all the keys from `.env.example` to the Vercel dashboard:
1. In the Vercel project settings, go to **Environment Variables**.
2. Add each key (e.g., `GOOGLE_CLIENT_ID`) and its corresponding value from your local `.env.local`.
3. **IMPORTANT**: For `NEXTAUTH_URL`, use your Vercel deployment URL (e.g., `https://yield-iq.vercel.app`).
4. **IMPORTANT**: Ensure your Google Cloud Console OAuth redirect URIs include your Vercel URL.

### Step 3: Deploy
Click **Deploy**. Vercel will automatically build and deploy your application.

## 3. Post-Deployment Checklist

- [ ] Verify that Google Login works on the production URL.
- [ ] Ensure Supabase connection is stable.
- [ ] Check if Gemini AI generation is functional (using your API keys).
- [ ] Ensure all pages are accessible without build errors.
