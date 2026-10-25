import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  basePath: "/apps",
  assetPrefix: "/apps",
  trailingSlash: true,
};

export default nextConfig;
