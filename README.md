# LibTech

> Current launch mode (8 October 2026): all published courses are free, regardless of stored future prices. Authenticated learners enroll through `/api/enroll`; course payment submissions are disabled at the API boundary and checkout links redirect to the free course page. Optional donations never unlock access or certificates. Set `DONATION_URL` only after verifying an HTTPS payment page that supports your country and account. Leave it blank until ready. The `/support` page explains this clearly. Older paid-launch instructions below apply only after a deliberate future commercial release and the appropriate hosting plan; changing an admin payment setting alone does not enable sales.


A text-first AI learning application built with Next.js App Router, TypeScript, Tailwind CSS, Firebase Authentication, Cloud Firestore, Firebase Storage, and optional server-side OpenAI grading.

## What is included

- Responsive public homepage with a real interactive sample, course search and filters, detailed curriculum, pricing, and FAQs.
- Firebase email/password registration, verification, sign-in, sign-out, password-reset email and action pages.
- Protected student and administration pages with server-side role and enrollment checks.
- A reusable 20-type lesson-block model: reading, examples, code, images, quizzes, short answers, matching, ordering, scenarios, practice and AI exercises.
- Saved responses, lesson resumption, server-graded answers, configurable passing percentage, XP, levels, UTC learning streaks, and achievements.
- Manual payment submission, duplicate-reference protection, confirmed approval/rejection, enrollment creation and externally processed refund recording.
- Verifiable, printable course-completion certificates with opaque IDs and public verification URLs.
- A course studio for course details, modules, lessons, publication, block authoring, and accessible move-up/down ordering.
- Student management, roles, suspension/restoration, manual enrollment/removal, certificate revocation, in-app notifications and administrative audit logs.
- Aggregate administration metrics, paginated records, AI request/token tracking, quota controls and platform settings.
- Profile editing and validated, resized private profile images.
- **AI Essentials: Learn AI by Doing**, $10, six modules and 19 detailed beginner lessons, with 66 interactive activities, worked examples, a practical capstone and a ten-question final assessment. Estimated study time is six hours including practice. See [COURSE.md](COURSE.md).

## Start locally

Use Node.js 24 LTS and npm. Run commands from this directory.

```sh
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open **http://127.0.0.1:3000**. On Log in, select **Try as a learner** or **Try as an admin**.

Local development uses your configured Firebase project. There are no demo accounts, automatic enrollments, or filesystem database adapters. Copy `.env.example` to `.env.local` and set the required credentials first. Keep `.env.local` private.

See [LAUNCH.md](LAUNCH.md) for the current launch checklist and administrator setup.

## Architecture

```text
src/
  app/
    (auth)/          Sign-in, registration, recovery, email action pages
    (private)/       Server-protected student and admin routes
    api/[...path]/   Validated JSON HTTP entry point
    api/profile/photo/  Private, normalized image uploads/downloads
    courses/         Public catalog and course details
    certificate/     Public certificate verification
  components/        Reusable public, learning, account and admin interfaces
  lib/
    domain.ts        Zod schemas, block model, grading and integrity helpers
    seed.ts          Complete authored course content
    firebase-client.ts  Browser authentication only
  server/
    auth.ts          Revocation-aware session validation and user provisioning
    store.ts         Firestore adapter + isolated local/test adapters
    learning.ts      Access, attempts, completion, XP, certificates, AI quotas
    payments.ts      Payment provider interface and atomic manual review
    admin.ts         Authoring, settings and user administration
    ai.ts            Replaceable AI provider, timeout and structured validation
    analytics.ts     Firestore count/sum aggregates
    http.ts          Origin validation, body-size limits, safe errors
    rate-limit.ts    Bounded per-process request protection
