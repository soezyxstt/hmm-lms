import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,

  // Custom worker with push handlers
  customWorkerSrc: "worker",

  // Disable all the automatic caching features
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,

  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,

    // CRITICAL: Disable precaching completely
    disablePrecacheManifest: true,
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
