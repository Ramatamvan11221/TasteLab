/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🔥 TAMBAHIN INI BIAR DYNAMIC ROUTES GAK ERROR
  experimental: {
    authInterrupts: true, // Buat middleware auth
  },
  output: 'standalone',
};

module.exports = nextConfig;