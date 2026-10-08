/** Only known local pages may be used as authentication return destinations. */
export function safeDestination(value?: string | null): string {
  if (!value || value.length > 500) return '/dashboard';
  return /^\/(?:dashboard|profile|certificates|courses(?:\/[a-zA-Z0-9_-]+)?|learn\/[a-zA-Z0-9_-]+|checkout\/[a-zA-Z0-9_-]+|admin(?:\/courses\/[a-zA-Z0-9_-]+)?)$/.test(
    value,
  )
    ? value
    : '/dashboard';
}
export function authHref(
  page: 'login' | 'signup' | 'forgot-password' | 'auth/action',
  destination?: string | null,
) {
  const next = safeDestination(destination);
  return '/' + page + (next === '/dashboard' ? '' : '?next=' + encodeURIComponent(next));
}
export function destinationFromContinueUrl(value: string | undefined, origin: string): string {
  if (!value) return '/dashboard';
  try {
    const url = new URL(value);
    return url.origin === origin ? safeDestination(url.searchParams.get('next')) : '/dashboard';
  } catch {
    return '/dashboard';
  }
}
