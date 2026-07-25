import type { NextConfig } from 'next';

const strapiUrl = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';

const nextConfig: NextConfig = {
  images: {
    // /uploads e same-origin prin rewrite → optimizatorul next/image îl preia local și servește AVIF/WebP.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com' }],
    // Next 16 blochează implicit optimizarea de pe IP-uri locale. Aici optimizatorul preia
    // /uploads prin rewrite de la Strapi pe 127.0.0.1 (hop de încredere, rețea privată).
    dangerouslyAllowLocalIP: true,
  },
  async rewrites() {
    // Media Strapi servit same-origin: /uploads/* -> Strapi (dev; în prod poate face și nginx asta).
    return [{ source: '/uploads/:path*', destination: `${strapiUrl}/uploads/:path*` }];
  },
};

export default nextConfig;
