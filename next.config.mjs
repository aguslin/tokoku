/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://marketplace-api:5000/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig
