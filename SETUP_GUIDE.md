# YieldIQ Local Setup Guide

Welcome to YieldIQ! This guide will help you configure your local development environment to run the complete platform, including Supabase integrations, NextAuth, and the AI features.

## 1. Prerequisites
- **Node.js**: v18 or higher.
- **Supabase Account**: Access to [Supabase](https://supabase.com/) to create a new project.
- **Google Cloud Console**: For setting up Google OAuth credentials.
- **Google AI Studio**: To obtain a Gemini API Key.

## 2. Infrastructure Configuration

### Supabase Setup
1. Create a new project in your Supabase dashboard.
2. Initialize your database schema (refer to `supabase/migrations` if available).
3. Retrieve your Project URL, Anon Key, and Service Role Key from **Project Settings > API**.

### Google Auth (NextAuth) Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and set up the **OAuth consent screen**.
3. Create **OAuth 2.0 Client IDs** under Credentials. 
4. Add `http://localhost:9002/api/auth/callback/google` to the Authorized redirect URIs.

### AI Configuration
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key for Gemini.

## 3. Environment Variables
Create a `.env.local` file in the root directory and populate it with your credentials:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:9002"
NEXTAUTH_SECRET="<generate-a-secure-random-string>"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="<your-supabase-url>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"

# AI Identity & Services
GOOGLE_GENAI_API_KEY="<your-gemini-api-key>"
GEMINI_API_KEY="<your-gemini-api-key>"

# Admin Whitelist (comma-separated emails for the Admin Dashboard)
ADMIN_EMAILS="your-email@gmail.com"
```

## 4. Run the Project
1. Install node modules (if you haven't already):
   ```bash
   npm install
   ```
2. Start the Turbopack development server on port 9002:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:9002` in your browser.

## 5. Troubleshooting
- **API Key Errors in AI Agents**: If the AI Assistant shows `"⚠️ AI Agent Error"`, ensure your `GOOGLE_GENAI_API_KEY` is valid and not expired. The agents will automatically default to a safe UI fallback rather than throwing an error.
- **Google Sign-In Failing**: Verify that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are exactly correct, and ensure NextAuth callbacks point to `http://localhost:9002`.
- **Database Access Errors**: Confirm that your Supabase Row Level Security (RLS) policies permit access for your authenticated NextAuth user.
