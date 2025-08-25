// next.config.js
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: 'worker',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // your existing config
};

// @ts-ignore
export default pwaConfig(nextConfig);
