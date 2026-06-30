import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Arvan Object Storage
      {
        protocol: "https",
        hostname: "*.arvanstorage.ir",
      },
      {
        protocol: "https",
        hostname: "*.arvancloud.ir",
      },
    ],
  },

  serverExternalPackages: ["postgres", "sharp", "@aws-sdk/client-s3"],
};

export default nextConfig;
