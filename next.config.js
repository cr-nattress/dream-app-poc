/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9999/.netlify/functions/:path*'
      }
    ]
  }
}

module.exports = nextConfig
