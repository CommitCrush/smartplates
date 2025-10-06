import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img.spoonacular.com',
      'images.unsplash.com',
      'spoonacular.com',
      'res.cloudinary.com'
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
