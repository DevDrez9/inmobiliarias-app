import type { NextConfig } from "next";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/ir/:id*",
        destination: PLAY_STORE_URL,
        permanent: false,
      },
      {
        source: "/mapa",
        destination: PLAY_STORE_URL,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
