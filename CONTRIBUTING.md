# Contributing

This repository is the **Next.js 15 (App Router)** site for **Dr. Abolghasem Sadeghi-Niaraki**, with a **Prisma-backed** editorial workflow (draft, publish, restore, DOCX import/review/merge). Treat it as production software: small, reviewable changes, tests where practical, and no drive-by refactors.

## Before you start

1. Read **README.md** (setup, scripts, architecture).
2. Read **`.cursor/rules/project.mdc`** (or the same content in-repo) for non-negotiables: DB-first public reads with canonical fallback, admin auth/session/device rules, upload/import authority.
3. Match existing **TypeScript strict** style and **Zod** content schemas in `src/content/`.

## Local development

```bash
npm install
cp .env.example .env   # configure DATABASE_URL and admin secrets as needed
npx prisma migrate dev
npm run dev
```

Quality gates used in CI-style workflows:

```bash
npm run type-check
npm run lint
npm run test:run
npm run build
```

## Change guidelines

* **Public behavior & visuals**: avoid unintended UX or copy changes unless agreed.
* **Content model**: updates to `SiteContent` require `src/content/schema.ts`, seeds under `src/content/seed/`, and passing `src/tests/siteContent.test.ts`.
* **Admin / APIs**: preserve sessiaon, device, and upload semantics documented in `project.mdc`.
* **Admin content page UI**: prefer adding focused components under `src/app/admin/content/workflow/` and keeping `workflowSections.tsx` as a thin composer.
* **Admin CV upload UI**: keep `src/app/admin/upload/page.tsx` thin; add pieces under `src/app/admin/upload/components/` or `hooks/` instead of growing a single mega-file.
* **Parser / imports**: conservative changes only; extend tests in `src/tests/` when behavior shifts.

## Pull requests

* One logical change per PR when possible.
* Describe **what** changed and **why**; link issues if applicable.
* Note any **env**, **migration**, or **content publish** steps for operators.

See `.github/pull_request_template.md` for the checklist used in this repo.
