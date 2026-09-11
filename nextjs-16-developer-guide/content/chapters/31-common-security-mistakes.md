# Chapter 31: Common Security Mistakes

*Part VI — Security*

---

## Learning Objectives
- Identify and remediate the top security vulnerabilities in Next.js 16 App Router applications.
- Prevent Cross-Site Scripting (XSS) when using `dangerouslySetInnerHTML`.
- Eliminate Server Action security bypasses and authorization gaps.
- Protect against Mass Assignment vulnerabilities during form mutations.
- Conduct a pre-flight production security audit across codebases.

---

## Overview & Core Explanation

Modern web frameworks simplify web development, but they do not eliminate security responsibilities. Many production security breaches are caused by misunderstanding architectural boundaries or assuming the framework handles security automatically.

This chapter provides a dedicated security audit of the **5 most dangerous security mistakes** in Next.js applications and demonstrates exact code patterns to fix them.

```
                    PRODUCTION SECURITY AUDIT
┌───────────────────────────────────────────────────────────────┐
│ 1. Server Action Authorization (Never trust client calls)      │
│ 2. Unsanitized XSS Injection (dangerouslySetInnerHTML)        │
│ 3. Insecure Default Fallback Secrets                          │
│ 4. Mass Assignment Vulnerabilities                            │
│ 5. Client-Side Only Authorization Guards                      │
└───────────────────────────────────────────────────────────────┘
```

---

## Vulnerability 1: Server Actions Without Authorization Checks

### Dangerous Anti-Pattern
A developer assumes that because a "Delete Project" button is shown only to admin users in the React UI, the underlying Server Action is secure.

```typescript
// BAD: app/actions/project.ts
"use server";

export async function deleteProjectAction(projectId: string) {
  // CRITICAL VULNERABILITY: No session or permission check!
  // Anyone can invoke this action HTTP endpoint directly.
  await db.projects.delete({ id: projectId });
}
```

### Production Fix
Always perform authoritative session and permission validation inside the Server Action body.

```typescript
// GOOD: app/actions/project.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/permissions";
import { deleteProjectById } from "@/lib/dal/projects-authz";

export async function deleteProjectAction(projectId: string) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  // Authoritative permission and tenant-isolated deletion
  assertPermission(session, "project:delete");
  await deleteProjectById(projectId);

  return { success: true };
}
```

---

## Vulnerability 2: Un-Sanitized `dangerouslySetInnerHTML` (XSS)

### Dangerous Anti-Pattern
Rendering raw HTML content from database fields or user input without sanitization.

```typescript
// BAD: Rendering un-sanitized user HTML
export function UserComment({ commentHtml }: { commentHtml: string }) {
  // CRITICAL VULNERABILITY: If commentHtml contains <script>alert(1)</script>, it executes XSS!
  return <div dangerouslySetInnerHTML={{ __html: commentHtml }} />;
}
```

### Production Fix
Sanitize user-provided HTML using a trusted sanitization library (such as `isomorphic-dompurify` or `sanitize-html`) before rendering.

```typescript
// GOOD: Sanitized HTML rendering
import DOMPurify from "isomorphic-dompurify";

export function UserComment({ commentHtml }: { commentHtml: string }) {
  const cleanHtml = DOMPurify.sanitize(commentHtml);

  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

---

## Vulnerability 3: Insecure Secret Fallbacks

### Dangerous Anti-Pattern
Providing hardcoded fallback strings when environment variables are omitted.

```typescript
// BAD: Insecure secret fallback
const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret-key-123";
```

### Production Fix
Throw an explicit startup error if required security secrets are missing.

```typescript
// GOOD: Strict environment enforcement (lib/env.ts)
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}
```

---

## Vulnerability 4: Mass Assignment Flaws in Mutations

### Dangerous Anti-Pattern
Passing raw `formData` or request bodies directly into database creation methods without schema parsing.

```typescript
// BAD: Mass assignment vulnerability
export async function updateUserProfileAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  // CRITICAL VULNERABILITY: An attacker can append role="ADMIN" to form body!
  await UserModel.findByIdAndUpdate(userId, rawData);
}
```

### Production Fix
Parse inputs through an explicit Zod schema that whitelists allowed fields.

```typescript
// GOOD: Whitelisted schema parsing with Zod
const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(200),
});

