# Chapter 29: Protecting Server Operations

*Part VI — Security*

---

## Learning Objectives
- Protect Server Actions and Route Handlers against Cross-Site Request Forgery (CSRF), Denial of Service (DoS), and brute-force attacks.
- Implement rate-limiting algorithms to limit automated request spam on server endpoints.
- Validate HTTP `Origin` and `Host` headers to enforce strict cross-origin security boundaries.
- Sanitize input payloads and restrict request body size limits.
- Avoid common operational security pitfalls such as un-throttled sensitive endpoints, unhandled payload floods, and un-sanitized string processing.

---

## Overview & Core Explanation

In Next.js 16 App Router, **Server Actions** and **Route Handlers** serve as publicly accessible HTTP entry points.

While Next.js automatically provides baseline protections (such as Action token validation and origin checks), production applications handling authentication, payments, or expensive database calculations must implement multi-layered operational security:

1. **CSRF & Origin Verification**: Verifying that requests originate from trusted host domains.
2. **Rate Limiting**: Throttling the frequency of HTTP requests per IP or session to prevent brute-force attacks and resource exhaustion.
3. **Payload Sanitization & Size Constraints**: Rejecting oversized payloads and sanitizing text strings to prevent injection attacks.

```
Incoming Request -> CSRF / Origin Verification
                          │
                          ▼
              Rate Limiter (e.g. Memory / Redis)
              ├── Exceeded Limit? ──► Returns 429 Too Many Requests
              └── Within Limit?   ──► Proceeds to Input Validation
                          │
                          ▼
              Payload Size & Zod Input Sanitization
                          │
                          ▼
              Executes Server Action / Route Handler
```

---

## Rate Limiting Server Operations

Rate limiting restricts the number of actions a client IP or session can execute within a specific time window (e.g., maximum 5 login attempts per minute).

In serverless or multi-container deployments, rate limiting is best handled using a fast key-value store (such as Upstash Redis or Redis). For single Node.js instances, an in-memory sliding window rate limiter provides baseline protection.

### Practical Example: In-Memory Sliding Window Rate Limiter

```typescript
// lib/security/rate-limit.ts
import "server-only";

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitTracker>();

/**
 * In-memory sliding window rate limiter
 * @param identifier Unique tracking key (e.g., client IP or User ID)
 * @param limit Maximum allowed requests within window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const tracker = rateLimitMap.get(identifier);

  if (!tracker || now > tracker.resetTime) {
    // Start new window tracking
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (tracker.count >= limit) {
    return { success: false, remaining: 0 };
  }

  tracker.count += 1;
  return { success: true, remaining: limit - tracker.count };
}
```

---

## Protecting Route Handlers (`app/api/*/route.ts`)

Route Handlers must explicitly verify request headers, rate limits, and authentication sessions before processing requests.

```typescript
// app/api/telemetry/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  // 1. Client IP Extraction
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // 2. Rate Limiting Check: Max 20 requests per minute per IP
  const rateLimit = checkRateLimit(`telemetry:${ip}`, 20, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too Many Requests. Please slow down." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  // 3. Authoritative Session Check
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Payload Parsing & Size Bounds
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Process telemetry metric...
    return NextResponse.json({ success: true, receivedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
  }
}
```

---

## Origin Verification & CSRF Protection

Next.js 16 automatically verifies the HTTP `Origin` header for Server Action POST requests against the application's `Host` header.

If you expose custom Route Handlers that accept mutative requests (`POST`, `PUT`, `DELETE`), implement explicit Origin header checks:

```typescript
// lib/security/csrf.ts
import "server-only";

import { headers } from "next/headers";

export async function verifyOriginHeader(): Promise<boolean> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    // Verify that request Origin matches the server Host header
    return originUrl.host === host;
  } catch {
    return false;
  }
}
```

---

## Server Operation Security Matrix

| Security Threat | Attack Vector | Defense Mechanism |
| :--- | :--- | :--- |
| **Brute-Force Attacks** | Automated password guessing on login endpoint | Rate Limiting (`checkRateLimit()`) returning HTTP 429. |
| **Denial of Service (DoS)** | Sending multi-megabyte JSON payloads to crash Node server | Strict request body size parsing limits + rate limiting. |
| **Cross-Site Request Forgery (CSRF)** | Malicious third-party site tricks browser into submitting form | Next.js built-in Action CSRF tokens + Origin header checks. |
| **Cross-Site Scripting (XSS)** | Injecting malicious `<script>` strings into text inputs | Input sanitization + Zod string schema validations. |

---

## Common Mistakes

1. **Leaving Sensitive Endpoints Un-Throttled**: Allowing unrestricted request volume on password reset, login, or AI generation endpoints, enabling credential stuffing or API bill inflation.
2. **Accepting Unbounded JSON Payloads**: Parsing raw `request.json()` without checking payload size headers, opening the server to memory exhaustion crashes.
3. **Disabling CSRF / Origin Verification**: Setting permissive wildcard CORS headers (`Access-Control-Allow-Origin: *`) on stateful mutative API endpoints.

---

## Production Considerations

- **Distributed Rate Limiting with Redis**: In multi-instance cluster or serverless cloud environments, replace in-memory rate limiters with Redis sliding window limiters (e.g. `@upstash/ratelimit`) to enforce unified rate limits across all edge nodes.
- **Web Application Firewall (WAF)**: Deploy a Cloud WAF (Cloudflare, AWS WAF, Vercel Firewall) in front of your Next.js application to filter out malicious SQL injection and bot traffic before requests hit your Node runtime.
- **Structured Security Audit Logs**: Emit structured log events whenever rate limits or origin validation checks fail to track brute-force attacks in real time.

---

## Summary

Protecting server operations in Next.js 16 requires a multi-layered defense strategy. By enforcing rate limits on sensitive endpoints, validating origin headers, constraining payload sizes, and sanitizing inputs, you safeguard server infrastructure against operational threats and malicious attacks.

---

## Checklist
- [ ] Implemented rate limiting on sensitive Server Actions and Route Handlers (login, password reset).
- [ ] Verified Origin and Host headers on mutative Route Handler endpoints.
- [ ] Restricted request body payload sizes to prevent memory exhaustion DoS attacks.
- [ ] Ensured all API responses return standard HTTP status codes (401, 403, 429).
- [ ] Monitored rate limit rejection events in production server logs.
