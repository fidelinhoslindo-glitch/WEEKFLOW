# WeekFlow — Cloud Sync Setup (Supabase)

Follow these 5 steps to enable **data saved across all devices**, even after logout.

## 1. Create a free Supabase project
- Go to https://supabase.com → New Project
- Name: weekflow | Pick a region close to you
- Wait ~2 minutes

## 2. Run the database SQL
- Click SQL Editor in Supabase → New Query
- Copy the SETUP_SQL from src/utils/supabase.js and run it

## 3. Get your credentials
- Settings → API → copy Project URL and anon/public key

## 4. Create .env file
```
cp .env.example .env
```
Fill in:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Restart dev server
```
npm run dev
```
You'll see a cloud sync icon in the header when active.

## What syncs
- Tasks ✅ | Notes ✅ | Profile ✅
- Dark mode ❌ local only | Onboarding ❌ local only
