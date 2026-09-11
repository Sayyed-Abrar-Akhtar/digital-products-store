# Chapter 27: Authentication Architecture

*Part VI — Security*

---

## Learning Objectives
- Design secure authentication architectures in Next.js 16 App Router using HTTP-only cookies and JWT / Session tokens.
- Implement session reading and verification inside React Server Components, Server Actions, and Route Handlers.
- Differentiate between Middleware routing checks vs authoritative server-side session validation.
- Protect session tokens against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) attacks.
- Avoid common authentication security flaws such as client-only auth claims, insecure secret fallbacks, and un-sanitized cookie flags.

---

## Overview & Core Explanation

Authentication establishes and verifies user identity. In modern full-stack Next.js 16 applications, authentication must operate securely across server execution boundaries.

### The Core Security Directive for Auth
> **Never rely on client-side state (`localStorage`, `sessionStorage`, or React state) to make authentication decisions.**

Client-side storage is accessible to any JavaScript code running in the browser, making tokens vulnerable to Cross-Site Scripting (XSS) extraction.

### Recommended Pattern: Encrypted HTTP-Only Cookies
Authentication in Next.js 16 should be powered by **HTTP-only, Secure, SameSite cookies**.
- **`HttpOnly`**: Prevents browser JavaScript (`document.cookie`) from reading the session token, eliminating XSS token theft.
- **`Secure`**: Ensures cookies are transmitted strictly over encrypted HTTPS connections.
- **`SameSite=Lax` or `Strict`**: Protects against Cross-Site Request Forgery (CSRF) attacks by restricting cross-origin cookie transmission.

```
Browser                     Next.js Server Runtime
   │                                  │
   ├─► 1. POST /api/login ───────────►│ Validates Credentials against DB
   │                                  │
   │◄──2. Set-Cookie: session=xyz ────┤ Returns Set-Cookie Header (HttpOnly)
   │      (HttpOnly; Secure; Lax)     │
   │                                  │
   ├─► 3. GET /dashboard ────────────►│ Automatic Cookie Transmission
   │      (Cookie header sent)        │ Reads cookie via next/headers
   │                                  │ Renders Authenticated RSC UI
```

---

## Session Verification in Server Components & Data Layers

Use Next.js 16's `headers()` or `cookies()` function from `next/headers` to read incoming session cookies inside async Server Components and Data Access Layer (DAL) modules.

```typescript
// lib/auth/session.ts
import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

export interface UserSession {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
  tenantId: string;
}

/**
 * Validates and decodes the incoming HTTP-only session cookie
 * Memoized per request using React.cache
 */
export const getSession = cache(async (): Promise<UserSession | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("acme_session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Decode and verify token signature (e.g., via Jose / JWT verification)
    const session = await verifySessionToken(sessionCookie);
    return session;
  } catch (err) {
    console.error("Invalid or expired session cookie:", err);
    return null;
  }
});

async function verifySessionToken(token: string): Promise<UserSession> {
  // Production token verification logic (e.g. JWT secret key check)
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is missing.");
  }

  // Simulated token validation payload
  if (token.startsWith("valid-token-")) {
    const parts = token.split(":");
    return {
      userId: parts[1] || "usr-123",
      email: "engineer@acme.com",
      role: (parts[2] as any) || "USER",
      tenantId: "tenant-acme-1",
    };
  }

  throw new Error("Invalid token signature");
}
```

---

## Route Protection: Middleware vs Server Guards

A common architectural debate in Next.js App Router is where to enforce authentication route guards.

### 1. Middleware (`proxy.ts` / `middleware.ts`)
Middleware runs on incoming HTTP requests **before** route matching completes. It is ideal for high-level URL redirects (e.g., redirecting unauthenticated visitors from `/dashboard/*` to `/login`).

> **Important**: Middleware should serve as a fast optimistic redirect layer, **not** as your sole security boundary. Edge middleware cannot execute heavy database permission lookups on every request.

```typescript
// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("acme_session");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### 2. Server Component & DAL Guards (Authoritative)
Every Server Component page, Server Action, and Data Access Layer function must perform authoritative session validation before returning sensitive user data or mutating state.

```typescript
// app/dashboard/page.tsx (Server Component Page)
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  // Authoritative server-side session check
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/dashboard");
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Welcome back, {session.email}</h1>
      <p className="text-muted-foreground">Tenant Workspace ID: {session.tenantId}</p>
    </main>
  );
}
```

---

## Setting & Clearing Session Cookies in Server Actions

Server Actions and Route Handlers can mutate HTTP-only cookies directly using `cookies()` from `next/headers`.

```typescript
// app/actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Validate credentials against database
  if (email === "admin@acme.com" && password === "SecurePass123!") {
    const sessionToken = "valid-token-admin:usr-100:ADMIN";

    const cookieStore = await cookies();
    cookieStore.set("acme_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    redirect("/dashboard");
  }

  return { success: false, message: "Invalid email or password." };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("acme_session");
  redirect("/login");
}
```

---

## Authentication Security Matrix

| Mechanism | Storage Target | XSS Protection | CSRF Protection | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **HTTP-Only Cookie** | Browser Cookie Store | **Protected** (Inaccessible to JS) | Protected via `SameSite=Lax` | **Production Standard** for App Router sessions. |
| **Local Storage (`localStorage`)** | Browser Window Memory | **Vulnerable** (Accessible to any script) | N/A | **Forbidden** for authentication session tokens. |
| **Authorization Header** | Memory / Client State | Dependent on storage | Protected | Used for third-party external API requests. |

---

## Practical Example
In our reference application (**Acme App**), this pattern is utilized across Server Components and Server Actions to ensure consistent architecture.

```typescript
// Practical implementation snippet for Next.js 16 (Target 16.3.4)
export async function executePracticalWorkflow() {
  return { success: true, timestamp: new Date().toISOString() };
}
```

## Common Mistakes

1. **Storing Tokens in `localStorage`**: Storing JWT tokens in browser `localStorage` and passing them via custom client headers on every request.
   - *Security Risk*: Any malicious third-party script or XSS vulnerability can steal the token from `localStorage`.
2. **Fallback Secret Defaults**: Writing `const secret = process.env.AUTH_SECRET || 'default-secret-key'`.
   - *Security Risk*: In production, if `AUTH_SECRET` is omitted from environment variables, the application uses the predictable fallback string, allowing attackers to forge session tokens.
3. **Relying Solely on Middleware Redirects**: Assuming that because Middleware blocks `/dashboard`, data layer calls inside Server Actions do not need to check session tokens.

---

## Production Considerations

- **Strict Secret Enforcement**: Throw an immediate startup error if `AUTH_SECRET` is missing in production runtime environments.
- **Short-Lived Tokens with Refresh Cycles**: Pair short-lived session tokens (e.g. 15 minutes) with encrypted refresh tokens to minimize window of opportunity for stolen session tokens.
- **Secure Cookie Flags**: Always set `httpOnly: true`, `secure: true` (in production), and `sameSite: 'lax'` on all authentication cookies.

---

## Summary

Authentication in Next.js 16 App Router requires storing session tokens in HTTP-only cookies, reading sessions on the server using `cookies()`, and validating identity authoritatively inside Server Components, Server Actions, and the Data Access Layer (DAL).

---

## Checklist
- [ ] Stored session tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- [ ] Eliminated `localStorage` and `sessionStorage` for authentication token storage.
- [ ] Validated sessions authoritatively inside async Server Components and DAL queries.
- [ ] Configured Middleware for fast optimistic unauthenticated route redirects.
- [ ] Verified that missing `AUTH_SECRET` environment variables halt server startup in production.
