# Security policy

## Supported versions

Security-sensitive fixes are applied to the **default branch** of this repository as used for production deployment. There is no separate LTS line; upgrade by merging/rebasing onto the latest default branch.

## Reporting a vulnerability

**Do not** open a public GitHub issue for undisclosed security problems.

Please report suspected vulnerabilities to the **repository maintainers** using a private channel (e.g. email to the project owner or the institutional contact referenced in the site’s public **Contact** page). Include:

* A short description of the issue and its impact
* Steps to reproduce (or proof-of-concept), if safe to share
* Affected areas (public site, admin, API, upload pipeline, etc.)

We aim to acknowledge serious reports within a few business days. This is a best-effort academic/research project; timelines depend on maintainer availability.

## Scope notes

* **Secrets** (database URLs, `ADMIN_SECRET`, tokens) must never be committed. Use `.env` locally and your host’s secret manager in production.
* **Admin surface** is intentionally restricted (session + optional device registration). Reports about missing hardening on non-admin public pages may be accepted as low severity unless user data is exposed.

## Safe harbor

If you follow this policy and act in good faith, we will not pursue legal action for accidental, good-faith research that does not harm users or data.
