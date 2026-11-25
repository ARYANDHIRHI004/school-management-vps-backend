# School Management — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. Runs on **port 3001** so the API can stay on **3000**.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Ensure the backend `.env` includes this origin in `CORS_ORIGINS`:

```env
CORS_ORIGINS=http://localhost:3001,...
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_AUTH_SIGNUP_ENABLED` | Show `sign-up/email` form when `true` (mirror `AUTH_ALLOW_PUBLIC_SIGNUP` on API) |

## Landing page (`/`)

Mirrors the [Vikas Valley reference UI](https://github.com/Dhamendra21/vikas-vally-frontend-/tree/main/src/app): navbar, hero carousel, news ticker, mission/vision, campus gallery, achievements, academic wings + enquiry form, footer, and welcome modal. Uses **framer-motion**, **lucide-react**, and assets under `public/images/`.

Auth routes: `/login`, `/signup`, `/dashboard` (unchanged).

## Project layout

| Path | Purpose |
|------|---------|
| `src/components/landing/*` | Marketing home page sections |
| `src/providers/app-providers.tsx` | TanStack Query `QueryClientProvider` |
| `src/stores/auth-store.ts` | Zustand — cached user snapshot |
| `src/hooks/queries/*` | Session & health queries |
| `src/hooks/mutations/use-auth-mutations.ts` | Sign-in / sign-up / sign-out mutations |
| `src/hooks/use-api-query.ts` | Reusable `{ success, data }` API queries |
| `src/lib/auth-client.ts` | Better Auth client (sign-in / session) |
| `src/lib/api.ts` | JSON API helper with cookies |
| `src/app/login` | `POST /api/auth/sign-in/email` |
| `src/app/signup` | Public sign-up (if enabled) or admin create-user |
| `src/app/dashboard` | Session + `/api/health` smoke test |

## Scripts

```bash
npm run dev    # next dev -p 3001
npm run build
npm run start
npm run lint
```