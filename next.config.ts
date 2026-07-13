import type { NextConfig } from "next";

const cloudflarePagesBuild = process.env.CLOUDFLARE_PAGES === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: cloudflarePagesBuild ? "export" : undefined,
};

export default nextConfig;
