import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@meshsdk/core", "@meshsdk/core-cst"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.blockfrost.dev",
        pathname: "/**",
      },
    ],
  },
  webpack: function (config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
