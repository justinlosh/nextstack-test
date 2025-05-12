/**
 * Base class for all CMS errors
 */
export class CmsError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = this.constructor.name
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Get a user-friendly message with suggestion
   */
  getUserMessage(): string {
    return this.message
  }
}

/**
 * Error thrown when content validation fails
 */
export class ValidationError extends CmsError {
  constructor(
    message: string,
    public details: Record<string, string[]>,
    code = "VALIDATION_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    const fieldErrors = Object.entries(this.details)
      .map(([field, errors]) => `- ${field}: ${errors.join(", ")}`)
      .join("\n")

    return `${this.message}\n\nPlease fix the following issues:\n${fieldErrors}`
  }
}

/**
 * Error thrown when a content type is not registered
 */
export class ContentTypeError extends CmsError {
  constructor(message: string, code = "CONTENT_TYPE_ERROR") {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nPlease check that you've registered this content type correctly.`
  }
}

/**
 * Error thrown when content is not found
 */
export class NotFoundError extends CmsError {
  constructor(
    message: string,
    public contentType: string,
    public contentId: string,
    code = "NOT_FOUND_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nPlease check that the content exists and you have the correct identifier.`
  }
}

/**
 * Error thrown when there are file system permission issues
 */
export class PermissionError extends CmsError {
  constructor(
    message: string,
    public path: string,
    public operation: "read" | "write" | "delete" | "create",
    code = "PERMISSION_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    const actionMap = {
      read: "reading from",
      write: "writing to",
      delete: "deleting",
      create: "creating",
    }

    return `${this.message}\n\nPlease check that the application has permission for ${actionMap[this.operation]} the file or directory.`
  }
}

/**
 * Error thrown when there are file system I/O issues
 */
export class FileSystemError extends CmsError {
  constructor(
    message: string,
    public path: string,
    public operation: "read" | "write" | "delete" | "create" | "list",
    public originalError?: Error,
    code = "FILE_SYSTEM_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    const suggestions = {
      read: "Check that the file exists and is readable.",
      write: "Check that the directory exists and is writable.",
      delete: "Check that the file exists and is writable.",
      create: "Check that the directory exists and is writable.",
      list: "Check that the directory exists and is readable.",
    }

    return `${this.message}\n\n${suggestions[this.operation]}`
  }
}

/**
 * Error thrown when a duplicate content ID is detected
 */
export class DuplicateError extends CmsError {
  constructor(
    message: string,
    public contentType: string,
    public contentId: string,
    code = "DUPLICATE_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nPlease use a different identifier or update the existing content instead.`
  }
}

/**
 * Error thrown when there are data format issues
 */
export class DataFormatError extends CmsError {
  constructor(
    message: string,
    public path: string,
    public format: string,
    public originalError?: Error,
    code = "DATA_FORMAT_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nPlease check that the file is a valid ${this.format} file.`
  }
}

/**
 * Error thrown when there are configuration issues
 */
export class ConfigurationError extends CmsError {
  constructor(message: string, code = "CONFIGURATION_ERROR") {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nPlease check your CMS configuration.`
  }
}

/**
 * Error thrown when there are unexpected errors
 */
export class UnexpectedError extends CmsError {
  constructor(
    message: string,
    public originalError?: Error,
    code = "UNEXPECTED_ERROR",
  ) {
    super(message, code)
  }

  getUserMessage(): string {
    return `${this.message}\n\nThis is an unexpected error. Please check the logs for more details.`
  }
}
