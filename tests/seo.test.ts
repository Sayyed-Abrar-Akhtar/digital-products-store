import test from "node:test";
import assert from "node:assert/strict";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { SITE_CONFIG } from "@/lib/config/site";
import { getPublishedProducts, getPublishedCategories } from "@/lib/db/data-access";

test("SEO Infrastructure Tests", async (t) => {
  await t.test("robots.ts returns valid configuration and sitemap URL", () => {
    const config = robots();
    assert.strictEqual(config.sitemap, `${SITE_CONFIG.url}/sitemap.xml`);

    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    assert.strictEqual(rules?.userAgent, "*");
    assert.strictEqual(rules?.allow, "/");
    assert.ok(Array.isArray(rules?.disallow));
    assert.ok(rules.disallow.includes("/api/"));
    assert.ok(rules.disallow.includes("/admin/"));
  });

  await t.test("sitemap.ts returns valid canonical URLs without trailing slashes or localhost", async () => {
    const entries = await sitemap();
    assert.ok(entries.length > 0);

    const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

    for (const entry of entries) {
      assert.ok(entry.url.startsWith(baseUrl), `URL ${entry.url} must start with ${baseUrl}`);
      assert.ok(!entry.url.includes("localhost"), `URL ${entry.url} should not contain localhost`);
      assert.ok(!entry.url.includes("?"), `URL ${entry.url} should not contain query parameters`);
      assert.ok(!entry.url.endsWith("/") || entry.url === `${baseUrl}/`, `URL ${entry.url} should not have unexpected trailing slashes`);
      assert.ok(entry.lastModified instanceof Date, `Entry ${entry.url} must have a valid Date object for lastModified`);
    }
  });

  await t.test("sitemap includes essential public static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

    const expectedStaticRoutes = [
      "",
      "/products",
      "/categories",
      "/bundles",
      "/free",
      "/blog",
      "/about",
      "/faq",
      "/contact",
      "/privacy",
      "/terms",
      "/refunds",
    ];

    for (const route of expectedStaticRoutes) {
      const expectedUrl = `${baseUrl}${route}`;
      assert.ok(urls.includes(expectedUrl), `Sitemap missing static route: ${expectedUrl}`);
    }
  });

  await t.test("sitemap dynamically includes published products and excludes drafts", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    const products = await getPublishedProducts();
    const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

    for (const product of products) {
      const expectedUrl = `${baseUrl}/products/${product.slug}`;
      assert.ok(urls.includes(expectedUrl), `Sitemap missing product route: ${expectedUrl}`);
    }

    assert.ok(!urls.some((u) => u.includes("draft")), "Sitemap must not include draft products");
  });

  await t.test("sitemap dynamically includes published categories", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    const categories = await getPublishedCategories();
    const baseUrl = SITE_CONFIG.url.replace(/\/$/, "");

    for (const category of categories) {
      const expectedUrl = `${baseUrl}/categories/${category.slug}`;
      assert.ok(urls.includes(expectedUrl), `Sitemap missing category route: ${expectedUrl}`);
    }
  });
});
