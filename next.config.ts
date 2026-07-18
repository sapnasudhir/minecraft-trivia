import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minecraft.wiki',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
