import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prismaクライアントを外部パッケージとして設定
  serverExternalPackages: ['@prisma/client'],
  // パスエイリアス設定
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // パスエイリアスを確実に設定
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/types': path.resolve(__dirname, 'src/types'),
    };
    
    // モジュール解決の設定を強化
    config.resolve.modules = [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ];
    
    // ファイル拡張子の解決順序を明示
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    
    return config;
  },
  // APIルートの静的生成を無効にする
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
