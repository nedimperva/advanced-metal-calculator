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
  // Add server configuration for Render
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Ensure the app listens on all interfaces and uses the PORT env variable
  output: 'standalone',
}

export default nextConfig
