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
}

export default nextConfig
