import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker/Coolify deployments — bundles only the
  // production dependencies actually needed into .next/standalone.
  output: "standalone",

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
