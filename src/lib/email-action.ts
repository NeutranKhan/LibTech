export function parseEmailActionLink(value: string, origin: string, authDomain: string) {
  let link: URL;
  try {
    link = new URL(value.trim());
  } catch {
    throw new Error('Paste the complete link from your LibTech email.');
  }
  const trusted = link.origin === origin || link.origin === 'https://' + authDomain;
  if (!trusted || !['/auth/action', '/__/auth/action'].includes(link.pathname))
    throw new Error('Use the verification or password-reset link from your LibTech email.');
  const mode = link.searchParams.get('mode');
  const code = link.searchParams.get('oobCode');
  if (!['verifyEmail', 'resetPassword'].includes(mode || '') || !code || code.length > 2048)
    throw new Error(
      'This email link is incomplete or uses an unsupported action. Request a fresh email.',
    );
  return { mode: mode as 'verifyEmail' | 'resetPassword', code };
}
