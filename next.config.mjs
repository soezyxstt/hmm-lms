import withPWA from "@ducanh2912/next-pwa";
import { runtimeCaching } from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerSrc: 'worker/index',
  register: true,
  workboxOptions: {
    runtimeCaching,
  },
  publicExcludes: ['!noprecache/**/*'],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["hmm-lms.sgp1.digitaloceanspaces.com"],
  },
  output: 'standalone',
};

export default pwaConfig(nextConfig);
