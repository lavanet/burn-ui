/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/punycode\/punycode\.js/ },
    ];

    // Disable webpack cache in development
    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

export default nextConfig;
