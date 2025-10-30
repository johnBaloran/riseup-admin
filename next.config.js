/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Performance Optimization
   * - React strict mode for development
   */
  reactStrictMode: true,

  /**
   * Security
   * - Hide powered-by header
   */
  poweredByHeader: false,

  /**
   * Image Configuration
   * - Allow Cloudinary images
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
