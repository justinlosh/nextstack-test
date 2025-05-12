const developmentConfig = require("./webpack.dev.js")
const productionConfig = require("./webpack.prod.js")

module.exports = (env, args) => {
  const mode = args.mode || "development"

  if (mode === "development") {
    return developmentConfig
  }

  // Pass the env object to the production config
  return productionConfig(env || {})
}
