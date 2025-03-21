import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  basePath: "/calories",
  assetPrefix: "/calories",
};

export default nextConfig;
