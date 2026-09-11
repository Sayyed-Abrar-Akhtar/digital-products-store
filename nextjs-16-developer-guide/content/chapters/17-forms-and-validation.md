# Chapter 17: Forms and Validation

*Part IV — Production UI*

---

## Learning Objectives
- Design production forms in Next.js 16 using **Server Actions** and **Zod schema validation**.
- Enable **Progressive Enhancement**, ensuring form submissions succeed even if client JavaScript fails or is disabled.
- Map complex Zod validation issues directly to granular field-level form inputs.
- Combine client-side pre-validation UX with authoritative server-side security checks.
- Prevent common security risks such as mass assignment, unvalidated payload execution, and prototype pollution.

---

## Overview & Core Explanation

Forms are the primary interactive entry point for user input in web applications. In Next.js 16, form handling is powered by React 19 Server Actions and standard HTML native elements.

### The Dual-Layer Validation Principle
1. **Client Layer (UX Convenience)**: Optional browser/JavaScript checks that provide immediate feedback as the user types, improving perceived responsiveness.
2. **Server Layer (Authoritative Security)**: **Mandatory** server execution using Zod schemas inside the Server Action. Never trust data coming from the client browser.

```
Client Form Submit (Progressive Enhancement)
       │
       ├─► [Optional] Client JS validates inputs instantly
       │
       ▼  [HTTP POST via Action Pipeline]
Server Action ('use server')
       │
       ├─► 1. Verifies Authentication Session
       │
       ├─► 2. Zod Schema parse / safeParse
       │      ├── If Invalid ──► Returns Field Errors Map to Client
       │      └── If Valid   ──► Proceeds to Database Mutation
       │
       └─► 3. Calls revalidatePath() & Returns Success Message
```

---

## Defining a Type-Safe Zod Validation Schema

Zod allows you to declare runtime validation rules alongside TypeScript types.

```typescript
// lib/validation/project-schema.ts
import { z } from "zod";

export const CreateProjectSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Project title must be at least 3 characters long." })
    .max(80, { message: "Project title cannot exceed 80 characters." }),
  key: z
    .string()
    .regex(/^[A-Z0-9]{2,6}$/, {
      message: "Project key must be 2 to 6 uppercase alphanumeric characters (e.g. ACME, TEL1).",
    }),
  budget: z
    .coerce
    .number()
    .min(100, { message: "Project budget must be at least $100." })
    .max(1000000, { message: "Project budget cannot exceed $1,000,000." }),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

---

## Server Action with Zod Validation Mapping

When Zod validation fails, `safeParse()` returns a structured `ZodError` instance. We format these issues into a field error map (`Record<string, string[]>`) returned to the Client Component form.

```typescript
// app/actions/validated-project-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CreateProjectSchema } from "@/lib/validation/project-schema";
import { dbConnect } from "@/lib/db";
import { ProjectModel } from "@/lib/db/models";

export interface FormActionState {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  fields?: {
    title?: string;
    key?: string;
    budget?: string;
  };
}

