# Chapter 8: Composition Patterns

*Part II — React Architecture*

---

## Learning Objectives
- Design resilient React 19 component trees that seamlessly combine Server Components and Client Components in Next.js 16.
- Implement the "Server Component as Children/Slots" composition pattern to embed server data trees inside interactive client wrappers.
- Configure global Context Providers in the App Router without converting route trees into Client Components.
- Manage props serialization boundaries and serialize complex backend entities across server-client interfaces.
- Avoid architectural pitfalls such as client boundary leaks, waterfall rendering, and context bloat.

---

## Overview & Core Explanation

In Next.js 16, combining React Server Components (RSC) and Client Components effectively requires mastering **composition patterns**.

Rather than viewing Server and Client Components as isolated paradigms, production applications structure them as an integrated component tree where:
- **Server Components** serve as the backbone for layout structure, data fetching, authorization, and secret access.
- **Client Components** serve as interactive islands (leaf nodes) handling local state, DOM events, and browser APIs.

```
                  App Layout (Server)
                         │
      ┌──────────────────┴──────────────────┐
      │                                     │
Header / Nav (Server)                Sidebar (Server)
      │                                     │
      └──────────────────┬──────────────────┘
                         │
            Dashboard Container (Server)
                         │
        ┌────────────────┴────────────────┐
        │                                 │
Interactive Tabs Shell (Client)      Analytics Feed (Server - Passed as Children Slot)
```

---

## The Key Composition Rule: Server Content as Slots / Children

A fundamental rule of React Server Components is:
> **You cannot import a Server Component directly into a Client Component file.**

If you import a Server Component file inside a file marked with `"use client"`, Next.js treats the imported module as a Client Component. It will execute on the client, losing access to backend resources and failing if it imports `server-only` modules.

### Pattern 1: Interleaving via `children` / Slots (Recommended)

To render a Server Component inside a Client Component wrapper, pass the Server Component as a React `children` prop (or named ReactNode slot) from a parent Server Component.

```typescript
// app/_components/collapsible-panel.tsx (Client Component Wrapper)
"use client";

import { useState, ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode; // Server Component content passed as serialized slot
}

export function CollapsiblePanel({ title, children }: PanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="font-semibold text-lg">{title}</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}
```

```typescript
// app/dashboard/projects/page.tsx (Server Component Page)
import { fetchProjectMetrics } from "@/lib/projects";
import { CollapsiblePanel } from "@/app/_components/collapsible-panel";

export default async function ProjectsPage() {
  // Direct server database query
  const metrics = await fetchProjectMetrics();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Telemetry</h1>

      {/* Composition: Server Page renders CollapsiblePanel (Client) and passes server rendered metrics as children */}
      <CollapsiblePanel title="Realtime Server Metrics">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.id} className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>
      </CollapsiblePanel>
    </main>
  );
}
```

---

## Context Providers in the App Router

React Context (`React.createContext`) requires client runtime state, so Context Providers must be Client Components (`"use client"`).

A common architecture mistake is placing `"use client"` at the top of root `app/layout.tsx` to provide global theme or session context. Doing this forces every layout, page, and component in the application to render as a Client Component!

### Correct Pattern: Isolated Client Provider Wrappers

Create isolated Client Provider components that wrap `children`.

```typescript
// app/_providers/theme-provider.tsx (Isolated Client Provider)
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {}
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark bg-slate-900 text-white" : "bg-white text-slate-900"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

```typescript
// app/layout.tsx (Server Component Root Layout)
import { ThemeProvider } from "./_providers/theme-provider";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ThemeProvider wraps children as a slot; RootLayout remains a Server Component! */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Composition Decision Matrix

| Composition Scenario | Architectural Approach | Result |
| :--- | :--- | :--- |
| **Server data inside interactive drawer / modal** | Pass Server Component as `children` slot to Client Drawer wrapper | Server data fetched on server; drawer manages open/close state. |
| **Global Theme / UI Context** | Wrap `children` with an isolated Client Provider in root layout | Root layout remains an async Server Component; context available to leaves. |
| **Form with client validation and server submission** | Client Component form invoking a Server Action (`'use server'`) | Progressive enhancement, minimal bundle size, secure mutation. |
| **Interactive chart powered by DB query** | Server Component fetches DB data, serializes JSON, passes to Client Chart | 0 DB/driver bytes in client bundle; chart renders interactive canvas. |

---

## Props Serialization Across Composition Boundaries

When a Server Component renders a Client Component, props passed across the server-client boundary must be **serializable by React 19**.

### Serialization Rules

```typescript
// SERVER COMPONENT (app/projects/page.tsx)
import { getRawProjectDoc } from "@/lib/db";
import { ProjectCard } from "./_components/project-card";

export default async function ProjectsPage() {
  const rawDoc = await getRawProjectDoc(); // Custom database object (e.g. Mongoose Document)

  // BAD: Passing raw database document causes React serialization error!
  // <ProjectCard project={rawDoc} />

  // GOOD: Sanitize and convert backend entities to plain serializable primitives
  const serializableProject = {
    id: String(rawDoc._id),
    title: String(rawDoc.title),
    budget: Number(rawDoc.budget),
    createdAt: rawDoc.createdAt.toISOString() // Date object converted to ISO string
  };

  return <ProjectCard project={serializableProject} />;
}
```

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

1. **Directly Importing Server Components into Client Components**:
   - *Problem*: `import { ServerFeed } from './server-feed'` inside a `"use client"` file converts `ServerFeed` into a Client Component, causing build errors if it references `server-only` packages or environment secrets.
   - *Fix*: Pass `ServerFeed` as `children` or a slot from a parent Server Component.
2. **Declaring Root Layouts as Client Components**:
   - *Problem*: Adding `"use client"` to `app/layout.tsx` so `usePathname()` or `useState()` can be used globally.
   - *Fix*: Move the interactive state or pathname check into a dedicated child Client Component header or provider.
3. **Passing Non-Serializable Callbacks across Boundaries**:
   - *Problem*: Passing server-side functions (e.g., `onSave={(val) => db.save(val)}`) directly as a prop to a Client Component.
   - *Fix*: Export a designated Server Action (`'use server'`) and pass or import the action function.

---

## Production Considerations

- **Slot Granularity**: When using slot composition, separate fast-rendering server wrappers from heavy asynchronous data components using Suspense boundaries.
- **Security Boundaries**: Never pass un-redacted backend database objects (which may contain `passwordHash`, `apiTokens`, or internal IDs) across props boundaries. Clean payload fields in your Server Data Access Layer (DAL).
- **TypeScript Interface Rigor**: Define explicit TypeScript interfaces for all props passed to Client Components, ensuring proper typing for ISO date strings and serialized identifiers.

---

## Summary

Mastering composition patterns allows you to build sophisticated App Router applications that maximize server performance while providing rich client interactivity. By leveraging slots (`children`), isolating context providers, sanitizing props serialization, and keeping layout roots as Server Components, you maintain a clean, high-performance architecture in Next.js 16.

---

## Checklist
- [ ] Confirmed Client Components do not directly import Server Component modules.
- [ ] Used `children` or slot props to render server data inside client modals, drawers, or containers.
- [ ] Isolated Context Providers inside dedicated `"use client"` wrapper components.
- [ ] Preserved `app/layout.tsx` and `app/page.tsx` as Server Components.
- [ ] Sanitized and serialized all backend data objects before passing them across server-client boundaries.
