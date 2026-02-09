const API_URL = process.env.API_URL || 'http://localhost:8080'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }]
  }
}

module.exports = nextConfig
