# Validation

## Free learning and optional support — 8 October 2026

All published courses are presented as free, including existing records with stored future prices. Free enrollment checks the current account and published status transactionally and is idempotent. Course payments are blocked by the API, legacy checkout links return to the course, and unenrolled learners receive the free enrollment page. Donations do not affect access or certificates; no donation destination is configured yet. The support page accepts an optional HTTPS DONATION_URL. Paid-provider code remains for a future reviewed commercial release.

Production Webpack build, TypeScript, ESLint and 29 unit/business tests passed. Tests cover free enrollment, repeat enrollment, unpaid access after enrollment, draft and suspended-account rejection, and preserved payment logic using explicitly priced test fixtures.

## Dashboard, profile and administration — 8 October 2026

- Ordinary sign-in and the signed-in homepage open `/dashboard`. Protected course destinations survive login, signup, password recovery and email-verification links. Return paths are restricted to known local pages.
- The profile now has a cover, initials avatar, editable biography, learning collection, activity and certificates. It uses real account records and has no image-upload control.
- The admin overview failure was traced to missing Firestore aggregation indexes. Missing-index errors use equivalent streamed calculations; unrelated failures still surface. Index definitions are included for deployment, but the current service account cannot create indexes.
- All 27 unit/business tests and ESLint passed. The production Webpack build compiled and passed TypeScript; the earlier Turbopack attempt encountered disk exhaustion. The resulting production server passed all 12 browser tests on 8 October.
- A read-only signed-in check with the verified owner's temporary session confirmed homepage/dashboard redirects, course return, profile editing controls and tabs, responsive layout at 375 and 768 pixels, and real admin overview data. No profile, course or payment records were changed. Screenshots were inspected locally and are excluded from Git.
- AI feedback and profile-photo uploads remain disabled. Public Vercel deployment and production email-domain configuration remain outstanding.

## Email-link recovery and branding — 6 October 2026

The default Firebase action hostname resolved in DNS but its page request timed out from this computer. This establishes a local reachability failure, not an outage affecting every user. The user-supplied verification code was checked for VERIFY_EMAIL and the intended owner address, then applied successfully through the Firebase client API. The owner's prepared grant was consumed and the account now has ADMIN access; no email-verification flag was manually overridden.

The project display name was already LibTech. The web app was renamed from LibTechWeb to LibTech, and sender display names for verification, password-reset and email-change emails were saved as LibTech. Firebase rejected a batch subject customization, so default subjects using the app-name placeholder were retained. Internal IDs and hostnames remain unchanged.

Added an in-app recovery path for pasting a Firebase email link. Only supported actions from the configured Firebase origin or this site are accepted; codes are validated by Firebase. Invalid/used codes and network errors have distinct recovery messages. Configure the public action URL after Vercel deployment as documented in LAUNCH.md; no localhost URL was placed in the shared email template.

Production build, TypeScript, ESLint and all 24 unit/business tests passed after these changes. All five authentication browser tests passed, including local email-link completion and used-code recovery. Firebase confirmed the owner email is verified, the profile role is ADMIN, and the pending grant has been consumed. The owner's actual password-based browser session remains for the owner to complete; the automated browser tests use intercepted Firebase responses.

## Beginner guide and account recovery — 6 October 2026

- Expanded the existing course into 19 detailed lessons across six modules, with 66 activities, a capstone and ten required final-assessment questions. The estimated six hours includes practice. All reference answers pass their graders, incorrect choice options fail, and the content validates within the 300 KB limit.
- Published revision 2 to Firestore after transactionally confirming there were no enrollments, progress records or certificates. Revision 1 is retained in `courseRevisions`; the existing price and owner were preserved.
- Login now accepts existing shorter passwords, preserves entered fields after failure, and shows actionable Firebase error messages. Signup retains its successful-account state if verification email delivery fails. Verification can be resent and refreshed within the form.
- The requested owner Firebase account exists and email/password authentication is enabled. Its email was unverified at the check. A grant tied to that UID and email is prepared; it activates only during verified server-side sign-in. No verification bypass or default administrator password was added.
- 22 business, curriculum and account tests passed. Production build (including TypeScript) and ESLint passed. Four existing production browser checks passed; all three new authentication browser checks passed after correcting test selectors and the token-response fixture. Authentication tests intercept Firebase responses to cover short-password login, verification refresh, email-delivery failure and duplicate signup without writing dummy Firebase accounts or sending emails.
- The expanded public course page was checked in Chrome. The production site was restarted on port 3000. Actual owner email delivery, verification and the subsequent authenticated browser session still require the owner to follow the email link and sign in.

