# Base44 development and backend notes

## Runtime and data

- Port 3000 serves the cloned React source through Vite, not `dist/`. `app.js` and `style.css` are legacy files and are not loaded by `index.html`.
- `docker-compose.base44.yml` runs Vite and `base44 dev -p 3100` in the same container: the local backend binds loopback only. Do not split them into separate containers without addressing that bind behavior.
- The frontend SDK uses same-origin `/api` requests. In preview, `vite.config.js` forwards them to `BASE44_BACKEND_URL=http://localhost:3100`. This is a local development backend, NOT a production deployment.
- Local entity records and hosted entity records are separate. **`base44 dev` 0.1.32 stores entity data ONLY IN MEMORY.** Stopping/recreating the server or changing an entity schema clears its records. A Docker volume does not make these records durable. Before any restart, export existing entity records to a protected temporary file without logging their contents and restore them afterward; never claim restart persistence from an HTTP read alone.
- The preview uses the three original stages: `Stage 1: Internal Assessment & Reflection`, `Stage 2: Mediated Indirect Outreach`, and `Stage 3: Controlled Direct Communication`, in that order. Restore these only when the stage list is empty; do not duplicate existing stages. Do not migrate reflections to the cloud without a specific request.
- On 2026-10-10, recreating the local server cleared its three stages and two existing local reflection records before the in-memory limitation was discovered. The stages were restored, but those prior reflection records were not exported and could not be recovered. This backend is suitable for temporary preview testing, not durable reflection storage.
- The CLI reads device-login credentials from `/root/.base44`, bind-mounted from `${BASE44_AUTH_DIR:-/root/.base44}`. Never print its auth file or tokens. `base44/.app.jsonc` is gitignored; a fresh checkout must link the same public app ID used in Compose before starting the backend.

## Hosted deployment limitation

- Device sign-in is confirmed. CLI 0.1.32 successfully pushes `reflections`, `stages`, and `users` via `base44 --app-id <app-id> entities push -y`.
- Despite successful schema pushes (and an earlier successful `deploy --no-build`), the hosted entity endpoints return HTTP 403 with `extra_data.reason: not_deployed`. CLI success alone does NOT prove deployment; check the actual entity endpoints.
- Do not repeatedly run the same no-build deployment or switch the preview to the hosted API while this platform-side availability failure persists. Do not change visibility/authentication to get around it. No verified production URL exists.

## Preview-only settings

- Compose passes through `BASE44_PREVIEW_MODE` from the platform; never hardcode it to `1`. The shared Vite proxy override applies ONLY when the value is exactly `"1"`. Unset or any other value preserves the original non-preview config.
- `MODAL_SANDBOX_ID` is a Compose-only compatibility trigger for `@base44/vite-plugin`'s existing sandbox binding, polling, and HMR behavior. That plugin does not supply the API proxy, so the explicit preview-only proxy is required.
- The dependency lockfile exists; use `npm ci` on container startup to preserve it. Install only inside the runtime container, not on the host.

## Verification

```sh
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -fsS http://localhost:3000/
curl -fsS http://localhost:3000/api/apps/6ac2a2c658b71f654f65e2f3/entities/stages
curl -fsS http://localhost:3000/api/apps/6ac2a2c658b71f654f65e2f3/entities/reflections
```

Verify the real UI: stages must populate, selecting a stage and submitting a reflection must create a record that survives a fresh read, and only the test record should be removed afterward. Avoid exposing the contents of existing reflections in logs. An expected signed-out auth response is not an entity-load failure.
