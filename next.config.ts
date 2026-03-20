import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
    ],
  },
  // Incluir el archivo CSV en el bundle de las serverless functions
  outputFileTracingIncludes: {
    '/api/*': ['./data/**/*'],
  },
}

export default nextConfig
