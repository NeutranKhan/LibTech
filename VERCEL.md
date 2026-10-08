# Hosting LibTech on Vercel

> Current launch mode (8 October 2026): all published courses are free, regardless of stored future prices. Authenticated learners enroll through `/api/enroll`; course payment submissions are disabled at the API boundary and checkout links redirect to the free course page. Optional donations never unlock access or certificates. Set `DONATION_URL` only after verifying an HTTPS payment page that supports your country and account. Leave it blank until ready. The `/support` page explains this clearly. Older paid-launch instructions below apply only after a deliberate future commercial release and the appropriate hosting plan; changing an admin payment setting alone does not enable sales.


LibTech uses Vercel for the Next.js application and Firebase for durable accounts, course data, payments, learning records and profile images. No production data is stored on Vercel's local filesystem.

## 1. Prepare Firebase

Follow the Firebase setup in README.md first. Enable email/password auth, configure Firestore and Storage, apply the security rules/indexes, and create server credentials.

For Vercel, set FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY. The private key must remain a server secret. Paste its complete PEM value; actual newlines and escaped `\\n` are supported.

Use a separate Firebase project for staging/preview if you want production data completely isolated.

## 2. Import the project

1. Put the contents of this `libtech` directory into a Git repository.
2. In Vercel, choose **Add New → Project**, import that repository and select **Next.js**.
3. If the repository contains the surrounding workspace, set Root Directory to `outputs/libtech`. If the repository starts inside this folder, leave Root Directory at its default.
4. Use Node.js **24.x**. Install/build commands are checked into vercel.json. Leave the output directory at the Next.js default.
5. Choose a function region near your Firestore database using Vercel's project settings.
6. Add the environment variables below before deploying.

## 3. Configure environment variables

Also follow [LAUNCH.md](LAUNCH.md). Run `npm run preflight` with your production settings before deployment. Public operator and policy details are included in src/lib/site.ts; OPERATOR_NAME, SUPPORT_EMAIL, REFUND_POLICY and DATA_RETENTION_POLICY optionally override them. Keep AI_FEEDBACK_ENABLED and PROFILE_PHOTOS_ENABLED false until those services have passed live checks.

**Public build-time Firebase values**

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

**Server-only runtime values**

- APP_URL — the exact HTTPS production origin, e.g. `https://learn.your-domain.com`
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- OPENAI_API_KEY — optional
- OPENAI_MODEL — optional; a model supporting Responses API Structured Outputs

Set the appropriate Production and Preview scopes separately. Redeploy after changing environment variables; browser Firebase values are embedded at build time.

The origin helper automatically uses Vercel's trusted VERCEL_URL in Preview deployments so mutation requests use that deployment's own origin. Production prefers your explicit APP_URL, then Vercel's production-domain system variable. It never trusts an arbitrary forwarded host header.

Add your production domain and any preview domain used for authentication to Firebase Authentication's authorized domains. If using the custom email action handler, set its URL to `https://YOUR_DOMAIN/auth/action` in Firebase email templates.

## 4. Deploy, seed and create an administrator

Deploy from Vercel after setting the variables. On your trusted local machine with the same Firebase Admin credentials:

```sh
npm run seed
```

Create a real account in the deployed app, verify its email, sign in once, then run locally:

```sh
npm run admin -- your-email@example.com
```

Sign in again and open Manage LibTech. Set payment instructions only when your real payment method and operator details are ready.

## 5. Acceptance checks before opening sales

- Sign up with a fresh email, verify it, sign in and reset its password.
- Check a second account cannot see private student data, admin data or paid lessons.
- Submit a test payment reference, approve it only after independent verification, and confirm course access.
- Complete exercises, refresh midway, verify resume, and check duplicate completion does not add XP.
- Finish the course, print a certificate, and verify its public link in a signed-out browser.
- Upload a small profile photo and ensure another account cannot retrieve it.
- If AI is connected, verify the model, response quality, usage counters, quota errors and provider failure behavior.
- Confirm Firestore/Storage rules deny direct browser access.
- Configure Vercel/Firebase monitoring, budgets and abuse protection appropriate for your plan.
- Publish the operator's real support, privacy and refund details.

## Runtime details

- JSON API routes run in the Node.js runtime with a 60-second maximum duration.
- AI calls time out after 25 seconds with a bounded output and durable per-user quotas.
- Profile uploads use Node.js and a 30-second maximum; images are capped at 2 MB before normalization.
- Firebase Admin clients are reused across warm function requests.
- General ingress throttling is process-local. For broad public traffic, configure Vercel Firewall/rate limits or a shared limiter; AI usage enforcement already lives in Firestore.
- Demo accounts, demo login endpoints and filesystem persistence are removed from the application.
- The Dockerfile is an optional alternative for self-hosting; Vercel uses its native Next.js build.

No Vercel project or paid resource has been created from this workspace.

References:

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel environment variables](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables)
- [Function maximum duration](https://vercel.com/docs/functions/configuring-functions/duration)
