import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true, // Let next-pwa handle registration
  reloadOnOnline: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: "/dashboard",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  publicExcludes: ["!noprecache/**/*"],

  // Custom worker configuration - IMPORTANT: no leading slash
  customWorkerSrc: "worker", // This points to /worker/index.js in your project root

  // Add these to force updates
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["hmm-lms.sgp1.digitaloceanspaces.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "1024mb",
    },
  },
};

export default pwaConfig(nextConfig);
