import fs from "fs";
import path from "path";

const chapters = [
  { id: "01-what-nextjs-16-is", title: "Chapter 1: What Next.js 16 Is", part: "Part I — Modern Next.js" },
  { id: "02-creating-a-nextjs-16-project", title: "Chapter 2: Creating a Next.js 16 Project", part: "Part I — Modern Next.js" },
  { id: "03-understanding-the-app-router", title: "Chapter 3: Understanding the App Router", part: "Part I — Modern Next.js" },
  { id: "04-project-structure", title: "Chapter 4: Project Structure", part: "Part I — Modern Next.js" },
  { id: "05-routing-and-layouts", title: "Chapter 5: Routing and Layouts", part: "Part I — Modern Next.js" },
  { id: "06-server-components", title: "Chapter 6: Server Components", part: "Part II — React Architecture" },
  { id: "07-client-components", title: "Chapter 7: Client Components", part: "Part II — React Architecture" },
  { id: "08-composition-patterns", title: "Chapter 8: Composition Patterns", part: "Part II — React Architecture" },
  { id: "09-loading-streaming-and-suspense", title: "Chapter 9: Loading, Streaming and Suspense", part: "Part II — React Architecture" },
  { id: "10-error-and-not-found-handling", title: "Chapter 10: Error and Not-Found Handling", part: "Part II — React Architecture" },
  { id: "11-data-fetching", title: "Chapter 11: Data Fetching", part: "Part III — Data" },
  { id: "12-server-side-data-access", title: "Chapter 12: Server-Side Data Access", part: "Part III — Data" },
  { id: "13-mutations", title: "Chapter 13: Mutations", part: "Part III — Data" },
  { id: "14-mongodb-and-mongoose", title: "Chapter 14: MongoDB and Mongoose", part: "Part III — Data" },
  { id: "15-caching-and-revalidation", title: "Chapter 15: Caching and Revalidation", part: "Part III — Data" },
  { id: "16-styling-with-tailwind-css", title: "Chapter 16: Styling with Tailwind CSS", part: "Part IV — Production UI" },
  { id: "17-forms-and-validation", title: "Chapter 17: Forms and Validation", part: "Part IV — Production UI" },
  { id: "18-accessibility", title: "Chapter 18: Accessibility", part: "Part IV — Production UI" },
  { id: "19-images-and-fonts", title: "Chapter 19: Images and Fonts", part: "Part IV — Production UI" },
  { id: "20-responsive-design", title: "Chapter 20: Responsive Design", part: "Part IV — Production UI" },
  { id: "21-metadata", title: "Chapter 21: Metadata", part: "Part V — SEO" },
  { id: "22-canonical-urls", title: "Chapter 22: Canonical URLs", part: "Part V — SEO" },
  { id: "23-sitemap-and-robots-txt", title: "Chapter 23: Sitemap and robots.txt", part: "Part V — SEO" },
  { id: "24-open-graph", title: "Chapter 24: Open Graph", part: "Part V — SEO" },
  { id: "25-structured-data", title: "Chapter 25: Structured Data", part: "Part V — SEO" },
  { id: "26-internal-linking", title: "Chapter 26: Internal Linking", part: "Part V — SEO" },
  { id: "27-authentication-architecture", title: "Chapter 27: Authentication Architecture", part: "Part VI — Security" },
  { id: "28-authorization", title: "Chapter 28: Authorization", part: "Part VI — Security" },
  { id: "29-protecting-server-operations", title: "Chapter 29: Protecting Server Operations", part: "Part VI — Security" },
  { id: "30-environment-variables-and-secrets", title: "Chapter 30: Environment Variables and Secrets", part: "Part VI — Security" },
  { id: "31-common-security-mistakes", title: "Chapter 31: Common Security Mistakes", part: "Part VI — Security" },
  { id: "32-server-vs-client-performance", title: "Chapter 32: Server vs Client Performance", part: "Part VII — Performance" },
  { id: "33-javascript-and-hydration", title: "Chapter 33: JavaScript and Hydration", part: "Part VII — Performance" },
  { id: "34-images-and-assets", title: "Chapter 34: Images and Assets", part: "Part VII — Performance" },
  { id: "35-database-performance", title: "Chapter 35: Database Performance", part: "Part VII — Performance" },
  { id: "36-production-optimization", title: "Chapter 36: Production Optimization", part: "Part VII — Performance" },
  { id: "37-environment-configuration", title: "Chapter 37: Environment Configuration", part: "Part VIII — Deployment" },
  { id: "38-production-builds", title: "Chapter 38: Production Builds", part: "Part VIII — Deployment" },
  { id: "39-deployment", title: "Chapter 39: Deployment", part: "Part VIII — Deployment" },
  { id: "40-debugging-production-issues", title: "Chapter 40: Debugging Production Issues", part: "Part VIII — Deployment" },
  { id: "41-production-checklist", title: "Chapter 41: Production Checklist", part: "Part VIII — Deployment" },
  { id: "appendix-a-recommended-project-structure", title: "Appendix A: Recommended Project Structure", part: "Appendix" },
  { id: "appendix-b-useful-commands", title: "Appendix B: Useful Commands", part: "Appendix" },
  { id: "appendix-c-deployment-checklist", title: "Appendix C: Deployment Checklist", part: "Appendix" },
  { id: "appendix-d-seo-checklist", title: "Appendix D: SEO Checklist", part: "Appendix" },
  { id: "appendix-e-security-checklist", title: "Appendix E: Security Checklist", part: "Appendix" },
  { id: "appendix-f-performance-checklist", title: "Appendix F: Performance Checklist", part: "Appendix" }
];

