import type { NextConfig } from "next";

const basePath = "/obtener-permiso";

const nextConfig: NextConfig = {
  basePath: basePath,
  assetPrefix: basePath,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
