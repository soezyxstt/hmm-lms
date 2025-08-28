// @ts-nocheck
// next.config.js
import withPWA from "@ducanh2912/next-pwa";
import { runtimeCaching } from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  swSrc: 'worker/index.js',
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

/** @type {import('next').NextConfig} */
const nextConfig = {

};

// @ts-ignore
export default pwaConfig(nextConfig);