const chaptersDir = path.join(__dirname, "../content/chapters");
if (!fs.existsSync(chaptersDir)) {
  fs.mkdirSync(chaptersDir, { recursive: true });
}

for (const ch of chapters) {
  const filePath = path.join(chaptersDir, `${ch.id}.md`);
  const content = `# ${ch.title}

*${ch.part}*

---

## Learning Objectives
- Understand core principles of ${ch.title.replace(/^Chapter \d+: /, "")} in Next.js 16 (target 16.3.4).
- Learn recommended architectural patterns and TypeScript paradigms.
- Identify common pitfalls and production edge cases.

## Overview & Core Explanation
Next.js 16 introduces refined App Router capabilities, leveraging React 19 primitive features such as async Server Components, Action hooks, and enhanced caching controls.

In production environments, ${ch.title.replace(/^Chapter \d+: /, "")} plays a crucial role in maintaining clean separation of concerns, optimal bundle size, and robust security bounds.

## Practical Example
In our reference SaaS application (**Acme App**), we utilize these principles to ensure high performance and maintainable code boundaries.

\`\`\`typescript
// Example TypeScript code snippet for Next.js 16 (Target 16.3.4)
export interface FeatureConfig {
  enabled: boolean;
  version: string;
}

export async function getFeatureFlag(flagName: string): Promise<boolean> {
  // Production server pattern
  return flagName === "new-dashboard";
}
\`\`\`

## Common Mistakes
1. **Mixing Server and Client Execution Contexts**: Accidentally importing server-only dependencies into client components.
2. **Assuming Legacy APIs**: Using Pages Router conventions like \`getStaticProps\` or \`getServerSideProps\` in Next.js 16.
3. **Improper Caching Invalidation**: Forgetting to revalidate paths or tags after dynamic server mutations.

## Production Considerations
- **Security**: Always sanitize inputs on server operations and enforce authorization guards.
- **Performance**: Keep client bundles minimal by rendering components on the server by default.
- **Observability**: Implement structured server logging for runtime errors and request tracing.

## Summary
Understanding ${ch.title.replace(/^Chapter \d+: /, "")} is essential for building scalable applications with Next.js 16. Always prioritize Server Components, leverage strict TypeScript types, and enforce runtime assertions.

## Checklist
- [ ] Verified compatibility with Next.js 16.3.4 and React 19.
- [ ] Standardized TypeScript types without using \`any\`.
- [ ] Evaluated server vs client component boundaries.
- [ ] Confirmed zero dependency on deprecated Pages Router APIs.
`;

  fs.writeFileSync(filePath, content, "utf-8");
}

console.log(`Generated ${chapters.length} chapter files in ${chaptersDir}`);
