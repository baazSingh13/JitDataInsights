# Website message delivery — 14 September 2026

The owner clarified that typed website messages must be emailed after selecting Send. Restored the inquiry form and pointed its HTTPS POST to FormSubmit for **workwithharpreetsingh@gmail.com**. Project and partnership links lead to this form; direct email remains a fallback. The native form works without JavaScript, preserves provider spam checks, includes a honeypot and discloses the relay to visitors.

Recipient activation and a confirmed inbox test are required before claiming live delivery. Setup and production-origin verification steps are in README.md. Earlier entries below are historical and are superseded by this contact flow.

Verification: the recipient was activated through the confirmation email. A fresh message submitted through the local website arrived in the intended Gmail inbox with its complete body and Reply-To header. Both JavaScript syntax checks and all 6 DOM tests passed; the 10-file build completed. The restored form was visually checked at 320px and 1440px without horizontal overflow. The existing GitHub Pages workflow was also corrected to build and upload only `dist/`.

---

# Direct email update — 14 September 2026

Replaced the Firebase inquiry form with direct email contact at **workwithharpreetsingh@gmail.com**, at the owner's request. The contact card displays a copyable address and an **Email Harpreet** link; project, FPGA integration and partnership buttons also open email drafts with relevant subjects. Sending remains an explicit action in the visitor's email service.

Removed the Firebase SDK loader, project configuration, form logic and unused form styling. Updated the documentation and existing regression suite for the current contact flow. Historical Firebase services and stored messages were not modified.

Verification: both JavaScript syntax checks and all 6 DOM tests passed; the build generated 10 public files. Browser inspection confirmed all 5 email links target the requested address, with no horizontal overflow at 320px and 1440px and no recorded browser warnings or errors. No test email was sent.

The earlier review below describes the original changes. Its Firebase form behavior and 13-test count are historical; the current suite has 6 tests. The earlier changes were merged in GitHub PR #1. Production hosting has not been verified.

---

# Website review — 13 September 2026

Source: https://github.com/baazSingh13/JitDataInsights

Baseline commit: `5484f2a`; local working branch: `codex/website-review`.

## Corrections

1. Fixed the mobile navigation layout, consistent 800px breakpoint, Escape handling, expanded state and keyboard focus. Desktop navigation no longer inherits an inline hidden state from mobile use. Native anchor links now retain URL fragments and browser history.
2. Made content visible without JavaScript or IntersectionObserver, added a skip link and visible focus rings, corrected heading hierarchy, and labelled form controls.
3. Replaced the misleading live-link/secure-link indicators with an explicitly conceptual illustration. Revised unsupported implant, rehabilitation, cognitive enhancement and performance claims into descriptions of research and engineering areas.
4. Added an FPGA accelerator inquiry section marked Engineering preview. It describes model families without exposing implementation files or implying encrypted customer IP has already been released.
5. Guarded the contact form before SDK initialization. Added loading/unavailable states, validation, accessible status announcements, preservation of failed drafts and duplicate-write prevention. Preserved the existing database collection and four-field schema. Error details are not shown to visitors.
6. Updated the pinned Firebase compat SDK from 9.6.1 to 12.15.0 and deferred loading until the contact section is near the viewport. Production Firebase delivery was not exercised.
7. Added animation controls and reduced-motion support. Canvas work pauses when the tab is hidden, and the neural illustration pauses offscreen. Bounded particle counts and device pixel ratio; fixed signal-array mutation while iterating and clipped tracks on narrow screens.
8. Fixed grid overflow and button wrapping on narrow screens, improved filled-button text contrast, added lazy image loading and dimensions, removed duplicate neural animation CSS, and corrected the JPEG asset previously named `.png`.
9. Added a favicon, social preview text and theme metadata. Updated the footer year and removed unsubstantiated security claims.
10. Replaced placeholder security and README content. Added reproducible checks and a build that includes only public files, plus a loopback preview server that does not serve Git metadata or owner notes.

## Verification

- JavaScript syntax checks passed for both client scripts.
- 13 DOM regression tests passed: navigation, focus, reduced motion, no-JavaScript defaults, missing observer fallback, asset/anchor checks, form validation, success, failure, offline behavior, pending-write duplicates and SDK failure. All submissions used a mock; tests cannot reach the live Firebase project.
- `npm run build` generated 10 public files in `dist/`.
- Dependency installation reported zero known vulnerabilities across 39 audited packages at the time of review.
- Browser checks at 320, 390, 768, 800, 801, 1024 and 1440 pixels found no horizontal overflow. Mobile menu, section links, animation pause, image loading and desktop/mobile form layouts were reviewed. The real Firebase SDK initialized to the ready state; no live messages were submitted. No browser errors or warnings were recorded during the updated-page review.
- Nine HTTP checks passed against the preview server, including rejection of Git metadata, owner notes, traversal attempts and POST requests.

## Remaining operational work at the original review (historical)

- Confirm Firestore rules, App Check/abuse controls, retention and the process for monitoring incoming inquiries. The repository did not contain those live settings; no production messages were sent.
- An acknowledged Firestore write does not send an email. Configure a notification workflow separately if required.
- Confirm company copy, roles and contact arrangements before publishing. Existing leadership names and titles were retained from the repository.
- Add a canonical URL and absolute social preview image once the production website URL is chosen.
- FPGA encrypted releases, target-board qualification and customer licensing remain separate work. No private accelerator source, weights, datasheets or architecture book have been added to the public website.

The original review was subsequently merged into main through PR #1. No manual production deployment or Firebase settings update was performed.
