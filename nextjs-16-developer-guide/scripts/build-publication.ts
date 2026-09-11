import fs from "fs";
import path from "path";

const rootDir = path.join(__dirname, "..");
const chaptersDir = path.join(rootDir, "content/chapters");
const distDir = path.join(rootDir, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

function compilePublication() {
  console.log("=== Building Publication Pipeline Package ===");

  const metadataPath = path.join(rootDir, "content/metadata.json");
  const meta = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const tocContent = fs.readFileSync(path.join(rootDir, "content/toc.md"), "utf-8");

  // 1. Consolidated Markdown Manuscript
  let consolidatedMarkdown = `# ${meta.workingTitle}\n\n`;
  consolidatedMarkdown += `*${meta.subtitle}*\n\n`;
  consolidatedMarkdown += `**Author**: ${meta.author.name}  \n`;
  consolidatedMarkdown += `**Version**: ${meta.version}  \n`;
  consolidatedMarkdown += `**Copyright**: ${meta.copyright}\n\n`;
  consolidatedMarkdown += `---\n\n`;
  consolidatedMarkdown += `${tocContent}\n\n---\n\n`;

  const chapterFiles = fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".md")).sort();

  for (const file of chapterFiles) {
    const chapterContent = fs.readFileSync(path.join(chaptersDir, file), "utf-8");
    consolidatedMarkdown += `\n\n${chapterContent}\n\n---\n\n`;
  }

  const markdownOutputPath = path.join(distDir, "practical-nextjs-16-developer-guide.md");
  fs.writeFileSync(markdownOutputPath, consolidatedMarkdown, "utf-8");
  console.log(`✓ Consolidated Markdown compiled: ${markdownOutputPath}`);

  // 2. Printable HTML Compilation (Ready for PDF printing)
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${meta.workingTitle}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; color: #1e293b; }
    h1 { font-size: 2.25rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; color: #1e293b; margin-top: 2rem; }
    pre { background: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f1f5f9; }
    hr { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
    @media print {
      body { max-width: 100%; padding: 0; }
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body>
  <h1>${meta.workingTitle}</h1>
  <p><strong>${meta.subtitle}</strong></p>
  <p>Author: ${meta.author.name} | Version: ${meta.version}</p>
  <hr/>
`;

  // Simple HTML conversion for publication preview
  const simpleMarkdownToHtml = (md: string) => {
    return md
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/```typescript([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
      .replace(/```bash([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
      .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
      .replace(/\n\n/g, "<p></p>");
  };

  htmlContent += simpleMarkdownToHtml(consolidatedMarkdown);
  htmlContent += `</body></html>`;

  const htmlOutputPath = path.join(distDir, "practical-nextjs-16-developer-guide.html");
  fs.writeFileSync(htmlOutputPath, htmlContent, "utf-8");
  console.log(`✓ Printable HTML compiled: ${htmlOutputPath}`);

  // 3. EPUB Manifest Structure
  const epubManifest = {
    title: meta.workingTitle,
    subtitle: meta.subtitle,
    author: meta.author.name,
    version: meta.version,
    chaptersCount: chapterFiles.length,
    generatedAt: new Date().toISOString(),
  };

  const epubManifestPath = path.join(distDir, "epub-manifest.json");
  fs.writeFileSync(epubManifestPath, JSON.stringify(epubManifest, null, 2), "utf-8");
  console.log(`✓ EPUB Manifest generated: ${epubManifestPath}`);

  console.log("=== Publication Build Complete ===");
}

compilePublication();
