import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  basePath: "/apps",
  assetPrefix: "/apps",
};

export default nextConfig;
