import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  i18n: {
    locales: ['es'],
    defaultLocale: 'es',
  },
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.(ico|png|jpg|jpeg|gif|svg)$/,
  //     type: 'asset/resource'
  //   });
  //   return config;
  // }
};

export default nextConfig;
