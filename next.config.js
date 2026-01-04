/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        // Exclude USB/native modules for browser builds
        'node-hid': false,
        usb: false,
        '@ledgerhq/devices': false,
        '@ledgerhq/hw-transport': false,
        '@ledgerhq/hw-transport-node-hid': false,
      };
    }

    // Ignore all optional peer dependencies that cause issues
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'node-hid': 'commonjs node-hid',
        usb: 'commonjs usb',
      });
    }

    return config;
  },
  // Transpile Solana packages for compatibility
  transpilePackages: [
    '@solana/wallet-adapter-base',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-react-ui',
    '@solana/wallet-adapter-phantom',
  ],
};

module.exports = nextConfig;

