import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  customWorkerSrc: "worker",

  // These are fine to keep disabled
  cacheStartUrl: false,
  dynamicStartUrl: false,

  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,

    // Exclude everything from precaching that might cause issues
    exclude: [/\.map$/, /^manifest.*\.js$/, /dashboard/, /\/api\//],

    // Only include specific file types in precache
    include: [/\.(?:js|css|png|jpg|jpeg|svg|woff2|woff|ttf|ico)$/],
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
