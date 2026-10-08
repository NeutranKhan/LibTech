# LibTech production launch

> Current launch mode (8 October 2026): all published courses are free, regardless of stored future prices. Authenticated learners enroll through `/api/enroll`; course payment submissions are disabled at the API boundary and checkout links redirect to the free course page. Optional donations never unlock access or certificates. Set `DONATION_URL` only after verifying an HTTPS payment page that supports your country and account. Leave it blank until ready. The `/support` page explains this clearly. Older paid-launch instructions below apply only after a deliberate future commercial release and the appropriate hosting plan; changing an admin payment setting alone does not enable sales.


## Current state

The authenticated landing page is `/dashboard`. Login and signup preserve a validated local destination in `next` when opened from a course, including across email verification and password recovery. Logged-in visitors to the homepage go to their dashboard. The private profile has an initials avatar, cover, editable details, learning stats, achievements and activity; image upload controls are not shown.

The admin overview uses aggregate queries when their indexes are available, with streaming fallbacks for missing student/revenue indexes. The service account currently lacks permission to create indexes; the recommended definitions are included in `firestore.indexes.json` for an owner to deploy. Fallbacks return real totals but read more documents as the platform grows. AI feedback remains disabled until API credits are available.

The application uses Firebase Authentication and Firestore. Demo users, demo login buttons, local preview banners, the local database and the filesystem storage adapter have been removed. Only published Firestore courses appear in the catalog and homepage. AI Essentials is retained as authored course content; it is not a fake student record.

Payments are currently closed. AI feedback and photo uploads are disabled until their backing services are ready; standard exercises and initials-based avatars remain available.

## Sign in as administrator

The owner account `your-admin@example.com` is verified and has the ADMIN role. The user-supplied email verification code was validated and applied through Firebase on 6 October; the prepared private grant was then consumed. Log in with the existing password and open `/admin` or **Manage LibTech**. If the password is forgotten, use `/forgot-password`; do not create a duplicate account.

During development, if Firebase's hosted email page cannot be reached, use **Email link won’t open? Complete it here** on the sign-in screen. Paste the original email link into `/auth/action`. The app extracts the action and checks the code with Firebase; it does not visit the unavailable hosting page. This does not disable verification. Local addresses only work on the computer running LibTech.

The Firebase project and web-app display names are LibTech. Verification, password-reset and email-change sender display names are LibTech. The project ID and default Firebase hostname remain `connectcash-9e68c`; they are infrastructure identifiers.

For additional administrators using the trusted command line:

1. Create your own account at `/signup`.
2. Open the verification email and verify the address.
3. Sign in at `/login` once, so LibTech creates your account record.
4. From this source directory on a trusted computer with Firebase Admin credentials configured, run:

```sh
npm run admin -- your-real-email@example.com
```

5. Sign in again and open `/admin` (or choose **Manage LibTech**).

There is no default admin password or shared admin account. The grant command checks email verification and records the change in the audit log. To prepare access before verification, use `npm run admin -- EMAIL --after-verification`. This writes a private grant tied to the existing Firebase UID and email; it does not verify the address or issue a session. The server consumes it only after verified authentication and audits activation. Never run it for an address you do not intend to trust with administration.

## Before publishing

- Set the final public HTTPS `APP_URL` and add the domain to Firebase Authentication's authorized domains.
- In Firebase Authentication → Templates → Customize action URL, set `https://YOUR_PUBLIC_DOMAIN/auth/action` after deploying that page. This is distinct from a continue URL. It makes new verification and password-reset emails open LibTech directly. Do not set a localhost address as the shared public template destination. Test a fresh email on another device before launch. Existing emails keep their old destination.
- Public details are configured in `src/lib/site.ts`: Michael Khan operates LibTech, with support at libtech1393@gmail.com. Review the refund/retention wording for your operation and jurisdictions before opening sales. The `OPERATOR_NAME`, `SUPPORT_EMAIL`, `REFUND_POLICY` and `DATA_RETENTION_POLICY` environment variables optionally override these values.
- Run `npm run preflight`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`.
- Verify Firebase rules/indexes from this repository against the intended project. Direct browser access to private Firestore and Storage records must be denied; the server checks session, role and enrollment permissions.
- Test registration, email verification, password reset, learner isolation, and the owner account on your deployed staging URL. Test confirmed payment approval and refund recording with real test accounts before accepting students.
- Review the course content, price and support/refund details, then enable payment requests from Admin Settings with your actual recipient and payment instructions.

## Optional services

- **AI:** the API key is valid, but the most recent request was rejected with `credit_balance_exhausted`. Add API credits, verify a real feedback request, then set `AI_FEEDBACK_ENABLED=true`. Configure the existing per-user limits in Admin Settings.
- **Photos:** create the configured Firebase Storage bucket, apply appropriate rules and verify upload/private retrieval. Then set `PROFILE_PHOTOS_ENABLED=true`.
- Redeploy after changing Vercel environment values. Keep private keys only in `.env.local` and server environment variables, never in GitHub.

## GitHub and Vercel

Upload the contents of the latest `LibTech-source.zip` to the repository root, then import the repository into Vercel. Follow [GITHUB.md](GITHUB.md) and [VERCEL.md](VERCEL.md). The ZIP excludes local settings, downloaded credentials, tests' generated data and build caches. No public deployment has been performed.

## Next content phase

AI Essentials now has 19 expanded beginner lessons, 66 interactive activities, a capstone and ten-question final assessment. See [COURSE.md](COURSE.md) for the editorial scope and safe publishing process. The current course document limit is 300 KB; split curriculum storage into individual lesson documents before adding courses that exceed it. Keep real learner data and course versions stable when expanding published content.
