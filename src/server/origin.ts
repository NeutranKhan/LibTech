/** Origins come from operator configuration or trusted Vercel system values, never request headers. */
export function appOrigin() {
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL)
    return new URL('https://' + process.env.VERCEL_URL).origin;
  if (process.env.APP_URL) return new URL(process.env.APP_URL).origin;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return new URL('https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL).origin;
  if (process.env.VERCEL_URL) return new URL('https://' + process.env.VERCEL_URL).origin;
  return 'http://127.0.0.1:3000';
}
