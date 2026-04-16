# Dr. Abolghasem Sadeghi-Niaraki — official site

Next.js **15** (App Router), React **19**, TypeScript **5**, Tailwind CSS **3**, Prisma **6**, Zod **4**. Public pages read **published content from PostgreSQL via Prisma** when `DATABASE_URL` is set, with a **validated canonical seed** (`src/content/defaults.ts`) when the DB is unavailable or published JSON is invalid. Admin/editor flows cover draft, publish, restore, and document import/review/merge.

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

- **`src/app/`** — App Router routes (public site, admin, API route handlers).
- **`src/app/admin/content/workflow/`** — Extracted admin **content workflow** UI pieces (live read panel, toolbar, published versions table) composed by `workflowSections.tsx`.
- **`src/app/admin/upload/`** — CV DOCX flow: **`page.tsx`** composes **`hooks/`** (`useAdminUploadAuthGate`, `useCvDocxWorkflow`) and **`components/`** (toolbar, legacy notice, form, warnings, preview tabs, commit). **`adminSubnavStyles.ts`** + **`src/lib/ui/chromeClassStrings.ts`** hold repeated Tailwind fragments shared with other admin/public chrome.
- **`src/app/admin/imports/`** — Import review screen: types in **`importDetailTypes.ts`**, layout in **`importDetailBody.tsx`**, and focused **`Import*.tsx`** cards/panels (provenance, summary, warnings, merge, structured diff).
- **`src/server/`** — Server-only Prisma, auth/session, admin guards, import pipeline, public read orchestration.
- **`src/content/`** — Zod `SiteContent` schema, seeds, validators; single source for public copy and structure.
- **Public reads** — Prefer latest **published** row from DB when valid; otherwise validated **canonical** seed. See `src/server/content/publicSiteContent.ts` and `publishedSiteContent.ts`.
- **Frontend** — Hybrid **CSS spatial background** (`CssSpatialBackground`) plus **bounded WebGL/XR canvas** (`XrLabCanvas` inside `SpatialFieldStack`) where enabled; respects `prefers-reduced-motion`. Custom cursor: `NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR=true` (see `.env.example`, `src/styles/atomcursor.css`).
- **Uploads on Vercel** — With `VERCEL=1` and `BLOB_READ_WRITE_TOKEN`, DOCX bytes go to **private Vercel Blob**; `UploadedFile.storedPath` records `vercel-blob-path:…` and downloads use `/api/admin/uploaded-files/[id]/file`. Locally, files stay under `public/uploads/` when Blob is not used.
- **Admin devices** — When `DATABASE_URL` is set, registered devices live in **Postgres** (`AdminRegisteredDevice`); legacy `admin_devices.json` remains for DB-less dev. GitHub file commits **retry on 409** where used.

Binding editorial/security rules for contributors and agents: **`.cursor/rules/project.mdc`**.

Additional notes: **`LOADING_SYSTEM.md`** describes the public-shell loading/lazy pattern (aligned with `LoadingContext` / `LazyComponentWrapper`).

## Styling / Tailwind

Theme tokens live primarily in **`src/app/globals.css`** (CSS variables) and **`tailwind.config.js`** (maps utilities to those variables). Tailwind `content` globs include `src/app`, `src/components`, `src/lib`, `src/hooks`, and **`src/contexts`** so client providers are scanned.

## Community

- **Contributing**: see [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Code of conduct**: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **License**: [LICENSE](./LICENSE) (all rights reserved)

## Security and ops notes

- Security headers and rate limiting are configured for production-style deploys.
- Treat `.env` secrets as confidential; see `.env.example` for optional legacy admin JWT restore flag.
