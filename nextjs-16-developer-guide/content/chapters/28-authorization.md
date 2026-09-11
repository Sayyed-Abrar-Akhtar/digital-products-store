# Chapter 28: Authorization

*Part VI — Security*

---

## Learning Objectives
- Distinguish clearly between **Authentication** ("Who are you?") and **Authorization** ("What are you allowed to do?").
- Implement **Role-Based Access Control (RBAC)** and **Tenant Isolation** boundaries in Next.js 16.
- Protect Server Actions, Route Handlers, and Data Access Layer (DAL) queries against **Insecure Direct Object Reference (IDOR)** attacks.
- Enforce authorization checks at the exact point of data mutation and query execution.
- Avoid authorization anti-patterns such as client-side authorization checks, missing tenant filters, and role escalation flaws.

---

## Overview & Core Explanation

Authentication verifies *identity*, but **Authorization** enforces *permissions*. An authenticated user must not be granted unrestricted access to every record, workspace, or administrative API endpoint in the system.

### Insecure Direct Object Reference (IDOR) Vulnerabilities
One of the most common security flaws in web applications is **IDOR**. IDOR occurs when an application exposes a database identifier (e.g. `GET /dashboard/projects/proj-999` or invoking `deleteProjectAction("proj-999")`) without verifying that the currently logged-in user owns or has permission to view `proj-999`.

```
Attacker Request -> POST /actions/deleteProject ("proj-999")
                          │
                          ▼
           Server Action Execution
                          │
  ┌───────────────────────┴───────────────────────┐
  │                                               │
  ▼ BAD (No Authorization Check)                  ▼ GOOD (Tenant & Permission Guard)
Deletes proj-999 belonging to Tenant B!        1. Reads session.tenantId ("tenant-A")
[IDOR Vulnerability!]                         2. Queries DB: { _id: "proj-999", tenantId: "tenant-A" }
                                              3. Rejects request: "Forbidden: Record not found in tenant"
```

---

## Role-Based Access Control (RBAC) Utility

Define central permission utilities that encapsulate domain authorization rules.

```typescript
// lib/auth/permissions.ts
import "server-only";

import { UserSession } from "./session";

export type Permission =
  | "project:read"
  | "project:create"
  | "project:delete"
  | "tenant:settings";

const ROLE_PERMISSIONS: Record<"USER" | "ADMIN", Permission[]> = {
  USER: ["project:read", "project:create"],
  ADMIN: ["project:read", "project:create", "project:delete", "tenant:settings"],
};

/**
 * Verifies if the active session possesses the required permission
 */
export function hasPermission(session: UserSession | null, permission: Permission): boolean {
  if (!session) return false;
  const userPermissions = ROLE_PERMISSIONS[session.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Asserts permission or throws an explicit Authorization Error
 */
export function assertPermission(session: UserSession | null, permission: Permission): void {
  if (!hasPermission(session, permission)) {
    throw new Error(`Forbidden: Access denied. Missing permission: ${permission}`);
  }
}
```

---

## Enforcing Tenant Isolation in the Data Access Layer (DAL)

To prevent cross-tenant data leaks in multi-tenant SaaS applications, **every database query must include the tenant ID extracted from the authenticated user's session token**.

### Practical Example: Tenant-Guarded DAL Mutation

```typescript
// lib/dal/projects-authz.ts
import "server-only";

import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/permissions";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/lib/db/models";

export async function deleteProjectById(projectId: string): Promise<boolean> {
  // 1. Authoritative Session Inspection
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: Active session required.");
  }

  // 2. Role-Based Permission Check
  assertPermission(session, "project:delete");

  await dbConnect();

  // 3. Strict Tenant-Isolated Query (Prevents IDOR)
  // Query requires BOTH the target _id AND tenantId matching session.tenantId
  const result = await ProjectModel.deleteOne({
    _id: projectId,
    tenantId: session.tenantId, // Guarantees user cannot delete another tenant's project!
  });

  if (result.deletedCount === 0) {
    throw new Error("Forbidden: Project not found or access denied.");
  }

  return true;
}
```

---

## Securing Server Actions with Authorization Guards

Never assume that because a UI button is hidden from non-admin users, the underlying Server Action is secure. Attackers can call Server Actions directly over HTTP.

```typescript
// app/actions/admin-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { deleteProjectById } from "@/lib/dal/projects-authz";

export async function deleteProjectServerAction(projectId: string) {
  try {
    // DAL executes authorization check and tenant isolation query
    await deleteProjectById(projectId);

    revalidatePath("/dashboard/projects");
    return { success: true, message: "Project deleted successfully." };
  } catch (err: any) {
    console.error("Authorization Error in deleteProjectServerAction:", err.message);
    return {
      success: false,
      message: err.message.includes("Forbidden")
        ? err.message
        : "Failed to delete project.",
    };
  }
}
```

---

## Authorization Strategy Matrix

| Layer | Responsibility | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Client UI Layer** | Hides/shows UI buttons based on user role (UX convenience only) | `if (hasPermission(session, 'project:delete')) <DeleteButton />` |
| **Server Component Route** | Prevents rendering route views if user lacks permission | `if (!hasPermission(session, 'project:read')) redirect('/unauthorized')` |
| **Server Action / API** | Authoritative gatekeeper verifying user permissions on mutation | `assertPermission(session, 'project:delete')` inside action body |
| **Database Access Layer (DAL)** | Hardcoded tenant ID and record ownership query filter | `Model.findOne({ _id: id, tenantId: session.tenantId })` |

---

## Common Mistakes

1. **Relying on Client-Side UI Hiding for Security**: Hiding the "Delete Project" button in React UI without enforcing authorization checks inside `deleteProjectServerAction`.
   - *Security Vulnerability*: Anyone inspecting browser network tools can invoke the Server Action HTTP endpoint directly.
2. **Missing Tenant ID Filters in Database Queries**: Executing `ProjectModel.findById(id)` instead of `ProjectModel.findOne({ _id: id, tenantId: session.tenantId })`.
   - *Security Risk*: Creates IDOR vulnerabilities where users from Tenant A can view or edit records belonging to Tenant B by guessing ID strings.
3. **Role Escalation via Unsanitized Form Submissions**: Allowing users to send `role: "ADMIN"` in user profile update form payloads without restricting editable fields on the server.

---

## Production Considerations

- **Audit Logging for Authorization Failures**: Log all rejected authorization attempts (`Forbidden: Access denied`) to security log streams (e.g. CloudWatch, Datadog) to alert security teams to potential automated IDOR probing.
- **Principle of Least Privilege**: Default user accounts to minimal permission scopes, requiring explicit role grants for elevated administrative actions.
- **Unit Testing Authorization Boundaries**: Write automated unit tests attempting to perform cross-tenant data operations and verify that the DAL rejects unauthorized operations with explicit errors.

---

## Summary

Authorization defines security boundaries in Next.js 16 applications. By enforcing Role-Based Access Control (RBAC), scoping database queries strictly by session tenant IDs, and performing authoritative checks inside Server Actions and the Data Access Layer, you protect user data against unauthorized access and IDOR exploits.

---

## Checklist
- [ ] Enforced authoritative session and role verification inside every Server Action and DAL function.
- [ ] Appended `tenantId: session.tenantId` to all database read, update, and delete queries.
- [ ] Treated UI button hiding as UX convenience, never as security enforcement.
- [ ] Tested API and Server Action endpoints against IDOR cross-tenant access attempts.
- [ ] Logged unauthorized access attempts to security monitoring systems.
