import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    // jeśli używasz <Image /> z public/ → nic więcej nie trzeba
    // domains dodajemy tylko dla zewnętrznych obrazów
    domains: [],
  },

  // Middleware / API działa domyślnie w Node.js
  // nie trzeba już ustawiać experimental
};

export default nextConfig;
