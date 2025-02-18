/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Ensures static export
  images: {
    unoptimized: true,
  },
  distDir: 'out' // Change output directory
}

module.exports = nextConfig 