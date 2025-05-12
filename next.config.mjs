import { AssetReferencePlugin } from './lib/build/webpack-plugins/asset-reference-plugin';
import fs from 'fs';
import path from 'path';

// Load asset manifest if it exists
let assetManifest = {};
const manifestPath = path.join(process.cwd(), '.next', 'static', 'asset-manifest.json');

if (fs.existsSync(manifestPath)) {
  try {
    assetManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load asset manifest:', error);
  }
}

// Determine if we're running on Vercel
const isVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV || 'development';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BUILD_ENV: vercelEnv,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization configuration
  images: {
    // Use Vercel's image optimization in production
    unoptimized: !isVercel,
    // Configure image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Configure image formats
    formats: ['image/avif', 'image/webp'],
    // Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Conditionally apply optimizations based on environment
  ...(vercelEnv === 'production' ? {
    // Production-specific configurations
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: false,
    swcMinify: true,
    // Configure output for Vercel
    output: 'standalone',
  } : {
    // Development-specific configurations
    productionBrowserSourceMaps: true,
    swcMinify: false,
  }),
  
  // Custom webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Add the asset reference plugin
    config.plugins.push(new AssetReferencePlugin({
      manifestPath,
    }));
    
    // Add the asset manifest to the client
    if (!isServer) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AssetManifestPlugin', () => {
            // Create a script to inject the asset manifest
            const scriptContent = `window.__ASSET_MANIFEST__ = ${JSON.stringify(assetManifest)};`;
            const outputPath = path.join(compiler.outputPath, 'static', 'chunks', 'asset-manifest.js');
            
            // Ensure the directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // Write the script
            fs.writeFileSync(outputPath, scriptContent);
          });
        },
      });
    }
    
    // Vercel-specific optimizations
    if (isVercel) {
      // Optimize for Vercel's serverless environment
      if (isServer) {
        // Externalize dependencies that don't need to be bundled
        const originalExternals = config.externals;
        config.externals = [
          ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
          // Add any packages that should be externalized
          // This reduces the serverless function size
          'sharp',
        ];
      }
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['react-icons', 'date-fns', 'lodash'],
    // Enable server actions
    serverActions: true,
    // Enable app directory
    appDir: true,
  },
  
  // Add the asset manifest script to the document head
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Asset-Manifest',
            value: 'true',
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
