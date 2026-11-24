# DM Docs (V1 — Liquid Glass)

Personal shareable DM Doc & link generator built with React, Vite, Tailwind CSS, and Supabase.

## Deploy Setup (GitHub + Vercel + Supabase)

1. **Supabase Setup:**
   - Create a project in Supabase.
   - Open **SQL Editor** and run `supabase/schema.sql`.
   - Go to **Authentication -> Users** and create your personal email + password user (disable public signups in Auth settings so only you can log in).
2. **Environment Variables:**
   - Copy `.env.example` to `.env` for local dev, and add the same two keys in Vercel Project Settings:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
3. **Local Run:**
   ```bash
   npm install
   npm run dev
   ```
4. **Deploy to Vercel:**
   - Push this folder to GitHub and import the repo in Vercel.
   - `vercel.json` is preconfigured for `/d/:slug` and `/admin` routes.
