/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  logToFile: boolean
  logFilePath?: string
}

/**
 * Logger service for the CMS
 */
export class Logger {
  private static instance: Logger
  private config: LoggerConfig = {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    logToFile: false,
  }

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Configure the logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log a warning message
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log an error message
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, { ...context, error: this.formatError(error) })
  }

  /**
   * Log a fatal message
   */
  public fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, { ...context, error: this.formatError(error) })
  }

  /**
   * Log a message with the specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < this.config.minLevel) {
      return
    }

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const logEntry = {
      timestamp,
      level: levelName,
      message,
      ...(context ? { context } : {}),
    }

    if (this.config.enableConsole) {
      this.logToConsole(level, logEntry)
    }

    if (this.config.logToFile && this.config.logFilePath) {
      this.logToFile(logEntry)
    }
  }

  /**
   * Log to the console
   */
  private logToConsole(level: LogLevel, logEntry: Record<string, any>): void {
    const { timestamp, level: levelName, message, context } = logEntry
    const formattedMessage = `[${timestamp}] ${levelName}: ${message}`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, context || "")
        break
      case LogLevel.INFO:
        console.info(formattedMessage, context || "")
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, context || "")
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, context || "")
        break
    }
  }

  /**
   * Log to a file
   */
  private logToFile(logEntry: Record<string, any>): void {
    // In a real implementation, this would write to a file
    // For this example, we'll just simulate it
    const logString = JSON.stringify(logEntry)
    // console.log(`[FILE LOG] ${logString}`)
  }

  /**
   * Format an error for logging
   */
  private formatError(error?: Error): Record<string, any> | undefined {
    if (!error) {
      return undefined
    }

    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
}

// Export a singleton instance
export const logger = Logger.getInstance()
