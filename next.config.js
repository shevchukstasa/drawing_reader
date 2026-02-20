/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow large file uploads (drawings can be big)
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

module.exports = nextConfig;
