# Naraka Tournament Hero Tracker

Track hero picks across Naraka Bladepoint tournaments. Supports solo and trios modes. Built with React, TypeScript, and Supabase.

## Features

- Create tournaments in **solo** or **trios** mode
- Define custom team names
- Track hero picks per game across all participants
- View pick rate summary for the entire tournament
- Share tournament by link (no login required)
- All 27 heroes up to Tara Gan

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the Supabase migration in `supabase/migrations/20260509000000_init.sql`
5. Start dev server: `npm run dev`

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy

The app is deployed via GitHub Pages. Push to `main` and the GitHub Action will build and deploy automatically.

---

Built for the Naraka Bladepoint community.
