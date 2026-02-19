import { NextResponse } from "next/server";

// BetterStack pings this URL to check uptime
export async function GET() {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
