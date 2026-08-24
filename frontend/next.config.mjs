console.log(`\n\x1b[36m\x1b[1m🚀 SweetTree Next.js Frontend\x1b[0m`);
console.log(`\x1b[36m====================================================\x1b[0m`);
console.log(`\x1b[32m✅ Web Server:\x1b[0m   Running and ready to serve traffic\x1b[0m`);
console.log(`\x1b[36m====================================================\x1b[0m\n`);

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("CRITICAL DEPLOYMENT ERROR: NEXT_PUBLIC_API_URL environment variable is missing.");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.BUILD_DIR || '.next',
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
