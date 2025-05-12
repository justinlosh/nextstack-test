import { NextResponse } from "next/server"

// This route is needed for the WebSocket server to work
// The actual WebSocket handling is done in the server initialization
export function GET() {
  return NextResponse.json({ message: "WebSocket endpoint" })
}
