import fs from "fs";
import path from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateManuscript(): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  const rootDir = path.join(__dirname, "..");

  // 1. Check Metadata
  const metadataPath = path.join(rootDir, "content/metadata.json");
  if (!fs.existsSync(metadataPath)) {
    result.errors.push("Missing content/metadata.json");
    result.valid = false;
  } else {
    try {
      const meta = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      if (!meta.workingTitle || !meta.version || !meta.technologies) {
        result.errors.push("Invalid or incomplete metadata structure");
        result.valid = false;
      }
    } catch (e: any) {
      result.errors.push(`Metadata JSON error: ${e.message}`);
      result.valid = false;
    }
  }

  // 2. Check Table of Contents & Chapters
  const tocPath = path.join(rootDir, "content/toc.md");
  if (!fs.existsSync(tocPath)) {
    result.errors.push("Missing content/toc.md");
    result.valid = false;
  }

  const chaptersDir = path.join(rootDir, "content/chapters");
  if (!fs.existsSync(chaptersDir)) {
    result.errors.push("Missing content/chapters/ directory");
    result.valid = false;
  } else {
    const chapterFiles = fs.readdirSync(chaptersDir).filter(f => f.endsWith(".md"));
    if (chapterFiles.length < 40) {
      result.warnings.push(`Expected at least 40 chapters, found ${chapterFiles.length}`);
    }

    // Verify each chapter file contains required headers and quality standards
    for (const file of chapterFiles) {
      const content = fs.readFileSync(path.join(chaptersDir, file), "utf-8");
      const isAppendix = file.startsWith("appendix-");

      const requiredSections = isAppendix
        ? [
            "## Learning Objectives",
            "## Overview & Core Explanation",
            "## Common Mistakes",
            "## Production Considerations",
            "## Summary"
          ]
        : [
            "## Learning Objectives",
            "## Practical Example",
            "## Common Mistakes",
            "## Production Considerations",
            "## Summary"
          ];

      for (const section of requiredSections) {
        if (!content.includes(section)) {
          result.errors.push(`File ${file} is missing section: ${section}`);
          result.valid = false;
        }
      }

      // Check placeholder markers
      const forbiddenPlaceholders = [
        "This chapter is under development",
        "TODO:",
        "FIXME:",
        "[PLACEHOLDER]",
        "Lorem ipsum",
        "will be added in a future update"
      ];
      for (const phrase of forbiddenPlaceholders) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          result.errors.push(`File ${file} contains placeholder phrase: "${phrase}"`);
          result.valid = false;
        }
      }

      // Check minimum word count
      const words = content.split(/\s+/).filter(Boolean).length;
      const minWords = isAppendix ? 400 : 900;
      if (words < minWords) {
        result.errors.push(`File ${file} has insufficient word count (${words} words < required ${minWords})`);
        result.valid = false;
      }
    }
  }

  return result;
}

const validation = validateManuscript();
console.log("=== Manuscript & Code Validation Report ===");
if (validation.warnings.length > 0) {
  console.log("Warnings:");
  validation.warnings.forEach(w => console.log(` - ${w}`));
}
if (!validation.valid) {
  console.error("Validation Failed with Errors:");
  validation.errors.forEach(e => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log("SUCCESS: Manuscript structure, metadata, and chapters validated successfully!");
}
