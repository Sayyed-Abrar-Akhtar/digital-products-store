# Chapter 7: Client Components

*Part II — React Architecture*

---

## Learning Objectives
- Master the `"use client"` directive, boundary semantics, and module tree execution rules in Next.js 16 (target 16.3.4).
- Understand the full lifecycle of Client Components from server SSR pre-rendering to browser DOM hydration.
- Utilize React 19 interactive hooks (`useActionState`, `useFormStatus`, `useOptimistic`, `use`) within client interactive nodes.
- Prevent server-client hydration mismatches caused by browser APIs, timestamps, or un-synchronized local storage.
- Optimize client bundle size by pushing `"use client"` directives down to the leaf node level.

---

## Overview & Core Explanation

In Next.js 16 App Router architecture, components default to React Server Components (RSC). To create interactive user interfaces that handle browser DOM events, manage local state, or interact with browser APIs, you explicitly opt in by placing the `"use client"` directive at the very top of a component file.

The term **Client Component** is frequently misunderstood. A Client Component is **not** rendered solely in the user's browser. Instead:
1. **Server Phase (SSR Pre-rendering)**: On initial page request, Next.js pre-renders Client Components into static HTML on the server alongside Server Components.
2. **Network Phase**: Next.js sends the pre-rendered HTML and the Client Component's JavaScript bundle to the browser.
3. **Hydration Phase**: In the browser, React loads the JavaScript bundle and "hydrates" the DOM—attaching event listeners (`onClick`, `onChange`) and initializing state hooks (`useState`, `useReducer`).

```
Server Request
   │
   ├─► 1. Server Pre-renders HTML (Server Components + Client Components HTML)
   │
   ├─► 2. Browser receives HTML + Client JS Bundle
   │
   └─► 3. React Hydrates Client Components in Browser (Attaches event handlers & state)
```

### The Boundary Rule & Implied Context
When you place `"use client"` at the top of a file, every module imported into that file automatically becomes part of the client bundle. The directive marks a **boundary** between the server runtime and the client runtime.

```typescript
// app/_components/search-bar.tsx
"use client";

import { useState } from "react";
import { formatSearchQuery } from "@/lib/formatters"; // Implied as part of client bundle!

export function SearchBar() {
  const [query, setQuery] = useState("");
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search projects..."
      className="px-3 py-2 border rounded-md"
    />
  );
}
```

---

## When to Use Client Components (Decision Matrix)

| Feature / Requirement | Component Choice | Rationale |
| :--- | :--- | :--- |
| Rendering static text, articles, or UI wrappers | **Server Component** | 0 KB client JS sent; maximum performance. |
| Fetching data directly from database or ORM | **Server Component** | Backend credentials remain safe on the server. |
| Handling DOM click/change events (`onClick`) | **Client Component** | Browsers require event listeners attached to DOM nodes. |
| Using React state hooks (`useState`, `useReducer`) | **Client Component** | Interactive state relies on client runtime memory. |
| Accessing browser APIs (`window`, `localStorage`) | **Client Component** | Browser globals do not exist in Node.js server execution. |
| Triggering React 19 optimistic updates (`useOptimistic`) | **Client Component** | Instant client UI feedback before server mutation resolves. |

---

## Practical Example

In our reference application (**Acme App**), we implement an interactive project status filter bar using React 19 client state and URL navigation hooks (`useRouter`, `useSearchParams`, `usePathname`).

```typescript
// app/dashboard/projects/_components/status-filter.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type ProjectStatus = "ALL" | "ACTIVE" | "ARCHIVED" | "COMPLETED";

const STACK_STATUSES: ProjectStatus[] = ["ALL", "ACTIVE", "ARCHIVED", "COMPLETED"];

export function StatusFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: ProjectStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status.toLowerCase());
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center space-x-2 my-4">
      <span className="text-sm font-medium text-muted-foreground">Filter:</span>
      {STACK_STATUSES.map((status) => {
        const isActive =
          (status === "ALL" && !searchParams.get("status")) ||
          searchParams.get("status") === status.toLowerCase();

        return (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={isPending}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
```

---

## React 19 Client Hooks in Action

React 19 introduces modernized form interaction hooks that simplify working with dynamic UI states in Client Components.

