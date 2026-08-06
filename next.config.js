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
      // Kalo pake UploadThing pake domain lain, tambahin juga
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Matiin ESLint di build (udah ada)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Matiin TypeScript error di build (opsional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;