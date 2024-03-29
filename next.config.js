/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'img.midjourneyapi.xyz',   
      'pub-3626123a908346a7a8be8d9295f44e26.r2.dev'
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3626123a908346a7a8be8d9295f44e26.r2.dev",
      },
    ],
  },
}

module.exports = nextConfig
