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
};

module.exports = nextConfig;
