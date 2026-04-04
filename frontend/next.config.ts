import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_KISSAN_GATEWAY_ENDPOINT || 'http://backend:8000';
    console.log(`📡 API Rewrites enabled for: ${API_URL}`);
    return [
      {
        source: '/api/:path((?!auth).*)',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
