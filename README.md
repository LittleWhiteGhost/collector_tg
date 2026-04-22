# TG Stars Mini App — Frontend (responsive, Zentra-inspired, orange-red accent)

Telegram Mini App UI with a full in-app admin panel. Wired to the backend in
`tg_bot_backend/`.

## Responsive layouts

| Breakpoint       | Shell                                                      |
| ---------------- | ---------------------------------------------------------- |
| mobile (< 640px) | full width stacked content · fixed bottom-nav (Home / Profile / Admin*) |
| tablet (≥ 640px) | compact left sidebar with icons · flexible main area       |
| desktop (≥ 1024px) | full sidebar with labels · multi-column grids (plans, channels, users) |

`*` Admin items only appear when the authenticated user has `is_admin = true`.

## Screens

### Client
* **Welcome** — onboarding slider (3 slides, NEXT / SKIP)
* **Plans** — on mobile: single focused card with tabs; on desktop: 3-column comparison grid + big CTA
* **Profile** — avatar · active subscription (days left / expires / since / price) · channels list · payments history
* **Success / Error** — payment result with retry

### Admin (inside Mini App — ADMIN-only)
* **Dashboard** — KPIs, weekly revenue bar chart, plan breakdown, conversion/churn/ARPU, recent activity
* **Channels** — CRUD, enable/disable, bind channel to a plan
* **Tariffs** — CRUD plans (label, stars, period, badge, features editor, ordering)
* **Users** — list filtered by plan (`all / basic / pro / elite`)
* **Payments** — all transactions + stats cards

## Stack

React 19 · Vite 7 · TypeScript 5 · Tailwind CSS v4 · lucide-react · `@twa-dev/sdk`

## Run

```bash
npm install
echo "VITE_API_BASE=http://localhost:8000" > .env.local
npm run dev          # http://127.0.0.1:5173
```

The backend must be running at `VITE_API_BASE` (see `tg_bot_backend/backend/run.sh`).

## Build

```bash
npm run build        # dist/
npm run preview      # :4173
```

## Theme

Accent is `#E8380D`. Change `--color-brand-500` in `src/index.css`
(Tailwind v4 picks it up via `@theme`).
