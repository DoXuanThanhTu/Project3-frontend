import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ImageKit
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/**",
      },

      // Ví dụ: Cloudinary
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/**",
      },

      // Ví dụ: domain CDN riêng
      {
        protocol: "https",
        hostname: "disney-pixar-piper.netlify.app",
        pathname: "/**",
      },

      // Ví dụ: ảnh từ subdomain
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
