import { appOrigin } from '@/server/origin';
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/courses'],
      disallow: [
        '/admin',
        '/dashboard',
        '/learn',
        '/profile',
        '/checkout',
        '/certificates',
        '/certificate',
        '/api',
        '/login',
        '/signup',
      ],
    },
    sitemap: appOrigin() + '/sitemap.xml',
  };
}