scripts/             Idempotent course seed, administrator grant, launch checks
tests/               Business-logic, concurrency and authorization tests
e2e/                 Browser-level learner and administrator journeys
```

React interfaces call same-origin JSON routes. Firebase client SDK is used only for authentication; all course data, payments, progress, XP and certificates are read or changed through the server. Firebase Admin uses credentials kept exclusively in server configuration.

The Store interface exposes reads and transactions. The Firestore adapter buffers writes until all reads are complete, preserving Firestore transaction semantics. The memory adapter enables deterministic and concurrent business-logic tests. The local JSON adapter is single-process and intended only for development.

### Core integrity rules

- The user role comes from the protected server-side user record, never the request body or client UI.
- Sensitive transactions re-read the actor and enrollment before writing.
- A user/course pair has a deterministic enrollment and current-payment ID.
- A hashed payment-reference reservation prevents reuse.
- Payment status and enrollment change in one transaction.
- Lesson XP is awarded only once, after required saved attempts pass.
- Module and course bonuses are recorded once in the same progress transaction.
- Final assessments require preceding lessons.
- Certificates are created inside the completion transaction and use random IDs.
- Saved course revisions detect competing editor saves.
- Existing enrollments freeze curriculum structure/content; publish a separate course edition for curriculum revisions. Descriptive metadata can still be edited.
- Archived courses disappear from the catalog but remain accessible to active enrolled learners.

## Database structure

Timestamps are ISO UTC strings; IDs are explicit fields. Prices are integer USD cents.

| Collection        | Purpose                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| users             | Private profile, role, suspension, XP, streak and achievement names          |
| courses           | Course metadata with nested ordered modules, lessons and blocks              |
| courseSlugs       | Transactional unique-slug reservations                                       |
| enrollments       | One user/course access record                                                |
| progress          | Completed lesson IDs, module bonuses, drafts, next lesson and certificate ID |
| exerciseAttempts  | Best saved response/feedback per user/course/lesson/block                    |
| quizAttempts      | Passed final-assessment score records                                        |
| payments          | Current manual request and review status per user/course                     |
| paymentHistory    | Superseded rejected/refunded requests                                        |
| paymentReferences | Hashed unique reference reservations                                         |
| certificates      | Issued certificate facts and revocation state                                |
| notifications     | Private in-app messages with read status                                     |
| aiUsage           | Evaluation status, safe feedback, tokens and related lesson IDs              |
| aiCounters        | Transactional daily and per-lesson usage counters                            |
| auditLogs         | Actor, action, target and timestamp for sensitive admin changes              |
| settings          | The `platform` document containing payment, XP and AI limits                 |

Modules and lessons are intentionally nested in a bounded course document to reduce reads. Course content is capped at 300 KB, well below Firestore's document limit. Catalog responses strip all lesson blocks; learner responses omit answer keys and grading rubrics. Admin lists load 50 records per page; catalog and personal course lists currently support the initial small catalog (100 records). See scale limits below.

Achievement definitions currently live in the domain/completion code; awarded names are denormalized onto users. This leaves a straightforward extension point for a separate badge-definition collection.

## Environment variables

`.env.example` lists every required variable without credentials.

| Variable                            | Use                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| APP_URL                             | Exact canonical origin, such as https://learn.example.com; used for CSRF and verification links |
| NEXT_PUBLIC_FIREBASE_API_KEY        | Firebase web API key; public application configuration                                          |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN    | Authorized Firebase authentication domain                                                       |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID     | Firebase web project ID                                                                         |
| NEXT_PUBLIC_FIREBASE_APP_ID         | Firebase registered web app ID                                                                  |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Firebase Storage bucket                                                                         |
| FIREBASE_PROJECT_ID                 | Admin project ID                                                                                |
| FIREBASE_STORAGE_BUCKET             | Admin Storage bucket                                                                            |
| FIREBASE_CLIENT_EMAIL               | Service-account email when not using ADC                                                        |
| FIREBASE_PRIVATE_KEY                | Server-only service-account private key; escaped newlines supported                             |
| OPENAI_API_KEY                      | Optional server-only OpenAI key                                                                 |
| OPENAI_MODEL                        | Optional model supporting Responses API Structured Outputs                                      |

Use Application Default Credentials on Google hosting instead of a downloaded service-account key where possible. Never place Admin or OpenAI secrets in `NEXT_PUBLIC_*` variables, source control, uploaded artifacts or browser code.

## Firebase setup

1. Create your Firebase project and register a web app. Copy its public configuration into the `NEXT_PUBLIC_FIREBASE_*` variables.
2. Enable **Authentication → Email/Password**. Configure a password policy with a minimum length of 10 characters and enable email enumeration protection.
3. Add your local and deployed domains to Firebase Authentication's authorized domains.
4. Create a Firestore database in the region appropriate for your users.
5. Configure a Storage bucket if using profile photos. Review the project's billing requirements before enabling services.
6. Set Admin credentials using ADC or the server-only service-account variables. Grant only the Firebase Auth, Firestore and Storage permissions needed by this server.
7. Install/login to Firebase CLI on your own machine. Select your project and deploy the checked-in rules and indexes:

```sh
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes,storage
```

8. Keep all direct client Firestore and Storage access denied. Server authorization is the security boundary; Admin SDK bypasses rules.
9. Optionally set the Firebase email template action URL to `https://YOUR_DOMAIN/auth/action`. The built-in Firebase action handler also works.
10. Seed the sample course:

