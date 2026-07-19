import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name.ro,
    short_name: site.shortName,
    description: site.description.ro,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: site.colors.primary,
    lang: 'ro',
    icons: [
      { src: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
