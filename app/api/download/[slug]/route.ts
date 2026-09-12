import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getProductBySlug } from "@/lib/db/data-access";

// File mapping for protected digital products
const PROTECTED_ASSETS: Record<string, string> = {
  "the-student-study-system": path.join(process.cwd(), "private", "assets", "pdf", "The_Student_Study_System.pdf"),
};

/**
 * Validates download entitlement using HMAC-SHA256 signature verification or server authorization header.
 */
function verifyDownloadAuthorization(request: NextRequest, slug: string): boolean {
  const authHeader = request.headers.get("authorization");
  const secretKey = process.env.DOWNLOAD_SECRET_KEY || process.env.ADMIN_API_KEY;

  // 1. Direct server bearer token match if secret key is configured
  if (secretKey && authHeader === `Bearer ${secretKey}`) {
    return true;
  }

  // 2. Cryptographic order token verification (HMAC signature check)
  const orderToken = request.nextUrl.searchParams.get("token");
  const expiresAtStr = request.nextUrl.searchParams.get("expires");

  if (!orderToken || !expiresAtStr || !secretKey) {
    return false;
  }

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false; // Token expired
  }

  // Verify HMAC signature: HMAC_SHA256(slug + ":" + expiresAt, secretKey)
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(`${slug}:${expiresAt}`)
    .digest("hex");

  const tokenBuf = Buffer.from(orderToken);
  const expectedBuf = Buffer.from(expectedSignature);

  if (tokenBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuf, expectedBuf);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // 1. Verify product exists and is published
  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const filePath = PROTECTED_ASSETS[slug];
  if (!filePath || !fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    return NextResponse.json({ error: "Digital asset unavailable" }, { status: 404 });
  }

  // 2. Server-side Authorization Check
  const isAuthorized = verifyDownloadAuthorization(request, slug);

  if (!isAuthorized) {
    return NextResponse.json(
      {
        error: "Unauthorized access",
        message: "Valid purchase verification authorization header or signed order download token is required.",
      },
      { status: 401 }
    );
  }

  // 3. Serve protected PDF file with anti-leak and download headers
  const stat = fs.statSync(/*turbopackIgnore: true*/ filePath);
  const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
