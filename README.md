# JitDataInsights website

Company website for neural AI, brain-computer interface research, embedded systems, AI agents and FPGA accelerator IP. The FPGA section is an engineering preview: it does not offer an encrypted product download or claim completed commercial qualification.

The original dark visual identity, neural illustration and leadership profiles are retained. See [REVIEW.md](REVIEW.md) for corrections, evidence and remaining deployment work.

## Open the local copy

In a terminal in this directory, run:

```powershell
npm start
```

Open http://127.0.0.1:8765 in a browser. Stop the server with Ctrl+C. If that port is busy, set `$env:PORT='8766'` before starting it. Node.js 24.15 or later in the 24.x line is supported; the preview itself has no package dependencies.

You can also double-click `index.html` for a basic preview. Google Fonts uses internet access; navigation, content and email links work without JavaScript or a contact backend. Sending email requires an email service and internet access.

## Check and build

```powershell
npm ci
npm run check
```

This checks JavaScript syntax, runs 6 DOM regression tests for navigation, accessibility fallbacks and direct email links, and builds `dist/`. Tests do not send email or make external requests. `npm ci` needs internet on its first run; later tests use the installed local dependencies. Supported test runtimes are Node 22.22.2+, 24.15+ or 26+ as specified in `package.json`.

`npm run build` regenerates only `dist/`, using an explicit list of 10 public assets. It excludes Git metadata, tests, dependency folders, internal review notes and the unused background image. Publish the contents of `dist/` to your chosen static host. There is no automatic deployment command or workflow in this repository.

## Direct email contact

Visitors can contact Harpreet at **workwithharpreetsingh@gmail.com**. The project, FPGA integration and partnership buttons use `mailto:` links with a relevant subject. The contact section shows the full address for copying and an **Email Harpreet** button.

These links open the visitor's configured email app. Visitors compose and send the email themselves; if no email app is configured, they can copy the address into Gmail or another email service. Contact links work without JavaScript.

The website no longer loads Firebase or writes inquiry data to a database. The previous Firebase project and any stored messages have not been changed or deleted.

Do not add service-account keys, private keys, license files, trained weights or private IP packages to this site.

## Files

- `index.html`: company content, direct email links and metadata.
- `style.css`, `neural_tech.css`: responsive layout and animation presentation.
- `script.js`, `neural_sync.js`: navigation and bounded canvas animations.
- `assets/`: original images and the new SVG favicon.
- `tools/serve.cjs`, `tools/build.cjs`: local preview and public-file build.
- `tests/site.test.cjs`: regression tests.

## Rights

Copyright JitDataInsights. No new open-source license or rights to underlying accelerator designs are granted by this website review.
