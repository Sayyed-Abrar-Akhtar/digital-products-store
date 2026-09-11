import fs from "fs";
import path from "path";

const rootDir = path.join(__dirname, "..");
const chaptersDir = path.join(rootDir, "content/chapters");
const distDir = path.join(rootDir, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function compileSamplePackage() {
  console.log("=== Building Free Sample Edition Package ===");

  const metadataPath = path.join(rootDir, "content/metadata.json");
  const meta = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const tocContent = fs.readFileSync(path.join(rootDir, "content/toc.md"), "utf-8");

  let sampleMarkdown = `# ${meta.workingTitle} — Free Sample Edition\n\n`;
  sampleMarkdown += `*${meta.subtitle}*\n\n`;
  sampleMarkdown += `**Author**: ${meta.author.name}  \n`;
  sampleMarkdown += `**Version**: ${meta.version} (Sample Preview)  \n`;
  sampleMarkdown += `**Website**: ${meta.author.url}\n\n`;
  sampleMarkdown += `> *This free sample edition includes the complete Table of Contents, Chapter 6 (Server Components), Appendix E (Security Checklist), and Appendix F (Performance Checklist).*\n\n`;
  sampleMarkdown += `---\n\n`;
  sampleMarkdown += `${tocContent}\n\n---\n\n`;

  const includedFiles = [
    "06-server-components.md",
    "appendix-e-security-checklist.md",
    "appendix-f-performance-checklist.md",
  ];

  for (const file of includedFiles) {
    const filePath = path.join(chaptersDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      sampleMarkdown += `\n\n${content}\n\n---\n\n`;
    }
  }

  const sampleOutputPath = path.join(distDir, "practical-nextjs-16-developer-guide-sample.md");
  fs.writeFileSync(sampleOutputPath, sampleMarkdown, "utf-8");
  console.log(`✓ Free Sample Markdown compiled: ${sampleOutputPath}`);

  // Printable HTML Sample
  let sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${meta.workingTitle} - Free Sample Edition</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 850px; margin: 0 auto; padding: 2rem; color: #1e293b; }
    h1 { font-size: 2rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; color: #1e293b; margin-top: 1.5rem; }
    .badge { display: inline-block; background: #2563eb; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; }
    pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <span class="badge">FREE SAMPLE EDITION</span>
  <h1>${meta.workingTitle}</h1>
  <p><strong>${meta.subtitle}</strong></p>
  <p>Author: ${meta.author.name} | Official Release v${meta.version}</p>
  <hr/>
  <div>
    <p>Get the full 41-chapter commercial guide at <a href="${meta.author.url}">${meta.author.url}</a></p>
  </div>
`;

  sampleHtml += sampleMarkdown
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/```typescript([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
    .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>");

  sampleHtml += `</body></html>`;

  const sampleHtmlPath = path.join(distDir, "practical-nextjs-16-developer-guide-sample.html");
  fs.writeFileSync(sampleHtmlPath, sampleHtml, "utf-8");
  console.log(`✓ Free Sample HTML compiled: ${sampleHtmlPath}`);

  console.log("=== Free Sample Build Complete ===");
}

compileSamplePackage();
