/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Optional: Add trailing slash for better static hosting compatibility
  trailingSlash: true,
}

module.exports = nextConfig 