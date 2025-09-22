import withPWA from "@ducanh2912/next-pwa";
import { runtimeCaching } from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  sw: 'worker/index.js',
  register: true,
  workboxOptions: {
    runtimeCaching,
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["hmm-lms.sgp1.digitaloceanspaces.com"],
  },
};

export default pwaConfig(nextConfig);
