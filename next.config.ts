import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minecraft.wiki',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PrismarineJS/minecraft-assets/**',
      },
    ],
  },
};

export default nextConfig;
