import withPWA from "@ducanh2912/next-pwa";

const pwaConfig = withPWA({
  // dest: "public",
  // disable: process.env.NODE_ENV === "development",
  // customWorkerSrc: "worker",
  // register: true,
  // workboxOptions: {
  //   runtimeCaching,
  // },
  // cacheOnFrontEndNav: true,
  publicExcludes: ["!noprecache/**/*"],

  // ---------------- PWA MAIN CONFIG ----------------
  /**
   * @desc The destination directory for the service worker file.
   * @default "public"
   */
  dest: "/public",

  /**
   * @desc Disables PWA generation in development mode to avoid caching issues.
   * @required
   */
  disable: process.env.NODE_ENV === "development",

  /**
   * @desc Automatically registers the service worker.
   * @default true
   */
  register: true,

  /**
   * @desc Reloads the page when the app comes back online.
   * @default true
   */
  reloadOnOnline: true,

  // ---------------- CUSTOM WORKER CONFIG ----------------
  /**
   * @desc Points to the directory containing your custom service worker implementation.
   * @required for push notifications
   */
  // customWorkerSrc: "worker",

  // ---------------- CACHING STRATEGY ----------------
  /**
   * @desc Caches the start URL. Essential for a fast first load and offline access.
   * @default true
   */
  cacheStartUrl: true,

  /**
   * @desc Handles different start URLs for logged-in vs. logged-out users.
   * @required for dynamic apps
   */
  dynamicStartUrl: true,

  /**
   * @desc If your start URL ('/') redirects when logged in, specify the destination here.
   * @example "/dashboard"
   */
  dynamicStartUrlRedirect: "/dashboard", // <-- TODO: Change this to your main authenticated route

  /**
   * @desc Caches pages navigated to via <Link>. Makes subsequent navigations instant.
   * @default true
   */
  cacheOnFrontEndNav: true,

  /**
   * @desc Aggressively caches scripts and stylesheets for navigated pages.
   * @default true
   */
  aggressiveFrontEndNavCaching: true,
  customWorkerSrc: '/worker'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["hmm-lms.sgp1.digitaloceanspaces.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1024mb'
    }
  }
};

export default pwaConfig(nextConfig);