### 1. `useActionState`
Handles asynchronous Server Actions and returns pending states along with server response data.

```typescript
"use client";

import { useActionState } from "react";
import { updateProjectTitle } from "@/app/actions/project-actions";

export function EditTitleForm({ projectId, initialTitle }: { projectId: string; initialTitle: string }) {
  const [state, formAction, isPending] = useActionState(updateProjectTitle, {
    success: false,
    message: ""
  });

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="text"
        name="title"
        defaultValue={initialTitle}
        className="px-2 py-1 border rounded"
        required
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Title"}
      </button>
      {state.message && (
        <p className={`text-xs ${state.success ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

---

## Preventing Hydration Mismatches

A **hydration mismatch** occurs when the server pre-rendered HTML does not match the HTML output generated by React during initial browser hydration.

### Common Causes & Fixes

1. **Browser Globals (`window`, `navigator`, `localStorage`)**:
   - *Problem*: Referencing `window.innerWidth` during initial render outputs different HTML on server vs client.
   - *Fix*: Access browser APIs inside `useEffect` or check mounted state.

```typescript
// GOOD: Safe Client Component handling browser storage
"use client";

import { useState, useEffect } from "react";

export function LocalThemeToggle() {
  const [theme, setTheme] = useState<string>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  if (!mounted) {
    // Render neutral fallback matching server HTML during SSR
    return <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />;
  }

  return (
    <button onClick={() => {
      const next = theme === "light" ? "dark" : "light";
      setTheme(next);
      localStorage.setItem("theme", next);
    }}>
      Current Theme: {theme}
    </button>
  );
}
```

2. **Date & Timestamp Formatting**:
   - *Problem*: Calling `new Date().toLocaleTimeString()` renders different strings on the server timezone vs browser timezone.
   - *Fix*: Format dates using fixed ISO strings on the server or use dynamic suppress warnings (`suppressHydrationWarning`) strictly when localized time rendering is mandatory.

---

## Common Mistakes

1. **Placing `"use client"` at the Page Root**: Marking `app/dashboard/page.tsx` as `"use client"` converts the entire sub-tree into Client Components, preventing direct DB access and forcing heavy dependencies into browser bundles.
   - *Fix*: Keep page components as Server Components. Extract interactive controls (buttons, forms, modals) into small, dedicated Client Components.
2. **Importing Backend Modules into Client Files**: Trying to import database clients or server secrets into a Client Component.
   - *Fix*: Ensure database modules import `"server-only"` to catch illegal client imports at compile time.
3. **Directly Mutating Server Data in Event Handlers**: Attempting to call database methods directly from an `onClick` event handler.
   - *Fix*: Call React 19 Server Actions or Route Handlers via `fetch()` from event handlers.

---

## Production Considerations

- **Bundle Boundaries**: Use `@next/bundle-analyzer` to confirm that heavy client libraries (e.g., dynamic chart renderers) are lazy-loaded via `next/dynamic` with `{ ssr: false }` if they rely exclusively on browser canvas context.
- **Granular Hydration**: Keep Client Components as leaf nodes to maximize the proportion of server-rendered markup and minimize client JS parsing time.
- **Accessibility (a11y)**: Ensure interactive client elements (buttons, dialogs, tab controls) expose appropriate ARIA attributes (`aria-expanded`, `aria-controls`) and handle keyboard events (`Enter`, `Space`, `Escape`).

---

## Summary

Client Components in Next.js 16 provide interactive browser capabilities while retaining server SSR pre-rendering benefits. By applying `"use client"` strictly at leaf component boundaries, utilizing React 19 hooks, and preventing hydration mismatches, you achieve optimal user interactivity with minimal client JavaScript overhead.

---

## Checklist
- [ ] Marked interactive component files with `"use client"` at the top line.
- [ ] Kept page (`page.tsx`) and layout (`layout.tsx`) files as Server Components.
- [ ] Confirmed no database or secret modules are imported into Client Component files.
- [ ] Safely handled browser API access inside `useEffect` to prevent hydration mismatches.
- [ ] Leveraged React 19 hooks (`useActionState`, `useTransition`) for seamless client interactivity.
