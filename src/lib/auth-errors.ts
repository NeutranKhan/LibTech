export function authError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/expired-action-code':
      'This email link has expired. Request a fresh verification or password-reset email.',
    'auth/invalid-action-code':
      'This email link is invalid or has already been used. If you already verified your email, return to sign in. Otherwise request a fresh email.',
    'auth/invalid-credential':
      'The email or password is incorrect. Try again or use Forgot password.',
    'auth/wrong-password': 'The email or password is incorrect. Try again or use Forgot password.',
    'auth/user-not-found': 'The email or password is incorrect. Try again or create an account.',
    'auth/email-already-in-use':
      'This email already has an account. Log in, or use Forgot password to recover it.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password with at least 10 characters.',
    'auth/password-does-not-meet-requirements':
      'Choose a stronger password with uppercase and lowercase letters, a number, and a symbol.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
    'auth/network-request-failed':
      'We could not reach the sign-in service. Check your internet connection and try again.',
    'auth/user-disabled': 'This account is disabled. Contact libtech1393@gmail.com for help.',
    'auth/operation-not-allowed':
      'Email sign-in is currently unavailable. Contact libtech1393@gmail.com.',
    'auth/unauthorized-domain':
      'Sign-in is not enabled for this website address. Contact libtech1393@gmail.com.',
    'auth/invalid-api-key':
      'The sign-in service is not configured correctly. Contact libtech1393@gmail.com.',
    'auth/user-token-expired': 'Your sign-in has expired. Enter your email and password again.',
    'auth/requires-recent-login': 'Please enter your email and password again to continue.',
  };
  return code
    ? (messages[code] ??
        'Sign-in could not be completed. Try again or contact libtech1393@gmail.com.')
    : error instanceof Error
      ? error.message
      : 'Please try again.';
}
