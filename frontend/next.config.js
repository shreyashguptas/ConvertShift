/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.fs = false;
    config.resolve.alias.path = false;
    config.resolve.alias.os = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/ffmpeg-core.js',
        destination: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
      },
      {
        source: '/ffmpeg-core.wasm',
        destination: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
      },
    ];
  },
};

module.exports = nextConfig; 