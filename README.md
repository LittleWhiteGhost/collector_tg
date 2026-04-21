# TG Stars Mini App — Frontend (Zentra-inspired, orange-red accent)

Redesigned Telegram Mini App UI. Wired to the backend from `tg_bot_backend/`.

## Screens

| Screen    | What                                                                 |
| --------- | -------------------------------------------------------------------- |
| Welcome   | Onboarding slider (3 slides), NEXT / SKIP, glass TG STARS badge      |
| Plans     | "More Control" paywall — BASIC / PRO / ELITE tabs, feature rows with lock/check, big Continue CTA |
| Profile   | User card + active subscription + channels + payment history          |
| Success   | Payment confirmation with plan summary                                |
| Error     | Retry screen                                                          |

## Stack

React 19 · Vite 7 · TypeScript 5 · Tailwind CSS v4 · lucide-react · `@twa-dev/sdk`

## Run

```bash
npm install          # or: pnpm install / bun install
npm run dev          # vite dev server on http://127.0.0.1:5173
```

Point it at your backend:

```bash
echo "VITE_API_BASE=http://localhost:8000" > .env.local
```

The backend lives in `tg_bot_backend/backend/` — start it with `./run.sh` there first.

## Build

```bash
npm run build        # dist/
npm run preview      # serve the built bundle on :4173
```

## Theme

Accent colour is `#E8380D` (orange-red). See `src/index.css` for the full
`brand-*` scale; Tailwind v4 picks it up via `@theme`.
