/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
  // Add any images domains if you're using next/image with external sources
  images: {
    domains: [],
  },
};

module.exports = nextConfig;

// Optional: If you want PWA support, uncomment below and install next-pwa
// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
//   runtimeCaching: [
//     {
//       urlPattern: /^https?.*/,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'offlineCache',
//         expiration: {
//           maxEntries: 200,
//         },
//       },
//     },
//   ],
// });
// 
// module.exports = withPWA(nextConfig);