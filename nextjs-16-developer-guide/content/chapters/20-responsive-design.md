# Chapter 20: Responsive Design

*Part IV — Production UI*

---

## Learning Objectives
- Design mobile-first responsive interfaces in Next.js 16 using Tailwind CSS breakpoints and CSS Container Queries.
- Configure viewport metadata using Next.js 16's explicit `export const viewport` configuration object.
- Differentiate between CSS responsive layout shifts (zero JS) vs viewport-dependent client rendering.
- Build responsive mobile navigation drawers and accessible data tables.
- Optimize touch target sizing and mobile touch interaction targets (44x44px minimum).

---

## Overview & Core Explanation

Responsive design ensures that web applications deliver an optimal user experience across every device screen size—from small mobile smartphones (320px width) to ultra-wide desktop monitors (2560px width).

In Next.js 16, responsive architecture follows two distinct approaches:

1. **CSS Responsive Layouts (Server First - Preferred)**: Using fluid Tailwind grid/flex utilities (`grid-cols-1 md:grid-cols-3`) and container queries (`@container`). The server emits a single HTML stream, and the browser's CSS layout engine reflows elements dynamically without running JavaScript.
2. **Dynamic Client Viewport Adaptations**: Using client hooks (`useMediaQuery`) strictly when mobile and desktop viewports require fundamentally different React component DOM structures (such as rendering a simple native selector on mobile vs a complex multi-column filter drawer on desktop).

```
Server Output (Single HTML Stream)
   │
   ├─► Mobile Viewport (375px): CSS reflows grid to 1 column; navigation collapses to drawer
   │
   └─► Desktop Viewport (1440px): CSS reflows grid to 3 columns; sidebar renders inline
```

---

## Viewport Configuration (`export const viewport`)

Next.js 16 decouples viewport parameters (such as `width`, `initialScale`, `themeColor`) from metadata into a dedicated `export const viewport` object export inside `layout.tsx` or `page.tsx`.

```typescript
// app/layout.tsx
import type { Viewport } from "next";

/**
 * Next.js 16 Viewport Configuration
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};
```

---

## Mobile-First Grid & Flexbox Patterns

Always write utility classes targeting small mobile screens first, and add breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) to introduce desktop layout complexity.

### Practical Example: Responsive Dashboard Grid in Acme App

```typescript
// app/dashboard/projects/_components/responsive-project-grid.tsx
import { ProjectDTO } from "@/lib/dal/projects";

interface GridProps {
  projects: ProjectDTO[];
}

export function ResponsiveProjectGrid({ projects }: GridProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold tracking-tight">Active Projects</h2>
        <span className="text-xs font-medium text-muted-foreground">
          Showing {projects.length} entities
        </span>
      </div>

      {/* Mobile-first grid: 1 column on mobile, 2 columns on tablet (md), 3 columns on desktop (lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-secondary rounded">
                  {p.key}
                </span>
                <span className="text-xs text-muted-foreground">{p.status}</span>
              </div>
              <h3 className="font-semibold text-base leading-snug">{p.name}</h3>
            </div>

            <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {p.createdAt.slice(0, 10)}</span>
              <button className="min-h-[44px] min-w-[44px] text-primary font-medium hover:underline flex items-center justify-center">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

## Component-Level Responsive Design with CSS Container Queries

Standard media queries (`@media (min-width: 768px)`) adapt layouts based on the **browser window width**. However, when building reusable UI components placed inside variable-width sidebar drawers or main page areas, component layout should adapt based on the **parent container width**.

Tailwind CSS supports CSS Container Queries via `@container` utility markers.

```typescript
// components/ui/container-card.tsx
export function ContainerCard({ title, stats }: { title: string; stats: string }) {
  return (
    // Mark parent wrapper as a container
    <div className="@container border rounded-xl p-4 bg-card">
      {/* Reflow flex direction based on CONTAINER width rather than browser window width */}
      <div className="flex flex-col @[300px]:flex-row @[300px]:items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Component Metric</p>
          <h4 className="font-bold text-lg">{title}</h4>
        </div>
        <span className="text-xl font-mono font-extrabold text-primary @[300px]:text-2xl">
          {stats}
        </span>
      </div>
    </div>
  );
}
```

---

## Responsive Design Decision Matrix

| Requirement | Responsive Strategy | Implementation |
| :--- | :--- | :--- |
| **Grid / Layout Reflow** | Mobile-first Tailwind breakpoints | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |
| **Reusable Widget Adaptation** | CSS Container Queries | `@container` parent + `@[400px]:flex-row` child utilities. |
| **Mobile Navigation Toggle** | Client Component Drawer | Sheet / Drawer hidden on desktop (`hidden md:block`). |
| **Mobile Table Formatting** | Responsive Overflow / Card Switch | Wrap table in `overflow-x-auto` or switch to stacked card view on mobile. |
| **Touch Interaction Sizing** | Minimum 44x44px touch targets | `min-h-[44px] min-w-[44px]` on buttons and links. |

---

## Common Mistakes

1. **Desktop-First Class Writing**: Writing `w-1/3` and attempting to fix mobile with `max-sm:w-full`.
   - *Fix*: Always write mobile-first: `w-full md:w-1/3`.
2. **Hardcoding Non-Responsive Pixel Widths**: Using `w-[800px]` on container elements, breaking viewport boundaries on mobile screens and triggering horizontal scrollbars.
   - *Fix*: Use max-width utilities (`max-w-4xl w-full mx-auto px-4`).
3. **Pinch-To-Zoom Restriction**: Disabling viewport zoom using `user-scalable=no` in viewport metadata, violating WCAG accessibility guidelines.

---

## Production Considerations

- **Touch Target Auditing**: Ensure interactive elements (buttons, nav links, pagination numbers) meet the WCAG minimum touch target size of 44x44 pixels on mobile viewports.
- **Horizontal Scroll Prevention**: Test routes at 320px viewport width using Chrome DevTools to verify that no code blocks, wide tables, or un-constrained images cause horizontal page overflow.
- **Table Responsive Patterns**: For complex data tables, render a horizontal scrolling wrapper (`overflow-x-auto`) or transform table rows into stacked card layouts on small mobile viewports.

---

## Summary

Responsive design in Next.js 16 leverages mobile-first CSS breakpoints, container queries, and explicit viewport configurations. By prioritizing CSS-driven layouts over JavaScript runtime viewport listeners, you deliver fast, touch-friendly, and visually flawless interfaces across all screen sizes.

---

## Checklist
- [ ] Exported explicit `viewport` configuration object in `app/layout.tsx`.
- [ ] Built layouts using mobile-first Tailwind CSS utility classes (`grid-cols-1 md:grid-cols-3`).
- [ ] Leveraged CSS Container Queries (`@container`) for reusable widget adaptability.
- [ ] Confirmed interactive buttons meet minimum 44x44px touch target guidelines.
- [ ] Tested all route pages at 320px viewport width to verify zero horizontal page overflow.
