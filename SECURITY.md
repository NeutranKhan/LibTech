# LibTech security model

## Trust boundaries

The browser never grants roles, enrollment, XP, completion or certificates. Firebase ID tokens establish a recent, verified-email server session. Every API request derives its user from a verified HttpOnly session and a private user record. Suspended users are rejected. Administrative mutations additionally re-read the actor in the transaction.

Firestore and Storage client rules deny all access. Privileged Admin SDK access must be restricted to trusted runtime identities. Security rules are not a replacement for server authorization, because the Admin SDK bypasses them.

## Sensitive flows

- Payment approval is atomic with enrollment and audit recording.
- Lesson completion reads server-stored attempts and awards XP once.
- The final assessment cannot skip preceding lessons.
- Certificates are created only inside successful course completion.
- AI requests validate enrollment and exercise type, reserve durable quotas before calling the provider, use untrusted-input boundaries, and validate structured output.
- Course authoring checks ownership, unique slugs, revisions, block structure and enrolled-curriculum immutability.
- All mutations check Origin; JSON requests are capped before parsing and validated with Zod.
- Uploaded profile images are capped at 2 MB / 16 million decoded pixels, re-encoded as 256px WebP, and served only to the authenticated owner.

## Production authentication

All application sessions are verified Firebase sessions. Demo session creation, demo accounts and local file persistence have been removed. Synthetic users and in-memory storage exist only in test fixtures and are never imported by the application.

## Before launch

- Use HTTPS and a canonical APP_URL matching the browser origin.
- Keep secrets in the hosting secret manager; use ADC wherever possible.
- Apply Firebase deny-all client rules and the checked-in indexes.
- Verify runtime IAM, email verification, password policy, email enumeration protection and authorized domains.
- Test sign-out, password reset/revocation, suspension and role changes with real accounts.
- Confirm direct Firestore and Storage writes are denied from anonymous and signed-in browser SDK clients.
- Configure billing budgets, database backups, retention and monitoring.
- Use an edge/shared request limiter for multi-instance general abuse protection. Durable AI quotas already span instances.
- Review CSP and add nonces if the deployment requires strict inline-script prevention.
- Publish operator identity, support/refund rules, retention and privacy contact information.
- Re-run dependency audits and apply security updates before deployment.

## Reporting

The operator must publish a security contact before launch. Report suspected vulnerabilities privately, with reproduction details that avoid exposing credentials or other students' information.
