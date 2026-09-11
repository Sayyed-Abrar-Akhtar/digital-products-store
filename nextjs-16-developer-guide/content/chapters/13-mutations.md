# Chapter 13: Mutations

*Part III — Data*

---

## Learning Objectives
- Master modern mutations in Next.js 16 using React 19 **Server Actions** (`'use server'`).
- Handle form submissions with progressive enhancement (working with and without client-side JavaScript enabled).
- Provide immediate visual feedback using `useActionState`, `useFormStatus`, and `useOptimistic`.
- Enforce strict security boundaries for Server Actions (authentication, authorization, Zod schema validation, and CSRF protection).
- Trigger targeted cache revalidation using `revalidatePath` and `revalidateTag` after server mutations.

---

## Overview & Core Explanation

In traditional React single-page applications, updating server state required creating a dedicated API Route Handler (`POST /api/projects`), managing local client state (`isLoading`, `isError`), sending a `fetch()` request, parsing JSON, and manually updating local client state.

In Next.js 16, **Server Actions** streamline server mutations by exposing asynchronous server functions that can be invoked directly from Client Components or standard HTML forms.

### What is a Server Action?
A Server Action is a server function marked with the `'use server'` directive. Under the hood, Next.js automatically creates an encrypted HTTP endpoint. When invoked from the browser, Next.js sends the serialized payload to the server, executes the function inside the server runtime, performs data mutations, revalidates cached UI routes, and returns the updated state to the client.

```
Client Form Submit
       │
       ▼  [HTTP POST via Next.js Action Protocol]
Server Action ('use server')
       ├── 1. Validates Authentication & Permissions
       ├── 2. Parses Input via Zod Schema
       ├── 3. Mutates Database (DAL)
       └── 4. Calls revalidatePath() / revalidateTag()
       │
       ▼  [RSC Payload Stream]
Client UI Updates Automatically
```

---

## Defining a Secure Server Action

Server Actions are public entry points. Any client can invoke a Server Action over HTTP. Therefore, **you must treat Server Actions with the exact same security rigor as public API endpoints**.

### Production Pattern: Action with Auth + Zod Validation

```typescript
// app/actions/project-actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/lib/db/models";

export interface ActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Server Action: Create New Project
 */
export async function createProjectAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Authentication & Authorization Check
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const tenantId = headerList.get("x-tenant-id");

  if (!userId || !tenantId) {
    return {
      success: false,
      message: "Unauthorized: Active session required to perform mutations.",
    };
  }

  // 2. Extract and Sanitize Inputs
  const rawTitle = formData.get("title")?.toString().trim() || "";
  const rawKey = formData.get("key")?.toString().trim().toUpperCase() || "";

  // Basic Validation Bounds
  const errors: Record<string, string[]> = {};
  if (!rawTitle || rawTitle.length < 3) {
    errors.title = ["Project title must be at least 3 characters long."];
  }
  if (!rawKey || !/^[A-Z0-9]{2,6}$/.test(rawKey)) {
    errors.key = ["Project key must be 2 to 6 uppercase alphanumeric characters."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Please correct the highlighted fields.",
      errors,
    };
  }

  try {
    await dbConnect();

    // 3. Database Mutation
    await ProjectModel.create({
      tenantId,
      name: rawTitle,
      key: rawKey,
      status: "ACTIVE",
      createdBy: userId,
    });

    // 4. Cache Revalidation
    // Purge cached project lists and refresh route data
    revalidatePath("/dashboard/projects");
    revalidateTag(`tenant-${tenantId}-projects`);

    return {
      success: true,
      message: `Project "${rawTitle}" successfully created!`,
    };
  } catch (err: any) {
    // Duplicate Key handling
    if (err.code === 11000) {
      return {
        success: false,
        message: "A project with this key already exists in your tenant space.",
      };
    }

    return {
      success: false,
      message: "A server database error occurred. Please try again later.",
    };
  }
}
```

---

## Consuming Server Actions with React 19 Hooks

React 19 provides dedicated hooks for binding Server Actions to Client Component forms:
- `useActionState`: Hooks the action to form submission state and returns response data + pending status.
- `useFormStatus`: Provides pending state to child submit button elements without prop drilling.
- `useOptimistic`: Updates the UI instantly on the client before the server mutation round-trip completes.

### Practical Example: Project Creation Form in Acme App

