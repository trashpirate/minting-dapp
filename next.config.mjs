/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nft-cdn.alchemy.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dweb.link",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