export async function submitProjectFormAction(
  prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  // Extract raw form entries
  const rawFields = {
    title: formData.get("title")?.toString() || "",
    key: formData.get("key")?.toString().toUpperCase() || "",
    budget: formData.get("budget")?.toString() || "",
  };

  // 1. Authoritative Zod Validation
  const result = CreateProjectSchema.safeParse(rawFields);

  if (!result.success) {
    // Flatten Zod error issues into a field error dictionary
    const formattedErrors = result.error.flatten().fieldErrors;

    return {
      success: false,
      message: "Validation failed. Please correct the fields below.",
      fieldErrors: formattedErrors,
      fields: rawFields, // Preserve input values so form is not wiped
    };
  }

  // 2. Auth Session Check
  const headerList = await headers();
  const userId = headerList.get("x-user-id");
  const tenantId = headerList.get("x-tenant-id");

  if (!userId || !tenantId) {
    return {
      success: false,
      message: "Unauthorized: Active session required to create projects.",
      fields: rawFields,
    };
  }

  try {
    await dbConnect();

    // 3. Database Mutation with Validated Data
    await ProjectModel.create({
      tenantId,
      name: result.data.title,
      key: result.data.key,
      budget: result.data.budget,
      status: "ACTIVE",
      createdBy: userId,
    });

    revalidatePath("/dashboard/projects");

    return {
      success: true,
      message: `Project "${result.data.title}" created successfully!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.code === 11000 ? "Project key already exists in tenant." : "Database operation failed.",
      fields: rawFields,
    };
  }
}
```

---

## Building the Progressive Form Component

Using React 19's `useActionState`, we bind the Server Action to an HTML form. Notice that because we use standard `<form action={formAction}>`, **this form functions seamlessly even if client JavaScript fails to load or is blocked by browser extensions**.

```typescript
// app/dashboard/projects/_components/validated-project-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitProjectFormAction, FormActionState } from "@/app/actions/validated-project-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-opacity disabled:opacity-50 text-sm"
    >
      {pending ? "Validating & Submitting..." : "Submit Project"}
    </button>
  );
}

const initialState: FormActionState = {
  success: false,
  message: "",
};

export function ValidatedProjectForm() {
  const [state, formAction] = useActionState(submitProjectFormAction, initialState);

  return (
    <form action={formAction} className="p-6 bg-card border rounded-xl shadow-sm space-y-4 max-w-lg">
      <h2 className="text-xl font-bold">New Project Creation</h2>

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

      {/* Field: Title */}
      <div className="space-y-1">
        <label htmlFor="title" className="text-xs font-semibold text-muted-foreground">
          Project Name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={state.fields?.title}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {state.fieldErrors?.title && (
          <p className="text-xs text-destructive font-medium">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      {/* Field: Key */}
      <div className="space-y-1">
        <label htmlFor="key" className="text-xs font-semibold text-muted-foreground">
          Project Key (2–6 Uppercase Chars)
        </label>
        <input
          id="key"
          name="key"
          type="text"
          defaultValue={state.fields?.key}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background uppercase focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {state.fieldErrors?.key && (
          <p className="text-xs text-destructive font-medium">{state.fieldErrors.key[0]}</p>
        )}
      </div>

      {/* Field: Budget */}
      <div className="space-y-1">
        <label htmlFor="budget" className="text-xs font-semibold text-muted-foreground">
          Initial Budget ($ USD)
        </label>
        <input
          id="budget"
          name="budget"
          type="number"
          defaultValue={state.fields?.budget}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        {state.fieldErrors?.budget && (
          <p className="text-xs text-destructive font-medium">{state.fieldErrors.budget[0]}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
```

---

## Form Validation Matrix

| Layer | Responsibility | Technology | Consequence of Failure |
| :--- | :--- | :--- | :--- |
| **HTML Native Validation** | Instant browser input checks (`required`, `type="number"`, `pattern`) | Browser HTML5 primitives | Prevents form submission before network call. |
| **Client JS Validation** | Real-time feedback as user types | React state / Zod | Displays inline helper messages instantly. |
| **Server Action Validation** | Authoritative security enforcement | Zod (`safeParse()`) | Blocks malicious or malformed payloads; returns field error map. |
| **Database Constraint** | Unique index enforcements | MongoDB Unique Index | Catches race conditions and duplicate key collisions. |

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

1. **Relying Exclusively on Client-Side Validation**: Validating input in a Client Component form but omitting Zod validation inside the Server Action.
   - *Security Risk*: Attackers can bypass browser JS validation by posting payloads directly to the Server Action HTTP endpoint.
2. **Wiping User Form Inputs on Validation Errors**: Returning blank form state when validation fails, forcing the user to re-type all fields.
   - *Fix*: Return `fields` state in `FormActionState` and pass `defaultValue={state.fields?.title}` to form inputs.
3. **Using Uncoerced Zod Types for FormData**: Defining `z.number()` without `z.coerce.number()`. Standard HTML `FormData.get()` returns string primitives, causing `safeParse()` to reject numbers.

---

## Production Considerations

- **Sanitization**: Trim white space and sanitize raw string inputs before schema validation to prevent accidental leading/trailing spaces from entering the database.
- **CSRF Protection**: HTML forms invoking Server Actions automatically send Next.js Action tokens and origin headers, preserving built-in CSRF security.
- **Accessibility**: Associate error message elements with input fields using `aria-describedby="title-error"` and `aria-invalid={!!state.fieldErrors?.title}` to support screen readers.

---

## Summary

Form handling in Next.js 16 combines React 19 Server Actions with Zod schema validation. By enforcing authoritative server-side validation, mapping field-level errors, preserving user input state, and supporting progressive enhancement, you deliver resilient and secure form experiences.

---

## Checklist
- [ ] Defined explicit Zod validation schemas for all form inputs.
- [ ] Validated raw FormData inside Server Actions using `safeParse()`.
- [ ] Mapped Zod validation error issues to field-level error messages in form UI.
- [ ] Preserved form input values upon validation failure using default values.
- [ ] Supported progressive enhancement via standard HTML form elements.
