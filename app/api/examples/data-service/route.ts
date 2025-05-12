import { NextResponse } from "next/server"
import { dataServiceExample } from "../../../../lib/examples/data-service-example"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { logger } from "../../../../lib/services/logger"

export async function GET() {
  try {
    // Configure logger for this request
    logger.configure({
      minLevel: 0, // DEBUG level
      enableConsole: true,
    })

    // Create a stream to send the response
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start the response
    const response = new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })

    // Write initial message
    await writer.write(encoder.encode("Running Data Service Example...\n\n"))

    // Capture console.log output
    const originalLog = console.log
    console.log = async (...args) => {
      originalLog(...args)
      const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg)).join(" ")
      await writer.write(encoder.encode(message + "\n"))
    }

    // Run the example
    try {
      await dataServiceExample()
      await writer.write(encoder.encode("\nExample completed successfully!"))
    } catch (error) {
      // Format the error message
      let errorMessage: string

      if (error instanceof Error) {
        errorMessage = `\nError: ${error.message}`
        if (error.stack) {
          errorMessage += `\n\nStack trace:\n${error.stack}`
        }
      } else {
        errorMessage = `\nError: ${String(error)}`
      }

      await writer.write(encoder.encode(errorMessage))
    }

    // Restore console.log
    console.log = originalLog

    // Close the writer
    await writer.close()

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
