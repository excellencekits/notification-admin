import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // todo: this need to set to true or remove it as default is true. set false as chart was giving error when first render
  // https://github.com/apexcharts/apexcharts.js/issues/3652
  reactStrictMode: false,
  // Produce standalone server output for Docker image (generates .next/standalone)
  output: 'standalone',
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'imagehub-stg.excellencekits.com',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: 'imagehub.excellencekits.com',
        pathname: '**'
      },
      {
        protocol: 'https',
        hostname: '**.excellencekits.com',
        pathname: '**'
      }
    ]
  }
};

export default nextConfig;
