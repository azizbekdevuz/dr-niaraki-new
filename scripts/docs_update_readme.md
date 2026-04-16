# Legacy admin docx script note

The file previously at this path described an **older** admin flow (JWT-only auth, JSON `details.json` commits as the primary path, different repository slug).

## Current source of truth

For **this** repository (`dr-niaraki-new`):

| Topic | Where to read |
|--------|----------------|
| Stack, scripts, architecture | **README.md** (root) |
| Editorial rules (DB, import, publish, devices) | **`.cursor/rules/project.mdc`** |
| Admin HTTP client shapes | **`src/lib/adminContentWorkflowClient.ts`** |
| Public read orchestration | **`src/server/content/publicSiteContent.ts`** |
| Env examples | **`.env.example`** |

DOCX import, review, merge, and publish are **Prisma-first**; GitHub JSON confirm remains a **labeled legacy branch** where still wired (see `project.mdc`).

Do not follow JWT-only or “commit details.json only” instructions from old copies of this file.
