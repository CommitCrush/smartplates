import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // 'img.spoonacular.com', // REMOVED: Causes 429 errors
      'images.unsplash.com',
      // 'spoonacular.com', // REMOVED: Causes 429 errors
      'res.cloudinary.com',
      'cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  env: {
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY,
  }
};

export default nextConfig;
