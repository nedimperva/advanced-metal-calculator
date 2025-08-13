import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Server external packages (fixed from deprecated experimental.serverComponentsExternalPackages)
  serverExternalPackages: [],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compress: true,
  poweredByHeader: false,
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disableDevLogs: true,
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // Never cache Next.js build assets to avoid stale ChunkLoadError
    {
      urlPattern: /^\/_next\//,
      handler: 'NetworkOnly',
    },
    // Never cache service worker related files
    {
      urlPattern: /\/(sw|workbox).*\.js$/,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
})(nextConfig);
