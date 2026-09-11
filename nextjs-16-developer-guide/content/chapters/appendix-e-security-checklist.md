# Appendix E: Security Checklist

*Appendix*

---

## Learning Objectives
- Execute a comprehensive security audit across Next.js 16 App Router applications.
- Verify authentication, authorization, secret management, input sanitization, and server operation protections.
- Eliminate common web security vulnerabilities (XSS, CSRF, IDOR, Mass Assignment).

---

## Overview & Core Explanation

Application security requires defending every layer of the technology stack—from client component execution boundaries to Server Actions, HTTP cookies, and database queries.

This appendix provides a pre-flight security audit checklist for Next.js 16 applications.

```text
                        SECURITY CHECKLIST PIPELINE
┌────────────────────────┬────────────────────────┬────────────────────────┐
│  SECRETS & COOKIES     │  AUTH & TENANT ISOLATION│  INPUTS & OPERATIONS   │
│                        │                        │                        │
│ • HttpOnly Cookies     │ • Server Action Authz  │ • Zod Schema Parsing   │
│ • NO NEXT_PUBLIC_ Keys │ • Tenant Filter (IDOR) │ • DOMPurify HTML XSS   │
│ • lib/env.ts Zod       │ • DAL Permission Guard │ • Rate Limiting (429)  │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## Production Security Checklist

### 1. Secret Management & Environment Security
- [ ] **No Secret Exposure**: Zero database URIs or private API keys feature the `NEXT_PUBLIC_` prefix.
- [ ] **Environment Validation**: `lib/env.ts` validates all environment variables using Zod during server startup.
- [ ] **Git Exclusion**: `.env*.local` and `.env.production` files are listed in `.gitignore`.
- [ ] **Fatal Secret Misconfigurations**: Server halts startup immediately if critical secrets (`AUTH_SECRET`, `MONGODB_URI`) are missing.

### 2. Authentication Architecture
- [ ] **HTTP-Only Cookies**: Session tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies (never in `localStorage`).
- [ ] **Server Session Checks**: Async Server Components and DAL functions validate sessions using `cookies()` / `headers()`.
- [ ] **Client State Disregard**: Client-side state (`localStorage`, React state) is never trusted for authentication decisions.

### 3. Authorization & Tenant Isolation (Anti-IDOR)
- [ ] **Authoritative Action Security**: Every Server Action and Route Handler performs session authentication and role permission checks.
- [ ] **Tenant Isolation**: Every database read, update, and delete query appends `tenantId: session.tenantId` to prevent cross-tenant IDOR access.
- [ ] **UI Hiding as UX Only**: UI button hiding is treated strictly as UX convenience, never as security enforcement.

### 4. Input Validation & XSS Prevention
- [ ] **Zod Schema Parsing**: All form inputs and Server Action payloads pass through Zod schemas before database execution.
- [ ] **Mass Assignment Defense**: Form inputs are parsed through explicit whitelisted Zod schemas.
- [ ] **HTML Sanitization**: All HTML strings rendered with `dangerouslySetInnerHTML` are sanitized using `isomorphic-dompurify`.

### 5. Protecting Server Operations & Rate Limiting
- [ ] **Rate Limiting**: Sensitive endpoints (login, password reset, API routes) enforce rate limits (returning HTTP 429).
- [ ] **CSRF & Origin Verification**: Mutative Route Handlers verify HTTP `Origin` and `Host` headers.
- [ ] **Request Size Constraints**: Restricted request body payload sizes to prevent memory exhaustion DoS attacks.

---

## Practical Example

```typescript
// app/actions/project-guard.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/permissions";
import { deleteProjectById } from "@/lib/dal/projects-authz";

export async function deleteProjectAction(projectId: string) {
  // 1. Authoritative Session Check
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  // 2. Permission Check
  assertPermission(session, "project:delete");

  // 3. Tenant-Isolated Deletion (DAL)
  await deleteProjectById(projectId);

  return { success: true };
}
```

---

## Common Mistakes

1. **Prefixing Database Secrets with `NEXT_PUBLIC_`**: Exposing database URIs in client JavaScript bundles.
2. **Missing Tenant ID Filters in Queries**: Executing `findById(id)` without filtering by `session.tenantId`, exposing IDOR vulnerabilities.
3. **Storing Session Tokens in `localStorage`**: Exposing session tokens to XSS script extraction.

---

## Production Considerations

- **Security Headers**: Configure strict security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) in `next.config.ts`.
- **Dependency Auditing**: Run `npm audit` in CI/CD pipelines to catch known CVE vulnerabilities in npm dependencies.

---

## Summary

Executing this security checklist ensures that your Next.js 16 application is protected against XSS, CSRF, IDOR, and unauthorized data access.

---

## Checklist
- [ ] Stored session tokens in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- [ ] Enforced `tenantId: session.tenantId` on all database queries.
- [ ] Validated all inputs with Zod schemas inside Server Actions.
- [ ] Sanitized `dangerouslySetInnerHTML` usages with `isomorphic-dompurify`.
