import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      targetFramework: "Next.js 16.3.4",
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
