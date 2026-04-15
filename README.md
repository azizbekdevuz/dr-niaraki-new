# Dr. Abolghasem Sadeghi-Niaraki — official site

Next.js **15** (App Router), React **19**, TypeScript. Public pages read **published content from PostgreSQL via Prisma** when `DATABASE_URL` is set, with a **canonical static fallback** when the DB is unavailable. Admin/editor flows cover draft, publish, restore, and document import/review/merge.

## Prerequisites

- Node.js **18+**
- **npm** (primary; scripts below use `npm run`)

## Setup

```bash
git clone <repository-url>
cd dr-niaraki-new
npm install
cp .env.example .env   # then edit DATABASE_URL and optional admin vars
npx prisma migrate dev # or prisma db push for a throwaway local DB
npm run dev
```

Environment reference: **`.env.example`**. Admin and optional flags are documented there and in `src/server/admin/adminSecurityConfig.ts` / `adminBootstrap.ts`.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run type-check` | TypeScript (`tsc --noEmit`) |
| `npm run test` / `npm run test:run` | Vitest |
| `npm run prisma:migrate` / `prisma:push` / `prisma:studio` | Prisma |
| `npm run analyze` | Bundle analyzer (`ANALYZE=true` build) |
| `npm run perf:check` | Local perf / lint / type pass helper |

## Architecture (short)

- **`src/app/`** — App Router routes (public site, admin, API).
- **`src/server/`** — Server-only Prisma, auth/session, admin, import pipeline.
- **Public reads** — DB-first where configured; **fallback** preserves a working site without a live DB.
- **Background** — Layered **CSS-only** spatial field (grids, blooms, subtle scan lines; no canvas / rAF graph). Optional custom cursor: `NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR=true` in `.env.example`.
- **Uploads on Vercel** — With `VERCEL=1` and `BLOB_READ_WRITE_TOKEN`, DOCX bytes go to **private Vercel Blob**; `UploadedFile.storedPath` records `vercel-blob-path:…` and downloads use `/api/admin/uploaded-files/[id]/file`. Locally, files stay under `public/uploads/` when Blob is not used.
- **Admin devices** — When `DATABASE_URL` is set, registered devices live in **Postgres** (`AdminRegisteredDevice`), avoiding GitHub JSON **409** races; legacy `admin_devices.json` remains for DB-less dev. GitHub file commits still **retry on 409** for other mirrors.

## Security and ops notes

- Security headers and rate limiting are configured for production-style deploys.
- Treat `.env` secrets as confidential; see `.env.example` for optional legacy admin JWT restore flag.

## License

Proprietary and confidential.
