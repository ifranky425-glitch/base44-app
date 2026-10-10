import { setTimeout } from 'node:timers/promises';

const { BASE44_BACKEND_URL, VITE_BASE44_APP_ID } = process.env;
if (!BASE44_BACKEND_URL || !VITE_BASE44_APP_ID) {
  console.error('Backend readiness requires BASE44_BACKEND_URL and VITE_BASE44_APP_ID.');
  process.exit(1);
}

const endpoint = new URL(
  `/api/apps/${encodeURIComponent(VITE_BASE44_APP_ID)}/entities/stages`,
  BASE44_BACKEND_URL,
);
const deadline = Date.now() + 120_000;

while (Date.now() < deadline) {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
    if (response.ok && Array.isArray(await response.json())) {
      console.log('Local backend ready; starting frontend.');
      process.exit(0);
    }
  } catch {
    // The backend may still be starting. Keep the frontend offline until ready.
  }
  await setTimeout(250);
}

console.error('Local backend did not become ready within two minutes.');
process.exit(1);
