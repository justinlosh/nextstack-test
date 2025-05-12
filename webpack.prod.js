const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const TerserPlugin = require("terser-webpack-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")

module.exports = (env) => {
  // Create the production configuration with conditional plugins
  const productionConfig = {
    mode: "production",
    devtool: false,
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: true,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Number.POSITIVE_INFINITY,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              // npm package names are URL-safe, but some servers don't like @ symbols
              return `vendor.${packageName.replace("@", "")}`
            },
          },
        },
      },
      runtimeChunk: "single",
      moduleIds: "deterministic",
    },
    plugins:
      env && env.analyze
        ? [
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ["gifsicle", { interlaced: true }],
                    ["jpegtran", { progressive: true }],
                    ["optipng", { optimizationLevel: 5 }],
                    [
                      "svgo",
                      {
                        plugins: [
                          {
                            name: "preset-default",
                            params: {
                              overrides: {
                                removeViewBox: false,
                                addAttributesToSVGElement: {
                                  params: {
                                    attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
            }),
            new BundleAnalyzerPlugin(),
          ]
        : [
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ["gifsicle", { interlaced: true }],
                    ["jpegtran", { progressive: true }],
                    ["optipng", { optimizationLevel: 5 }],
                    [
                      "svgo",
                      {
                        plugins: [
                          {
                            name: "preset-default",
                            params: {
                              overrides: {
                                removeViewBox: false,
                                addAttributesToSVGElement: {
                                  params: {
                                    attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
            }),
          ],
  }

  // Merge with common config and return
  return merge(common, productionConfig)
}
