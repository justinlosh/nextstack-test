# Error Handling System

The Flat File CMS includes a comprehensive error handling system designed to gracefully manage potential errors and provide clear, actionable feedback to users and developers.

## Error Hierarchy

All errors in the CMS extend from the base `CmsError` class, which provides common functionality:

\`\`\`typescript
class CmsError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = this.constructor.name
  }

  getUserMessage(): string {
    return this.message
  }
}
\`\`\`

Specific error types include:

- **ValidationError**: When content fails schema validation
- **ContentTypeError**: When a content type is not registered
- **NotFoundError**: When content is not found
- **PermissionError**: When there are file system permission issues
- **FileSystemError**: When there are file system I/O issues
- **DuplicateError**: When a duplicate content ID is detected
- **DataFormatError**: When there are data format issues
- **ConfigurationError**: When there are configuration issues
- **UnexpectedError**: For unexpected errors

## User-Friendly Messages

Each error type provides a `getUserMessage()` method that returns a user-friendly message with suggestions for resolving the issue:

\`\`\`typescript
// Example from ValidationError
getUserMessage(): string {
  const fieldErrors = Object.entries(this.details)
    .map(([field, errors]) => `- ${field}: ${errors.join(", ")}`)
    .join("\n")
  
  return `${this.message}\n\nPlease fix the following issues:\n${fieldErrors}`
}
\`\`\`

## Logging System

The CMS includes a logging system that records detailed error information for debugging and monitoring:

\`\`\`typescript
logger.error(`Failed to read JSON file: ${fullPath}`, error as Error)
\`\`\`

The logger supports different log levels:

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about system operation
- **WARN**: Warning messages that don't affect operation
- **ERROR**: Error messages that affect operation
- **FATAL**: Critical errors that require immediate attention

## Error Handling in CRUD Operations

Each CRUD operation (Create, Read, Update, Delete) includes comprehensive error handling:

### Create Operation

Potential errors:
- **ValidationError**: When the content doesn't match the schema
- **DuplicateError**: When content with the same ID already exists
- **PermissionError**: When there are permission issues
- **FileSystemError**: When there are file system issues
- **ContentTypeError**: When the content type is not registered

### Read Operation

Potential errors:
- **NotFoundError**: When the content doesn't exist
- **ValidationError**: When the content doesn't match the schema
- **PermissionError**: When there are permission issues
- **FileSystemError**: When there are file system issues
- **DataFormatError**: When the file format is invalid

### Update Operation

Potential errors:
- **NotFoundError**: When the content doesn't exist
- **ValidationError**: When the updated content doesn't match the schema
- **PermissionError**: When there are permission issues
- **FileSystemError**: When there are file system issues
- **DataFormatError**: When the file format is invalid

### Delete Operation

Potential errors:
- **NotFoundError**: When the content doesn't exist
- **PermissionError**: When there are permission issues
- **FileSystemError**: When there are file system issues

## API Error Handling

The CMS includes a utility for handling errors in API routes:

\`\`\`typescript
export function handleApiError(error: unknown): NextResponse {
  // ...
}
\`\`\`

This utility:
- Converts CMS errors to appropriate HTTP status codes
- Provides user-friendly error messages
- Includes detailed error information for debugging
- Logs unexpected errors

## Best Practices

When working with the CMS, follow these error handling best practices:

1. **Use try-catch blocks** to handle errors gracefully
2. **Check for specific error types** to provide appropriate feedback
3. **Log errors** for debugging and monitoring
4. **Provide user-friendly messages** to guide users
5. **Prevent data corruption** by validating data before writing

## Example Error Handling

\`\`\`typescript
try {
  const page = await dataService.get<Page>("page", "non-existent-page")
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("Page not found:", error.getUserMessage())
  } else if (error instanceof ValidationError) {
    console.log("Validation error:", error.getUserMessage())
  } else if (error instanceof CmsError) {
    console.log("CMS error:", error.getUserMessage())
  } else {
    console.error("Unexpected error:", error)
  }
}
\`\`\`

This approach ensures that errors are handled gracefully and users receive clear, actionable feedback.
\`\`\`

Let's update the docs/index.md to include the error handling documentation:
