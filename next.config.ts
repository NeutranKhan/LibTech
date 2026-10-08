import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.LIBTECH_STANDALONE === 'true' ? 'standalone' : undefined,
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'" +
              (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '') +
              "; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com" +
              (process.env.NODE_ENV === 'development' ? ' ws: wss:' : '') +
              "; frame-src https://*.firebaseapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
