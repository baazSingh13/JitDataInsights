# JitDataInsights website

Company website for neural AI, brain-computer interface research, embedded systems, AI agents and FPGA accelerator IP. The FPGA section is an engineering preview: it does not offer an encrypted product download or claim completed commercial qualification.

The original dark visual identity, neural illustration and leadership profiles are retained. See [REVIEW.md](REVIEW.md) for corrections, evidence and remaining deployment work.

## Open the local copy

In a terminal in this directory, run:

```powershell
npm start
```

Open http://127.0.0.1:8765 in a browser. Stop the server with Ctrl+C. If that port is busy, set `$env:PORT='8766'` before starting it. Node.js 24.15 or later in the 24.x line is supported; the preview itself has no package dependencies.

You can also double-click `index.html` for a basic preview. An HTTP preview is preferred for testing the contact service. Google Fonts and the Firebase SDK need internet access; navigation and content remain available when those services fail. The form clearly reports an unavailable service.

## Check and build

```powershell
npm ci
npm run check
```

This checks JavaScript syntax, runs 13 DOM regression tests against a mock Firebase implementation, and builds `dist/`. Tests do not contact the live database. `npm ci` needs internet on its first run; later tests use the installed local dependencies. Supported test runtimes are Node 22.22.2+, 24.15+ or 26+ as specified in `package.json`.

`npm run build` regenerates only `dist/`, using an explicit list of 10 public assets. It excludes Git metadata, tests, dependency folders, internal review notes and the unused background image. Publish the contents of `dist/` to your chosen static host after reviewing the contact-service configuration. There is no automatic deployment command or workflow in this repository.

## Contact service

- The existing Firebase project configuration is retained in `script.js`.
- Firebase compat SDK 12.15.0 loads only when the contact section approaches the viewport.
- The submission schema remains `contacts/{generated-id}` with `name`, `email`, `message`, and a server `timestamp`.
- Inputs are labelled, required, trimmed and length-limited. A failed request preserves the draft. Offline requests are not intentionally queued. If connectivity drops during a write, the form remains locked until Firebase confirms success or failure, preventing accidental duplicates.
- SDK failure cannot submit form fields through native navigation. The no-JavaScript form is disabled.
- Success means Firestore acknowledged a write. It does **not** mean an email notification was sent; no email notification service was present in the original repository.

Client validation is not a substitute for server enforcement. Before publishing, verify the live Firestore rules reject public reads, listing, updates and deletes of contact messages; validate the create schema and server timestamp; and configure an appropriate abuse control such as Firebase App Check. Merge changes with existing rules for other collections. Live rules, App Check configuration, message delivery and retention settings were not inspected or deployed during this local review.

Firebase's browser configuration is intended to identify the project publicly. Do not add service-account keys, private keys, license files, trained weights or private IP packages to this site. See [Firebase API key guidance](https://firebase.google.com/docs/projects/api-keys) and the [Firebase security checklist](https://firebase.google.com/support/guides/security-checklist).

## Files

- `index.html`: company content, inquiry form and metadata.
- `style.css`, `neural_tech.css`: responsive layout and animation presentation.
- `script.js`, `neural_sync.js`: navigation, contact handling and bounded canvas animations.
- `assets/`: original images and the new SVG favicon.
- `tools/serve.cjs`, `tools/build.cjs`: local preview and public-file build.
- `tests/site.test.cjs`: regression tests.

## Rights

Copyright JitDataInsights. No new open-source license or rights to underlying accelerator designs are granted by this website review.
