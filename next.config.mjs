import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  cacheStartUrl: false, // CHANGE THIS - don't precache the start URL
  dynamicStartUrl: true,
  dynamicStartUrlRedirect: "/dashboard",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,

  // Exclude routes from precaching
  publicExcludes: [
    "!noprecache/**/*",
  ],

  customWorkerSrc: "worker",

  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    // Exclude problematic patterns from precaching
    exclude: [/\.map$/, /^\/api\//],
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
