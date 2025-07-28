import type { NextConfig } from "next";
const { withPlausibleProxy } = require('next-plausible');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'btctcs.nyc3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = withPlausibleProxy({
  customDomain: process.env.PLAUSIBLE_CUSTOM_DOMAIN,
})(nextConfig);
