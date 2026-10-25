# Flow Reader

An offline-first reading PWA for desktop, tablet, and mobile browsers. Flow offers one-word-at-a-time reading (RSVP), bold beginnings, and classic text, with a local library, bookmarks, and backup files.

## Run the project

Requires Node.js 22 or later. There are no third-party runtime or build dependencies and no package installation step.

```sh
npm run build
npm test
npm start
```

Open the printed localhost address. Edit files in `src/`, then rebuild. Do not edit `dist/` directly. Service worker updates appear in an update banner; select **Update now** after changes are saved. The production version requires HTTPS; localhost is supported for development. Opening `index.html` via a file URL is not supported.

## Structure

- `src/core.js`: pure reading, timing, Unicode segmentation, validation, and backup merging.
- `src/storage.js`: versioned IndexedDB transactions.
- `src/app.js`: interface, library, reading controls, installation and updates.
- `src/styles.css`, `src/index.html`: responsive interface.
- `src/sw.js`: app-shell caching and offline navigation.
- `src/manifest.webmanifest`, `src/icons/`: PWA installation assets.
- `scripts/build.mjs`: reproducible static build; fingerprints JS/CSS to prevent mixed-version caches.
- `scripts/serve.mjs`: local preview server, bound to loopback.
- `tests/`: Node tests for reading behavior, backup handling and packaged assets.
- `.github/workflows/check.yml`: CI checks if the project is hosted on GitHub.
- `dist/`: generated deployable site; no server backend required.
- `.openai/hosting.json`: the existing private Sites deployment identity.

## Data and privacy

Text, titles, bookmarks, progress and settings are stored in IndexedDB on the device. No text is uploaded, no third-party analytics is included, and no cloud account is needed by the application itself. The current private hosting platform has its own sign-in gate; this is separate from Flow data storage.

A browser tab and an installed app can have separate storage. Export and restore a backup to move a library. Browser clearing, eviction, device loss, and uninstalling can remove local data. **Protect local storage** asks for persistent browser storage where supported, but it is not a backup. Backup files are plain JSON, not encrypted; store them appropriately.

Legacy `flow-text` saved by the prototype is migrated only after the new library saves successfully. Invalid stored data is not overwritten; a recovery export is offered. With Web Locks support, a second tab asks the user to close the first tab before editing, preventing conflicting library writes. On browsers without Web Locks, use one editing tab at a time.

Text edits reset word positions and bookmarks. Normal reading retains the current word; Classic and Bold beginnings show the full document. Saves are indicated on screen. During playback, progress is checkpointed approximately every two seconds and flushed when paused or hidden. Sudden process termination can lose the most recent unsaved changes.

Backups use a versioned format. Imports validate all documents before merging, preserve existing edits, clone conflicting versions and deduplicate identical text/title readings. Import does not replace the current app settings, even though the export includes them for future compatibility. Limits: 20 MB of serialized library data, 500 readings, 1 million characters per reading, 1,000 bookmarks per reading, 25 MB per backup upload. Imports are intended for ordinary text, not PDF/EPUB files.

## Offline and updates

The service worker caches only explicitly listed app files. It does not cache authentication endpoints, arbitrary URLs, third-party responses, or user documents. Documents are in IndexedDB. Redirected responses, failed responses, and incorrect app-shell/MIME responses are rejected during cache installation.

Home navigation tries the network first so online hosting access checks remain in force. If the network request fails, the cached shell opens. Existing locally saved documents remain available offline, independently of a hosting session. HTTP errors or sign-in redirects are not disguised as offline availability.

The **Ready offline** indicator is shown only after the controller confirms that every required asset is cached. Visit each installed app online once before taking it offline. Updates wait for user action and save the library before activation; the previous cache is retained for recovery while older caches are removed. Each build fingerprints JS/CSS assets to keep offline versions consistent.

## Installation

Open the deployed site in an ordinary browser and sign in to the private site if asked.

- iPhone/iPad: Safari → Share → Add to Home Screen; use Open as Web App when offered.
- macOS: Safari → File → Add to Dock.
- Chrome/Edge: browser installation menu or installation icon, where available.

The **Install app** button invokes a browser installation prompt where supported and otherwise shows platform instructions. This project produces a PWA, not App Store binaries. No native Apple or Android project is included.

## Release checks

Run the automated checks, then verify on the target browsers:

1. Import and edit a reading; wait for Saved on device; reload and resume.
2. Change settings and add bookmarks; verify after restart.
3. Export a library, import it into a separate profile, and compare content/positions/bookmarks.
4. Restore an invalid backup; the existing library must remain unchanged.
5. Visit online until Ready offline; disconnect and reopen the root URL, then read and edit.
6. Install and repeat the previous check inside the installed application on iPhone, iPad and Mac.
7. Publish a new version, accept the update banner, and confirm library preservation.
8. Verify keyboard use, focus mode, readable text and touch controls on narrow screens.
9. Verify private hosting sign-in and service-worker MIME/scope support on the deployed origin.

Automated coverage and local browser verification do not replace physical-device installation checks. Distribution uses the existing private Sites project. The static `dist/` directory is also portable to a different HTTPS host, subject to the chosen access policy.
