/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.storyblok.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cecomsa.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Ensure we're using SWC
    forceSwcTransforms: true,
  }
};

export default config;