```sh
npm run seed
```

The seed preserves existing courses and settings and never enables payments.

### Create the first administrator

Create an account through LibTech, verify its email, and sign in once so the private user record exists. Then, from a trusted machine with Admin credentials:

```sh
npm run admin -- your-email@example.com
```

This grants the server-side ADMIN role and writes a bootstrap audit event. No public endpoint can grant the initial admin role. Sign in again and open **Manage LibTech**. Later role changes are available to administrators with confirmation.

## OpenAI setup and cost control

Set `OPENAI_API_KEY` and `OPENAI_MODEL` on the server. Select an available model that supports the Responses API's strict JSON schema output, then verify quality and current pricing in your account before opening AI grading.

The provider sends only the designated lesson task, rubric and submitted response. It never provides general-purpose chat. It uses `store:false`, a 25-second timeout and a 900-token output cap. Zod validates the returned score, feedback, strengths, improvements and example.

Default limits are 10 requests per student per UTC day and 3 per student per lesson. Atomic Firestore reservations enforce both across instances. Failed provider calls still consume a reservation to limit repeated abuse. Repeated identical successful submissions use a per-user/course-revision cache. Pending requests are not charged twice. Stuck pending records after a server crash require operator review; no automatic costly retry occurs.

Most exercises use deterministic server grading and never call OpenAI. If AI is unconfigured/unavailable, the learner sees a clear message and can use the practice criteria check. Keyword-based practice checks are labeled as rule feedback; they are not represented as AI judgments.

Documentation used:

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)

## Payment operation

Set real recipient instructions, currency and support details under Admin Settings. Enable manual requests only after the operator's legal/support/refund information is finalized.

A submitted reference is **PENDING**. An administrator must independently confirm receipt outside LibTech, then approve. Approval creates active enrollment. Rejection permits a fresh reference to be submitted. Duplicate references and repeat approvals are rejected.

**Record refund** only after funds have actually been returned externally. It changes the record to REFUNDED and revokes enrollment; it cannot transfer money. No card provider, mobile-money gateway or bank connection is configured. Add an implementation of the PaymentProvider interface and a verified server webhook to support automatic payments.

## Testing

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The business tests cover authentication-dependent authorization, enrollment, duplicate/concurrent payment processing, required exercises, duplicate XP, full-course completion/certificate issuance, suspended users, AI authorization and atomic limits, cached evaluations, draft integrity, course author permissions and streak boundaries.

Browser tests cover:

- Homepage sample question and course search.
- Real course catalog and public login pages without demo controls.
- Signed-out admin redirects, private API denial, and the removed demo endpoint.
- Persistent motion preferences and system reduced-motion behavior.
- Mobile layouts and no horizontal overflow at 320, 375, 768 and 1440 pixels.

Browser smoke tests use the production build on port 3100. Run `npm run build` before `npm run test:e2e`. These checks read published Firebase courses but never create test accounts, payments or learning records. Business tests use isolated in-memory fixtures under `tests/fixtures`. Chrome is configured on this Windows machine; set `PLAYWRIGHT_CHROME_PATH` for another installation.

Local tests do **not** certify your Firebase project configuration, IAM, email delivery, live OpenAI model access, real payment receipts or hosting setup. Run staging acceptance tests with your credentials before selling access.

## Production build and deployment

