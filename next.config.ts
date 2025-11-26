import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  basePath: "",
  assetPrefix: "",
  trailingSlash: true,
};

export default nextConfig;
