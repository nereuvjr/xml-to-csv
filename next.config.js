/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros de ESLint durante o build
  },
};

module.exports = nextConfig;
