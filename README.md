# JitDataInsights website

Company website for neural AI, brain-computer interface research, embedded systems, AI agents and FPGA accelerator IP. The FPGA section is an engineering preview: it does not offer an encrypted product download or claim completed commercial qualification.

The original dark visual identity, neural illustration and leadership profiles are retained. See [REVIEW.md](REVIEW.md) for corrections, evidence and remaining deployment work.

## Open the local copy

In a terminal in this directory, run:

```powershell
npm start
```

Open http://127.0.0.1:8765 in a browser. Stop the server with Ctrl+C. If that port is busy, set `$env:PORT='8766'` before starting it. Node.js 24.15 or later in the 24.x line is supported; the preview itself has no package dependencies.

You can also double-click `index.html` for a basic preview. Google Fonts uses internet access; navigation and content work without JavaScript. Preview the contact form over HTTP with `npm start`; its email relay requires internet access and recipient activation.

## Check and build

```powershell
npm ci
npm run check
```

This checks JavaScript syntax, runs 6 DOM regression tests for navigation, accessibility fallbacks and the email form, and builds `dist/`. Tests do not send email or make external requests. `npm ci` needs internet on its first run; later tests use the installed local dependencies. Supported test runtimes are Node 22.22.2+, 24.15+ or 26+ as specified in `package.json`.

`npm run build` regenerates only `dist/`, using an explicit list of 10 public assets. It excludes Git metadata, tests, dependency folders, internal review notes and the unused background image. The existing GitHub Pages workflow now builds and publishes `dist/` when `main` changes. The public site is https://baazsingh13.github.io/JitDataInsights/.

## Website messages delivered by email

Visitors type their name, email address and message, then select **Send Message**. The form posts over HTTPS to FormSubmit, which relays the inquiry to **workwithharpreetsingh@gmail.com**. The visitor does not need to open their email app. Project, FPGA integration and partnership buttons lead to the form. A direct email link remains as an alternative.

The form uses native browser validation and works without JavaScript. FormSubmit handles the spam check and submission confirmation on its page. Its default reCAPTCHA remains enabled and an additional honeypot is included. There are no CC recipients or automatic replies to visitors. The visitor's `email` field supplies Reply-To so Harpreet can reply from his inbox.

### Activate delivery once

The receiving address was activated on 14 September 2026, and a message submitted through the local website was confirmed in the destination inbox, including its full body and Reply-To header. The steps below are retained for future setup or a new website origin.

1. Open the website through its deployed URL or `npm start` (not a `file://` URL).
2. Submit one clearly labelled setup message and complete the provider's spam check if shown.
3. In **workwithharpreetsingh@gmail.com**, open FormSubmit's confirmation email and activate the form. Check Spam if needed. Treat an activation request as setup, not proof that a message was delivered.
4. Submit a fresh test message after activation and verify that its full body reaches the inbox. Use the final deployed origin for the production check; if FormSubmit requests confirmation there too, complete it.

No Gmail password, app password or private API key belongs in this repository. The form displays a disclosure that contact details pass through FormSubmit. Its documentation states that submissions are retained for 30 days. Historical Firebase services and stored messages were not modified.

Provider references: [setup](https://formsubmit.co/) and [fields, spam controls and retention](https://formsubmit.co/documentation).

Do not add service-account keys, private keys, license files, trained weights or private IP packages to this site.

## Files

- `index.html`: company content, email inquiry form and metadata.
- `style.css`, `neural_tech.css`: responsive layout and animation presentation.
- `script.js`, `neural_sync.js`: navigation and bounded canvas animations.
- `assets/`: original images and the new SVG favicon.
- `tools/serve.cjs`, `tools/build.cjs`: local preview and public-file build.
- `tests/site.test.cjs`: regression tests.

## Rights

Copyright JitDataInsights. No new open-source license or rights to underlying accelerator designs are granted by this website review.
