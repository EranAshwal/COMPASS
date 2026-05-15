# Compass PWA — hosting & install guide

Compass v1.0 — formerly Cadence. Same clinical app, new identity: institutional letter-spaced wordmark with a 4-point compass rose embedded as the "O", and the PWA wrapper for installable / offline use.

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The Compass app (v1.0 of the single-file build). |
| `manifest.webmanifest` | App name, icon, colours — tells the phone how to install Compass. |
| `service-worker.js` | Caches the app on first visit so it works offline and launches instantly. |
| `icon-192.png` / `icon-512.png` | Standard PWA icons (Android, Chrome). |
| `icon-192-maskable.png` / `icon-512-maskable.png` | Android adaptive-icon variants. |
| `icon-180.png` | iOS home-screen icon. |
| `favicon-32.png` | Browser tab icon — outer ring dropped at this size for legibility. |

## Step 1 — Host the folder (one-time, ~5 minutes)

PWAs require HTTPS; they can't run from a local file path. The easiest free option:

### Option A — Netlify Drop (no account required)

1. Go to https://app.netlify.com/drop
2. Drag this entire `compass-pwa` folder into the page.
3. Netlify gives you a URL like `https://random-words-12345.netlify.app`.
4. Open that URL — Compass is live.

Optional: create a free Netlify account afterwards to claim the site and rename it (e.g. `compass-mfm.netlify.app`). Future updates: drag the updated folder back onto the same site.

### Option B — Cloudflare Pages or GitHub Pages

Both also free, both work the same way. Cloudflare Pages: https://pages.cloudflare.com → "Direct Upload". GitHub Pages: push the folder to a repo, enable Pages in Settings.

## Step 2 — Install on your phone

Open the Netlify URL on your phone, then:

**iPhone (Safari):**
1. Tap the Share button (square with arrow).
2. Scroll down → "Add to Home Screen".
3. Confirm. The Compass rose icon appears on your home screen.
4. Tap it — Compass opens full-screen, no Safari chrome.

**Android (Chrome):**
1. Chrome usually shows an "Install app" banner automatically. Tap it.
2. If not: tap the ⋮ menu → "Install app" or "Add to Home screen".
3. Compass is now in your app drawer like any other installed app.

## Offline behaviour

After the first launch the service worker caches the entire app. From then on:
- The app opens instantly, even on airplane mode.
- In a scan room with no Wi-Fi: still works.
- When you're back online: the service worker silently checks for a new version.

## Updating Compass to a new release

When you have a new build (say v1.1):

1. Replace `index.html` in this folder with the new file.
2. Open `service-worker.js` and change the line:
   ```js
   const CACHE_VERSION = 'compass-v1.0';
   ```
   to:
   ```js
   const CACHE_VERSION = 'compass-v1.1';
   ```
3. Re-deploy the folder (drag-and-drop onto Netlify again, or `git push`).
4. Next time you open Compass on your phone, it fetches the new version and the new version activates on the launch after that.

## If you already had Cadence installed

The service worker uses a new cache key (`compass-v1.0` instead of `cadence-v0.18`), so any device already running the old Cadence build will:

1. On next launch with internet: detect the new service worker, install it, and on the *next* launch after that, switch over. The old `cadence-v0.18` cache is automatically deleted during the activation step.
2. The home-screen icon will change from the maroon W-waveform to the maroon compass rose automatically — no need to re-install.

If you redeployed to the **same** Netlify URL, anyone already on the old version transitions seamlessly. If you used a **new** URL, the old URL still works (it'll keep serving the cached Cadence build offline) but won't get updates — you'll want to share the new URL with the team and have them re-add to home screen.

## What changed in v1.0

- **Wordmark**: `Cadence` (two-tone split serif) → `C [compass rose] M P A S S` (letter-spaced institutional serif with the rose as the O).
- **Icon**: maroon W-waveform mark → maroon 4-point compass rose with gold centre dot.
- **CSS**: legacy `.cad` / `.ence` classes removed; new `.rose-slot` class for the inline compass rose.
- **JS test exports**: `window.Cadence_*_TESTS` → `window.Compass_*_TESTS` (six functions: `Compass_TESTS`, `Compass_CSP_TESTS`, `Compass_LHR_TESTS`, `Compass_BOWEL_TESTS`, `Compass_ORBIT_TESTS`, `Compass_CC_TESTS`). If you have console snippets saved that called the old names, update them.
- **Brand palette**: unchanged. Same McMaster maroon (#7A003C), same gold (#FDBF57), same ink + ivory.
- **Calculator logic**: unchanged. Every nomogram, formula, percentile band, and reference is byte-identical to v0.18.

## Notes

- The single-file architecture is preserved: all clinical logic, nomograms, and references remain inside `index.html`. The PWA layer is purely a thin wrapper for installability and offline caching.
- The fonts (Fraunces, Manrope, JetBrains Mono) load from Google Fonts. They get cached by the browser on first visit and work offline thereafter.
- If you ever want to *remove* the PWA, uninstall the home-screen app and clear site data in your browser settings.
