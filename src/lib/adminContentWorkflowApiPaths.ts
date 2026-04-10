/**
 * Relative paths for `/api/admin/content/*` workflow endpoints.
 * Admin UI may `fetch(path, { credentials: 'include' })` once wired; cookies carry session + device.
 */
export const adminContentWorkflowApiPaths = {
  draft: '/api/admin/content/draft',
  draftBootstrap: '/api/admin/content/draft/bootstrap',
  publish: '/api/admin/content/publish',
  versions: '/api/admin/content/versions',
  version: (id: string) => `/api/admin/content/versions/${encodeURIComponent(id)}`,
  versionRestore: (id: string) =>
    `/api/admin/content/versions/${encodeURIComponent(id)}/restore`,
} as const;
