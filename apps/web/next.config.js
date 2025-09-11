/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@wine-marketplace/shared', '@wine-marketplace/ui'],
  output: 'standalone',
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3002',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig