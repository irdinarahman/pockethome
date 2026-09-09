# Pocket Home

A personal command centre PWA — greeting, today's stats, upcoming events.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. It's already wired as an installable PWA
(manifest.json + service worker), so on mobile Chrome/Safari you'll see
an "Add to home screen" / install prompt once deployed over HTTPS
(install prompts don't fire on plain localhost in some browsers — test
on a deployed preview URL too).

## Deploy free

Push this folder to a GitHub repo, then import it into
[Vercel](https://vercel.com) or [Netlify](https://netlify.com) (both
free tiers). Framework preset: Vite. Build command: `npm run build`.
Output directory: `dist`.

## What's here

- `src/App.jsx` — main screen, reads from `src/data/mockData.js`
- `src/components/` — `StatCard` and `UpcomingRow`, reused across
  small/medium/large widget layouts as you build those next
- `public/manifest.json` + `public/sw.js` — PWA install + offline shell
- `public/icons/` — placeholder icons in your Onyx/blush palette;
  swap these for real artwork before launch
- `src/index.css` — all your palette colors as CSS variables, with a
  `prefers-color-scheme: light` override already wired for light mode

## Connect Supabase

1. In your Supabase project, go to **SQL Editor** and run everything in
   `supabase/schema.sql` — this creates `tasks`, `events`, `expenses`,
   `daily_stats`, and `upcoming_items` tables with row-level security
   so each user only sees their own data.
2. Copy `.env.example` to `.env` and fill in your project's URL and
   anon key (Settings → API in the Supabase dashboard):
   ```bash
   cp .env.example .env
   ```
3. In Supabase, go to **Authentication → Providers** and turn on
   **Anonymous sign-ins**. This is what lets the app skip a login
   screen entirely — it creates a free, no-email session per device
   so row-level security still works.
4. `npm install` (pulls in `@supabase/supabase-js`), then `npm run dev`.
5. On first load the app signs you in anonymously and shows the home
   screen right away. Since the tables start empty, add a few rows
   manually in the Supabase Table Editor (a task, an event, an
   upcoming item) — match the `user_id` to the anonymous user created
   under Authentication → Users, or just add rows after your first
   visit and query them by that id.

   Note: an anonymous session is tied to this browser/device. If you
   clear site data or switch devices, you get a new session with no
   data. `src/components/Login.jsx` (email magic-link) is still in the
   project if you want to add a "save my data" upgrade path later —
   Supabase supports converting an anonymous user to a permanent one.

## Self-care streak

The reading streak became a general self-care streak: a "Check in" button on the home stat card. Checking in today, having checked in yesterday, extends the streak by one; missing a day resets it to 1 on the next check-in. Logic lives in `src/hooks/useSelfCareStreak.js`, backed by its own `self_care_streak` table (one row per user: `current_streak`, `last_checkin_date`).

## Adding data from inside the app

`/add` (linked as "+ Add something" on the home screen) has tabs for
Task, Event, Expense, and Upcoming — each a small form that inserts
straight into Supabase. The Task tab also shows your 10 most recent
tasks with a tap-to-toggle checkbox, so you don't need the Supabase
dashboard for day-to-day use anymore.

## Notifications (OneSignal)

The OneSignal Web SDK is wired in (`src/lib/onesignal.js`, loaded via
`index.html`, initialized in `App.jsx` with your Supabase user id as
the OneSignal "external id" — this is what lets you target this exact
user later without needing their raw device id). `/settings` has an
"Enable notifications" button that requests browser permission.

This gets the subscribe flow working end-to-end: you can now send a
manual push from the OneSignal dashboard (Messages → New Push) and it
will arrive. What it does **not** do yet is generate the personalized
"3 tasks, birthday in 8 days" content automatically every morning —
that requires code running on a schedule, which a static PWA doesn't
have on its own. The realistic next step: a Supabase Edge Function
(free tier includes these) that runs on a daily cron trigger, queries
each user's `tasks`/`events`/`upcoming_items`, builds their sentence,
and calls OneSignal's REST API targeting that user's external id. This
needs a **private** OneSignal REST API key — never put that key in
frontend code; it belongs only inside the Edge Function's environment
variables.

## Logo

`public/icons/icon-192.png` and `icon-512.png` are the real app icon now (a home outline with a heart nested inside, in the Onyx/Wineshade/blush palette) — no longer placeholders. Used for the browser favicon, the PWA manifest, and the iOS home-screen icon.

## Customize screen

`/settings` (linked from the "Customize widgets" button) reads and
writes the `widget_settings` table — toggle which stats show, pick a
widget size label, and set how many upcoming items to display. Changes
save immediately on click, no separate save button. Each user gets
their own row (`user_id` is the primary key), created automatically
the first time they change a setting.

Note: `widget_size` here is just a stored preference for when you
build the actual home-screen widget exports later — it doesn't resize
this app screen itself.

## Next steps

1. Wire real data (tasks, calendar, spending, step count) instead of
   `mockData.js` — likely via Supabase or Firebase for sync across
   devices, per the earlier plan.
2. Build the customize/settings screen from the earlier mockup as a
   second route (add `react-router-dom` when you get there).
3. Replace placeholder icons in `public/icons/` with final artwork at
   192x192 and 512x512.
4. Add a privacy policy page and link it before sharing publicly.
