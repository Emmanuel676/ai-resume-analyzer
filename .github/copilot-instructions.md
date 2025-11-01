### Project overview

This is a React + React Router single-repo app (Vite) using the React Router templates. It is a small client-heavy app that integrates with an external browser SDK (Puter) for auth, filesystem, AI, and KV storage.

Key files/directories:
- `app/root.tsx` - top-level layout, injects the Puter client script: <script src="https://js.puter.com/v2/"></script>
- `app/lib/puter.ts` - Zustand-based wrapper around the global `window.puter` API. Most Puter interactions (auth, fs, ai, kv) are proxied here.
- `app/routes/*.tsx` - page routes (home, auth, etc.) using React Router conventions. `home.tsx` demonstrates bootstrapping Puter on the client via `usePuterStore().init()`.
- `app/components/*` - presentational components (Navbar, ResumeCard, ScoreCircle).
- `constants/index.tsx` - data fixtures and AI prompt format helpers (see `prepareInstructions` and `AIResponseFormat`).
- `public/` - static assets (images, resumes).
- `package.json` - scripts use `react-router dev|build|serve` (Vite + React Router tooling).

What an AI coding agent should know (concise):

- The project depends on a browser global `window.puter` SDK loaded in `root.tsx`. Most runtime behavior relies on this object. Always guard access with the helpers in `app/lib/puter.ts` (getPuter / usePuterStore) and follow the patterns used there (init poll, 10s timeout, set errors on the store).

- Authentication flows are client-side via Puter. The store exposes `auth.checkAuthStatus()`, `auth.signIn()`, and `auth.signOut()`. Pages typically call `init()` on mount and then redirect to `/auth` when `auth.isAuthenticated` is false (see `app/routes/home.tsx`).

- AI interactions are performed through `usePuterStore().ai.chat` and `prepareInstructions()` in `constants/index.tsx`. The project expects the agent output to be strict JSON following `AIResponseFormat` when generating feedback for resumes.

- File operations (upload/read/write) and simple KV storage also go through `usePuterStore().fs` and `usePuterStore().kv`. Error handling pattern: store `error` string and `isLoading` boolean in the Puter store; maintain nullability (return undefined or null when Puter is absent).

Developer workflows and commands:

- Install dependencies: `npm install`
- Dev server (HMR): `npm run dev` (the dev script maps to `react-router dev`, it serves the app on Vite default port e.g. 5173)
- Build: `npm run build`
- Preview/serve built SSR: `npm run start` (runs `react-router-serve ./build/server/index.js`)

Conventions & patterns specific to this repo:

- Path alias: `~/*` maps to `./app/*` in `tsconfig.json`. Use `~/components/*` or `~/lib/*` imports for app source.
- Zustand is used for global Puter state via `usePuterStore`. Follow the setter/getter pattern already in `app/lib/puter.ts` when adding new methods.
- Defensive Puter checks: code checks for `getPuter()` and calls `setError('Puter.js not available')` in many places. Preserve this behavior when refactoring.
- The app expects Puter to be loaded from the CDN at runtime. Local unit tests and server-side rendering must not assume `window.puter` exists (guard with typeof window !== 'undefined').

Integration points and external dependencies:

- Puter SDK: loaded from `https://js.puter.com/v2/` in `root.tsx`. It provides `auth`, `fs`, `ai`, and `kv` namespaces on `window.puter`.
- PDF handling uses `pdfjs-dist` for any client-side PDF parsing (present as dependency).
- `zustand` for state. `react-router` (v7) for routing and server/client rendering.

Examples and quick edits an agent can make safely:

- Add a new Puter helper: mirror the style in `app/lib/puter.ts` (guard with getPuter, set errors, update store shape). Example: to add `kv.flush()` wrapper, create a `flushKV` async function that calls `puter.kv.flush()` and returns boolean or undefined.
- Fix route redirects: when guarding pages, ensure `init()` is called in a client-only effect then check `auth.isAuthenticated` before rendering; look at `app/routes/home.tsx` for the expected pattern.

Files to check when editing behavior:
- `app/lib/puter.ts` (single source of truth for Puter usage)
- `app/root.tsx` (injected Puter script)
- any `app/routes/*.tsx` that use `usePuterStore()` (auth guard patterns)
- `constants/index.tsx` for AI prompt formats and examples

Quick troubleshooting tips for agents:

- If a runtime bug mentions `puter` undefined: verify `root.tsx` includes the CDN script and that `init()` is called in a client effect. Add defensive guards if the code assumes Puter exists on server.
- If TypeScript errors appear around path aliases, open `tsconfig.json` and confirm `paths` contains `~/*: ['./app/*']` and that `vite` is configured via `vite-tsconfig-paths` (already in devDependencies).

If you change runtime code that calls Puter, add/adjust a small unit test or a smoke route that can be manually exercised in dev mode since Puter is a runtime browser SDK.

If anything in this doc is unclear, tell me which section to expand (auth, Puter methods, AI prompt format examples, or common fixes) and I will iterate.