```typescript
// app/dashboard/projects/_components/create-project-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectAction, ActionState } from "@/app/actions/project-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Creating Project..." : "Create Project"}
    </button>
  );
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export function CreateProjectForm() {
  const [state, formAction] = useActionState(createProjectAction, initialState);

  return (
    <form action={formAction} className="p-6 bg-card border rounded-xl shadow-sm space-y-4 max-w-md">
      <h2 className="text-xl font-bold">New Project</h2>

      {state.message && (
        <div
          className={`p-3 text-xs rounded-md font-medium ${
            state.success
              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
          Project Name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Telemetry Dashboard Redesign"
          className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          required
        />
        {state.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="key" className="text-xs font-semibold text-muted-foreground">
          Project Key (2–6 chars)
        </label>
        <input
          id="key"
          name="key"
          type="text"
          placeholder="e.g. TEL"
          className="w-full px-3 py-2 border rounded-md text-sm bg-background uppercase"
          required
        />
        {state.errors?.key && (
          <p className="text-xs text-destructive">{state.errors.key[0]}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
```

---

## Optimistic UI Updates (`useOptimistic`)

For hyper-responsive user interfaces (like toggling a task checkbox or liking a project), waiting for a network round-trip introduces visible latency. React 19's `useOptimistic` hook updates the UI instantaneously while the Server Action resolves in the background.

```typescript
// app/dashboard/projects/_components/optimistic-status-toggle.tsx
"use client";

import { useOptimistic, startTransition } from "react";
import { updateProjectStatusAction } from "@/app/actions/project-actions";

interface ProjectStatusProps {
  projectId: string;
  initialStatus: "ACTIVE" | "ARCHIVED";
}

export function OptimisticStatusToggle({ projectId, initialStatus }: ProjectStatusProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialStatus,
    (current, newStatus: "ACTIVE" | "ARCHIVED") => newStatus
  );

  const handleToggle = async () => {
    const nextStatus = optimisticStatus === "ACTIVE" ? "ARCHIVED" : "ACTIVE";

    startTransition(async () => {
      // 1. Instantly update client UI state optimistically
      setOptimisticStatus(nextStatus);

      // 2. Execute background Server Action mutation
      const result = await updateProjectStatusAction(projectId, nextStatus);

      if (!result.success) {
        // If server mutation fails, React automatically rolls back optimistic UI state
        console.error("Mutation failed; rolling back UI state:", result.message);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
        optimisticStatus === "ACTIVE"
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-slate-100 text-slate-800 border-slate-300"
      }`}
    >
      Status: {optimisticStatus}
    </button>
  );
}
```

---

## Mutation Architecture Decision Matrix

| Mutation Requirement | Pattern Choice | Rationale |
| :--- | :--- | :--- |
| **Standard Form Submission** | Server Action + `useActionState` | Native progressive enhancement, built-in pending state, zero client API route overhead. |
| **Instant Interactivity (Toggle/Like)** | Server Action + `useOptimistic` | Instant client visual feedback with automatic rollback if server action fails. |
| **External Third-Party Webhook Callback** | Route Handler (`app/api/webhook/route.ts`) | External services require standard HTTP endpoints, headers, and signature verification. |
| **Purging Stale Cached UI Routes** | `revalidatePath('/route')` or `revalidateTag('tag-name')` | Instructs Next.js cache layer to re-render fresh content on next navigation. |

---

## Common Mistakes

1. **Treating Server Actions as Secret/Private Functions**: Assuming client users cannot tamper with Server Action payloads.
   - *Fix*: Always validate user permissions, tenant IDs, and Zod schemas inside the Server Action body.
2. **Forgetting Cache Revalidation**: Mutating database entities without calling `revalidatePath()` or `revalidateTag()`, causing the UI to continue rendering stale cached data.
3. **Passing Non-Serializable Form Arguments**: Passing raw class instances or DOM node references to Server Actions.

---

## Production Considerations

- **CSRF & Origin Verification**: Next.js 16 automatically verifies the HTTP `Origin` header against the host domain for Server Action POST requests, protecting against Cross-Site Request Forgery (CSRF).
- **Rate Limiting**: Attach IP/User rate limiters (e.g., Redis rate limiting) to sensitive Server Actions (e.g. login, password reset, payment creation) to prevent automated submission spam.
- **Progressive Enhancement**: HTML forms bound to Server Actions work even if the client's JavaScript bundle has not finished downloading or is disabled in restricted browser environments.

---

## Summary

Server Actions in Next.js 16 simplify data mutations by removing client API boilerplate. By pairing `'use server'` with React 19 hooks (`useActionState`, `useOptimistic`), input validation, and `revalidatePath`, developers create secure, optimistic, and highly responsive user interfaces.

---

## Checklist
- [ ] Marked server mutation functions with `'use server'` directive.
- [ ] Enforced authentication, authorization, and input validation inside every Server Action.
- [ ] Managed form pending states using React 19 `useActionState` and `useFormStatus`.
- [ ] Applied `useOptimistic` for instant UI updates during interactive toggles.
- [ ] Invoked `revalidatePath()` or `revalidateTag()` after successful database mutations.