export async function updateUserProfileAction(formData: FormData) {
  const rawFields = {
    displayName: formData.get("displayName")?.toString(),
    bio: formData.get("bio")?.toString(),
  };

  // Only whitelisted fields pass validation
  const validated = UpdateProfileSchema.parse(rawFields);
  await UserModel.findByIdAndUpdate(userId, validated);
}
```

---

## Vulnerability 5: Client-Side-Only Authorization Checks

### Dangerous Anti-Pattern
Checking permissions inside Client Component `useEffect` hooks while allowing Server Component pages to query database data un-checked.

```typescript
// BAD: Client-side-only authorization check
"use client";

export function AdminPanel() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // CRITICAL VULNERABILITY: Server component already pre-rendered sensitive HTML!
    if (user.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [user]);

  return <div>Sensitive Admin Telemetry Data</div>;
}
```

### Production Fix
Perform authorization checks on the server inside Server Components before emitting HTML.

```typescript
// GOOD: Server Component authorization gate
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/unauthorized"); // Halts server execution before rendering HTML
  }

  return <div>Sensitive Admin Telemetry Data</div>;
}
```

---

## Security Audit Summary Matrix

| Vulnerability | Root Cause | Defense Strategy |
| :--- | :--- | :--- |
| **Action Auth Leaks** | Assuming UI button hiding secures Server Actions | Enforce `getSession()` & permission checks inside Server Actions |
| **XSS via HTML Injection** | Un-sanitized `dangerouslySetInnerHTML` | Sanitize HTML with `isomorphic-dompurify` |
| **Fallback Secrets** | Using `process.env.SECRET \|\| 'default'` | Throw fatal errors on missing secrets via `lib/env.ts` |
| **Mass Assignment** | Passing raw form objects to ORM models | Whitelist input fields using Zod schema `parse()` |
| **Client Auth Leak** | Hiding UI via client `useEffect` hooks | Perform authoritative auth redirects inside Server Components |

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

1. **Relying on Framework Defaults for Domain Security**: Assuming Next.js automatically knows which database records a specific user is authorized to edit.
2. **Exposing Internal Exception Traces to Clients**: Returning raw `error.stack` or SQL/Mongo error strings in client API responses.
3. **Leaving Debug Routes Active in Production**: Leaving `/api/debug-db` or `/test-login` test routes active in production deployments.

---

## Production Considerations

- **Automated Security Scanning**: Integrate `npm audit` and static analysis security testing (SAST) tools (such as Snyk or Semgrep) into CI build pipelines.
- **Content Security Policy (CSP)**: Configure strict CSP HTTP response headers in `next.config.ts` to restrict execution of inline scripts and external domains.
- **Dependency Auditing**: Keep dependencies updated to eliminate known CVE vulnerabilities in third-party npm packages.

---

## Summary

Web application security requires vigilance across every architectural layer. By enforcing Server Action authorization, sanitizing HTML inputs, validating schemas with Zod, eliminating secret fallbacks, and gating routes on the server, you eliminate common security vulnerabilities.

---

## Checklist
- [ ] Confirmed every Server Action performs authoritative session and permission validation.
- [ ] Sanitized all `dangerouslySetInnerHTML` usages using `isomorphic-dompurify`.
- [ ] Eliminated all fallback default secret strings across environment variable files.
- [ ] Whitelisted form fields with Zod schemas to prevent mass assignment exploits.
- [ ] Conducted a pre-flight security review ensuring zero client-side-only authorization checks.
