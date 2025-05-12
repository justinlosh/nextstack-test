"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetReferencePlugin = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../services/logger");
/**
 * Webpack plugin to replace asset references with their processed paths
 */
class AssetReferencePlugin {
    constructor(options = {}) {
        this.manifest = {};
        this.options = {
            manifestPath: path_1.default.join(process.cwd(), ".next", "static", "asset-manifest.json"),
            ...options,
        };
    }
    apply(compiler) {
        const pluginName = this.constructor.name;
        compiler.hooks.beforeCompile.tapAsync(pluginName, (params, callback) => {
            this.loadManifest();
            callback();
        });
        compiler.hooks.normalModuleFactory.tap(pluginName, (factory) => {
            factory.hooks.parser.for("javascript/auto").tap(pluginName, (parser) => {
                // Handle import statements
                parser.hooks.import.tap(pluginName, (statement, source) => {
                    this.processImport(parser, source);
                });
                // Handle require statements
                parser.hooks.call.for("require").tap(pluginName, (expression) => {
                    if (expression.arguments.length > 0 && expression.arguments[0].type === "Literal") {
                        const source = expression.arguments[0].value;
                        if (typeof source === "string") {
                            this.processImport(parser, source);
                        }
                    }
                });
            });
        });
    }
    loadManifest() {
        try {
            if (fs_1.default.existsSync(this.options.manifestPath)) {
                this.manifest = JSON.parse(fs_1.default.readFileSync(this.options.manifestPath, "utf8"));
                logger_1.logger.debug(`Loaded asset manifest with ${Object.keys(this.manifest).length} entries`);
            }
            else {
                logger_1.logger.warn(`Asset manifest not found at ${this.options.manifestPath}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Failed to load asset manifest: ${error.message}`);
        }
    }
    processImport(parser, source) {
        // Check if the source is in the manifest
        if (this.manifest[source]) {
            // Replace the source with the processed path
            parser.state.current.addDependency({
                request: this.manifest[source],
                userRequest: source,
            });
        }
    }
}
exports.AssetReferencePlugin = AssetReferencePlugin;
