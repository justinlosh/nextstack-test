"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger service for the CMS
 */
class Logger {
    constructor() {
        this.config = {
            minLevel: LogLevel.INFO,
            enableConsole: true,
            logToFile: false,
        };
        // Private constructor to enforce singleton
    }
    /**
     * Get the logger instance
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Configure the logger
     */
    configure(config) {
        this.config = { ...this.config, ...config };
    }
    /**
     * Log a debug message
     */
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    /**
     * Log an info message
     */
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    /**
     * Log a warning message
     */
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    /**
     * Log an error message
     */
    error(message, error, context) {
        this.log(LogLevel.ERROR, message, { ...context, error: this.formatError(error) });
    }
    /**
     * Log a fatal message
     */
    fatal(message, error, context) {
        this.log(LogLevel.FATAL, message, { ...context, error: this.formatError(error) });
    }
    /**
     * Log a message with the specified level
     */
    log(level, message, context) {
        if (level < this.config.minLevel) {
            return;
        }
        const timestamp = new Date().toISOString();
        const levelName = LogLevel[level];
        const logEntry = {
            timestamp,
            level: levelName,
            message,
            ...(context ? { context } : {}),
        };
        if (this.config.enableConsole) {
            this.logToConsole(level, logEntry);
        }
        if (this.config.logToFile && this.config.logFilePath) {
            this.logToFile(logEntry);
        }
    }
    /**
     * Log to the console
     */
    logToConsole(level, logEntry) {
        const { timestamp, level: levelName, message, context } = logEntry;
        const formattedMessage = `[${timestamp}] ${levelName}: ${message}`;
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formattedMessage, context || "");
                break;
            case LogLevel.INFO:
                console.info(formattedMessage, context || "");
                break;
            case LogLevel.WARN:
                console.warn(formattedMessage, context || "");
                break;
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(formattedMessage, context || "");
                break;
        }
    }
    /**
     * Log to a file
     */
    logToFile(logEntry) {
        // In a real implementation, this would write to a file
        // For this example, we'll just simulate it
        const logString = JSON.stringify(logEntry);
        // console.log(`[FILE LOG] ${logString}`)
    }
    /**
     * Format an error for logging
     */
    formatError(error) {
        if (!error) {
            return undefined;
        }
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
}
exports.Logger = Logger;
// Export a singleton instance
exports.logger = Logger.getInstance();
