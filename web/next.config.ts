import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.lego.com",
        pathname: "/cdn/product-assets/**",
      },
      {
        protocol: "https",
        hostname: "cdn.rebrickable.com",
        pathname: "/media/sets/**",
      },
    ],
  },
}

export default nextConfig