Earlier sections below are historical results, including superseded course counts and owner-access status.

## Production cleanup — 2 October 2026

Demo authentication, demo accounts, demo banners, the local database and the runtime filesystem adapter were removed. Test fixtures now live only under `tests/fixtures`. Firebase has no `demo-admin` or `demo-student` user documents. Published course details and prices on the homepage now come from Firestore rather than fixed promotional data.

The 17 business tests, TypeScript build and ESLint passed after cleanup. Four production browser smoke tests passed: public/live course pages, removed demo access and private API denial, responsive layouts, and motion preferences. Those smoke tests performed no account, payment or learning-record writes. A signed-out admin rendering error found during these checks was corrected with an explicit page-level login/role guard.

The browser Firebase configuration endpoint returned HTTP 200; an anonymous request to a private Firestore user path returned HTTP 403. Authentication/Firestore server access is working. No administrator has been assigned; payment submissions remain disabled.

Public business details and refund/data-retention wording are configured for Michael Khan and LibTech, using libtech1393@gmail.com for support. The public-launch preflight still requires a public HTTPS origin. The requested administrator account your-admin@example.com exists but its email is unverified, so no admin grant was made. The final production build and lint checks passed with the business details included. AI feedback and profile photos are now feature-gated off while API credits and the Storage bucket remain unavailable. No public deployment or live-user email/payment acceptance test has been performed.

## Firebase connection — 2 October 2026

The supplied service account was verified against project `connectcash-9e68c` and stored only in the ignored local environment file. Authentication and Firestore service calls succeeded. Email/password sign-in is enabled. Local development domains were added while preserving existing authorized domains. The seed command completed without overwriting existing course or settings records, and local demo mode was disabled. The Storage bucket has not been created, so live profile-photo uploads remain unavailable. Real signup, email verification and session acceptance still require a user account test. Vercel environment variables have not been configured.

The setup scripts' environment-loader imports were corrected for Node.js ESM; the seed script was then executed successfully against Firebase.

## OpenAI connection — 2 October 2026

The supplied key was stored only in `.env.local`, with `OPENAI_MODEL=gpt-4.1-mini`. Authentication and model access passed. One synthetic exercise-feedback request was attempted through the actual provider implementation; OpenAI returned HTTP 429 with `credit_balance_exhausted`. Successful generation remains unverified until API credits are available. No key was written to source code or the source archive.

## Original automated checks

- Production build: passed, including TypeScript and static page generation.
- ESLint: passed without warnings after the motion component cleanup.
- Business and security tests: 17 passed.
- Browser journeys: all four passed across the final full run and a targeted rerun of the corrected draft/photo test.
  - Public practice, manual payment approval, paid access, all 19 lessons, XP and public certificate verification.
  - Course creation, interactive block editing and persistence.
  - Draft recovery, disconnected-AI feedback, validated profile photo upload, anonymous denial and SVG rejection.
  - Persistent animation preferences, live reduced-motion changes and absence of browser errors in the motion test.
- Responsive checks: no horizontal overflow at 320, 375, 768, 1024 and 1440 pixels on the tested public, login, catalog, dashboard and profile pages. Mobile lesson navigation also passed.
- Visual inspection: desktop homepage, login and dashboard, plus mobile homepage and login.
- Production dependency audit: zero reported vulnerabilities after the checked-in dependency overrides.

The browser test initially used ambiguous label/alert selectors; those test selectors were corrected. Saved draft text and the disconnected-AI message were present in the failure snapshots. The final targeted test passed.

At the time of the original build checks, no Firebase project, real email delivery, OpenAI account, actual payment service or Vercel deployment was connected. The browser and business tests above used local preview accounts and a separate temporary database. The subsequent Firebase connection is recorded separately above.

Free-mode browser verification: 12 of 13 checks passed in the full run; the remaining course-intent navigation was interrupted with ERR_ABORTED and passed on targeted rerun. The optional real-owner smoke check could not authenticate on this run because the Firebase token endpoint connection reset before TLS completed. Earlier owner checks remain recorded above; no live account or payment records were modified by this change.
