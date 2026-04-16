# Loading system (public app)

## Overview

The public site uses a **client-side loading gate** so heavy client bundles (background, cursor, chat) do not compete with the first paint in an uncontrolled way. State lives in **`LoadingContext`**; lazy boundaries use **`LazyComponentWrapper`**.

This document reflects the **code in this repository** (`src/contexts/LoadingContext.tsx`, `src/components/shared/LazyComponentWrapper.tsx`, `src/hooks/useAppLoading.ts`). There is **no** separate `cache-manager` module — resource names and TTL-style behavior are implemented inside `LoadingContext`.

## Core pieces

1. **`LoadingProvider`** (`src/contexts/LoadingContext.tsx`)
   - Tracks initial vs component loading, progress text, and a **Set of loaded resource ids**.
   - Optionally hydrates from **`localStorage`** keys (`dr-niaraki-loaded-resources`, `dr-niaraki-cache-expiry`) with a **30-minute** window so repeat visits can skip the full loading screen when the cache is still valid.

2. **`LazyComponentWrapper`** (`src/components/shared/LazyComponentWrapper.tsx`)
   - `React.lazy` + `Suspense` with optional **IntersectionObserver** for lower-priority chunks.
   - Calls back into loading context when a lazy chunk finishes.

3. **`useAppLoading`** (`src/hooks/useAppLoading.ts`)
   - Orchestrates which lazy resources must report before hiding **`LoadingScreen`**.

4. **`LoadingScreen`** (`src/components/shared/LoadingScreen.tsx`)
   - Full-screen progress UI while `isInitialLoading` is true.

## Flow (simplified)

```
Root layout → PublicSiteContentProvider → LoadingProvider → AppLayoutContent
  → LoadingScreen (until resources marked loaded)
  → LazyComponentWrapper per heavy island (background, header, footer, chat, …)
```

## Usage

Wrap lazy roots in `LazyComponentWrapper` with a stable `resourceId` and call `onLoad` when the dynamic import resolves (see `src/app/AppLayoutContent.tsx`).

## Operational notes

- Clearing site data / `localStorage` resets the cached resource set.
- **Admin** routes and **API** handlers do not use this loading system; it is public-shell UX only.