For uploading the source to GitHub, start with [GITHUB.md](GITHUB.md).

**Vercel is the selected hosting platform. Follow [VERCEL.md](VERCEL.md) for the exact setup, environment variables, preview-origin handling and launch checklist.**

Use a Node.js host compatible with Next.js server rendering, such as Firebase App Hosting or a container service. This application is not a static export and should not be deployed to a static-only host or a Cloudflare Worker without an explicit Node-compatible migration.

1. Set production Firebase public values **before building**; Next.js embeds them in the browser bundle.
2. Set server secrets securely at runtime. Use `NODE_ENV=production`, and the correct HTTPS `APP_URL`.
3. Deploy rules/indexes, run the seed, and create the first admin.
4. Run all checks above, then:

```sh
npm ci
npm run build
npm start
```

The default build supports Vercel and `npm start`. The optional Dockerfile enables standalone output using `LIBTECH_STANDALONE=true`. Supply public Firebase build arguments to `docker build`; inject server secrets only when starting the container. The image runs as the unprivileged Node user and exposes port 3000.

For Firebase App Hosting, connect this source repository using its supported Next.js flow, map public values to build availability and secrets to runtime availability, and use the hosting service account for ADC. Consult the hosting provider's current setup guide for your project and billing plan.

No paid services have been purchased, no cloud project has been changed, and no public deployment has been performed.

## Security and operations

See [SECURITY.md](SECURITY.md) for the security model and pre-launch checks.

- Authentication uses revocation-aware HttpOnly SameSite sessions; production cookies are Secure.
- Mutations require the exact configured Origin and bounded validated input.
- React escapes user/course text; arbitrary HTML is not rendered.
- Images are decoded, resized and re-encoded; SVG uploads are rejected.
- General request limits are per process; AI spending limits are durable and transactional.
- Public certificates reveal only completion facts, never email, submissions or private account data.
- Drafts save to the server. A tab-local sessionStorage buffer protects unsaved text during rapid navigation/offline failures; it is scoped by user/course/lesson/block and cleared on logout.
- Keep database backups, structured operational monitoring, dependency updates, error alerts and project budget alerts enabled.

## Known limits and launch requirements

- Firebase, Storage, live email and OpenAI integrations require your credentials and staging validation. No cloud credentials were available during construction.
- Public policy pages use operator/support/policy environment values. Complete and review those values before launch; `npm run preflight` checks they are present.
- Catalog/personal lists are capped at 100 records, admin lists paginate at 50, and course content is capped at 300 KB. Expand queries or split curriculum documents when real usage requires it.
- Analytics “active accounts” counts non-suspended student accounts, not daily/monthly active users. Course completion counts derive from issued certificates.
- Grading is educational: deterministic practice uses documented keyword criteria; AI can make mistakes. There is no proctoring or accredited certification.
- A pending AI reservation interrupted by process failure does not auto-retry. Review it operationally.
- Mobile money/card automation, email notifications, subscriptions, discussions, reviews and multilingual/offline course delivery remain future extensions.
- A consistent dark, futuristic theme is styled throughout, with a light print-friendly certificate. Certificate downloads use the browser's Print/Save as PDF.
- Motion includes staggered section reveals, pointer-following ambient light, hover feedback, animated progress and XP, and lesson-completion confetti. The persistent motion toggle saves your preference locally; system reduced-motion preferences take priority.
- Published student testimonials are intentionally absent until genuine, consented feedback exists.
- Drafts and notification retention should be configured for the operator's policy. Deletion/data export requests currently require a trusted operator procedure.
- Generic request throttling is process-local. Add an edge/WAF or shared limiter before high-volume public exposure. The CSP permits inline framework scripts; use nonce-based CSP for a stricter deployment.

## Recommended next steps

1. Configure a staging Firebase project and verify signup, verification, recovery, storage, roles and rules with two real test accounts.
2. Enter real operator/support/refund details, evaluate the sample curriculum and configure payment instructions.
3. Connect an OpenAI project with a small budget limit; evaluate the chosen model against your grading rubric.
4. Deploy to staging, test mobile devices and poor connections, then run the full student/admin acceptance journey.
5. Enable production enrollment only after those checks pass.
