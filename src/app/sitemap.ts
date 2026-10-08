import { appOrigin } from '@/server/origin';
import type { MetadataRoute } from 'next';
import { catalog } from '@/server/catalog';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appOrigin();
  return [
    { url: base },
    { url: base + '/courses' },
    { url: base + '/support' },
    ...(await catalog()).map((c) => ({ url: base + '/courses/' + c.slug })),
  ];
}
