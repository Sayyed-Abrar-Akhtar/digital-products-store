# Chapter 18: Accessibility

*Part IV — Production UI*

---

## Learning Objectives
- Ensure Next.js 16 App Router applications comply with **WCAG 2.1 Level AA** accessibility standards.
- Build semantic HTML landmark structures using React Server Components.
- Implement ARIA roles, states, and keyboard focus management in interactive Client Components.
- Implement skip-navigation links and accessible route transition announcements.
- Avoid accessibility pitfalls such as inaccessible modals, missing alt text, and hidden focus indicators.

---

## Overview & Core Explanation

Accessibility (a11y) is a mandatory requirement for production web applications. Accessible applications ensure that people with disabilities—including screen reader users, keyboard-only navigators, and individuals with visual or motor impairments—can perceive, navigate, and interact with your digital product.

In Next.js 16, accessibility is built across both component runtimes:
- **Server Component Layer**: Emits semantic HTML5 landmark tags (`<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`) that screen readers use to map document outline trees.
- **Client Component Layer**: Manages interactive ARIA states (`aria-expanded`, `aria-selected`, `aria-hidden`), handles focus trapping inside modal dialogs, and manages keyboard event listeners (`Tab`, `Enter`, `Escape`, Arrow keys).

```
Document Navigation Outline (Server HTML)
├── <header> -> <nav aria-label="Primary Navigation">
├── <main id="main-content">
│     ├── <section aria-labelledby="projects-heading">
│     │     ├── <h1 id="projects-heading">
│     │     └── Interactive Modal Drawer (Client Component)
│     │           ├── role="dialog"
│     │           ├── aria-modal="true"
│     │           └── Focus Trapped on Open
└── <footer>
```

---

## Skip Navigation Links for Keyboard Users

Keyboard-only users navigate web pages using the `Tab` key. For pages with large navigation headers, forcing users to tab through dozens of navigation links before reaching main page content is frustrating.

Add an accessible **Skip Link** in your root layout (`app/layout.tsx`).

```typescript
// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {/* Skip Link: Hidden visually until focused via Keyboard Tab */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to main content
        </a>

        <header className="border-b px-6 py-4">
          <nav aria-label="Main Navigation">
            {/* Header Links */}
          </nav>
        </header>

        {/* Main Content Landmark Target */}
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
```

---

## Accessible Interactive Dialog / Drawer Component

When an interactive modal dialog opens, WCAG guidelines require:
1. Setting `role="dialog"` and `aria-modal="true"`.
2. Associating the dialog with heading labels using `aria-labelledby` and `aria-describedby`.
3. Trapping focus inside the modal so tabbing does not escape to background elements.
4. Closing the dialog when the user presses the `Escape` key.

### Practical Example: Accessible Drawer in Acme App

```typescript
// app/_components/accessible-drawer.tsx
"use client";

import { useEffect, useRef, ReactNode } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function AccessibleDrawer({ isOpen, onClose, title, children }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // 1. Focus Management & Keydown Listener
  useEffect(() => {
    if (!isOpen) return;

    // Move focus to close button when drawer opens
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Accessible Dialog Shell */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative z-10 w-full max-w-md bg-background border-l shadow-xl p-6 flex flex-col h-full focus:outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 id="drawer-title" className="text-lg font-bold">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-muted-foreground hover:text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
```

---

## Accessible Form Field Controls

Every form input element must be programmatically connected to a visible `<label>` element using matching `id` and `htmlFor` attributes.

```typescript
// components/ui/accessible-input.tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ id, label, error, hint, ...props }, ref) => {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const ariaDescribedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="space-y-1">
        <label htmlFor={id} className="block text-xs font-semibold text-foreground">
          {label}
        </label>

        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}

        <input
          id={id}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-destructive"
          {...props}
        />

        {error && (
          <p id={errorId} className="text-xs text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";
```

---

## Accessibility Audit Checklist (WCAG 2.1 AA)

| Area | Rule / Requirement | Implementation Pattern |
| :--- | :--- | :--- |
| **Landmarks** | Page contains `header`, `nav`, `main`, `footer` | Semantic HTML tags in layout components. |
| **Keyboard Focus** | Visible focus indicators on interactive elements | `focus-visible:ring-2 focus-visible:ring-primary` Tailwind utility. |
| **Images** | Non-decorative images have descriptive `alt` text | `<Image src="..." alt="Telemetry bandwidth chart" />` |
| **Color Contrast** | Text meets 4.5:1 contrast ratio against background | Design tokens configured using HSL variables meeting contrast ratios. |
| **Form Labels** | Inputs programmatically linked to labels | `label htmlFor="input-id"` matched with `input id="input-id"`. |
| **Dialogs & Modals** | Dialog traps focus and closes on `Escape` key | `role="dialog"`, `aria-modal="true"`, focus refs. |

---

## Common Mistakes

1. **Using Non-Interactive Elements for Click Handlers**: Attaching `onClick` handlers to `<div>` or `<span>` elements without adding `tabIndex={0}`, `role="button"`, and keyboard handlers (`onKeyDown`).
   - *Fix*: Use native `<button>` elements for interactive actions.
2. **Removing Focus Outlines with `outline-none` Without Replacement**: Removing default browser focus rings without adding a custom focus ring (`focus-visible:ring-2`).
3. **Icon-Only Buttons Without Labels**: Creating `<button><SearchIcon /></button>` without `aria-label="Search"`, rendering the button completely anonymous to screen readers.

---

## Production Considerations

- **Automated Testing Integration**: Integrate `@axe-core/playwright` or `eslint-plugin-jsx-a11y` into CI build workflows to automatically catch missing alt attributes, duplicate IDs, or missing form labels.
- **Screen Reader Announcements**: Use `aria-live="polite"` regions to announce asynchronous status updates (such as project creation success messages) to screen reader users without stealing focus.
- **High Contrast Support**: Test applications with system high-contrast modes enabled (`forced-colors: active`) to verify border visibility on focusable elements.

---

## Summary

Accessibility is a core engineering discipline in Next.js 16 development. By constructing semantic HTML landmark structures, managing keyboard focus and ARIA states in interactive Client Components, and validating WCAG standards, you create inclusive software accessible to all users.

---

## Checklist
- [ ] Included a Skip Navigation link at the top of the root layout (`app/layout.tsx`).
- [ ] Used semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<footer>`) for page landmarks.
- [ ] Ensured all interactive `<button>` elements feature accessible text or `aria-label` tags.
- [ ] Implemented `role="dialog"`, `aria-modal="true"`, and `Escape` key handlers on modal drawers.
- [ ] Confirmed all focusable elements display visible focus indicators on keyboard tabbing.
