# Base44 Dev Environment

## Project overview

Vite + React frontend that uses the `@base44/sdk` to talk to the Base44 cloud
backend (`https://base44.app`).  There is no local backend — all API calls go
through the SDK, which makes same-origin `/api` requests that the Vite dev
server proxies to Base44.

## Setup quirks

- **Merge conflicts were resolved in `package.json` and `package-lock.json`.**
  The HEAD branch had `"type": "commonjs"` and only `@base44/sdk`; the other
  branch had the full React stack.  The resolution uses `"type": "module"` (Vite
  requires ESM) and merges all dependencies from both sides, plus several
  packages that were installed in `node_modules` but missing from the manifest
  (`@tanstack/react-query`, `@radix-ui/*`, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `lucide-react`, `input-otp`).
- **`index.html` was the vanilla-JS entry point** (`<script src="app.js">`).
  It has been replaced with the Vite/React entry point (`<div id="root">` +
  `/src/main.jsx`).  The old `app.js` and `style.css` are still in the repo but
  are no longer loaded.
- **`package-lock.json` had merge conflicts and was deleted.**  `npm install`
  regenerates it on first container start.

## How the dev server is configured

The `@base44/vite-plugin` has a "sandbox mode" triggered by `MODAL_SANDBOX_ID`.
In sandbox mode it binds `0.0.0.0:5173`, sets `allowedHosts: true`, enables
polling-based file watching, and configures HMR.  It does **not** set up the
`/api` proxy (the Base44 platform handles that elsewhere), so `vite.config.js`
adds the proxy conditionally when `BASE44_PREVIEW_MODE === '1'`.

## Running locally

```sh
docker compose -f docker-compose.base44.yml up -d
```

The app is served on port 3000 (mapped to Vite's 5173 inside the container).
No external secrets are required — the app ID is public and the Base44 backend
URL is `https://base44.app`.

## Verifying it works

```sh
curl -s http://localhost:3000/ | head -5   # should return the Vite HTML shell
docker compose -f docker-compose.base44.yml logs web   # check for errors
```
