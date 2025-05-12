const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require("path")

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    hot: true,
    open: true,
    port: 3000,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
  },
  optimization: {
    minimize: false,
    splitChunks: {
      chunks: "all",
    },
  },
})
