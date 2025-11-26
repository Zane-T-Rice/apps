import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  basePath: "/apps",
  assetPrefix: "/apps",
  trailingSlash: true,
};

export default nextConfig;
