import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  getPublishedProducts,
  getProductBySlug,
  getPublishedCategories,
  getCategoryBySlug,
  getProductsByCategory,
  getFeaturedProducts,
} from "../lib/db/data-access";

describe("Catalog Data Access Layer Tests", () => {
  test("getPublishedProducts returns list of products without drafts or archived", async () => {
    const products = await getPublishedProducts();
    assert.ok(Array.isArray(products));
    assert.ok(products.length >= 10);

    const statuses = products.map((p) => p.status);
    assert.ok(!statuses.includes("draft"));
    assert.ok(!statuses.includes("archived"));

    // Verify free products exist
    const freeProducts = products.filter((p) => p.isFree || p.price === 0);
    assert.ok(freeProducts.length >= 3);

    // Verify coming_soon product exists in public products
    const comingSoon = products.filter((p) => p.status === "coming_soon");
    assert.ok(comingSoon.length >= 1);
  });

  test("getProductBySlug retrieves valid product and enforces public status filter", async () => {
    const products = await getPublishedProducts();
    const targetSlug = products[0].slug;

    const found = await getProductBySlug(targetSlug);
    assert.ok(found);
    assert.equal(found.slug, targetSlug);

    // Draft product slug must return null
    const draftFound = await getProductBySlug("internal-analytics-micro-engine");
    assert.equal(draftFound, null);

    // Archived product slug must return null
    const archivedFound = await getProductBySlug("legacy-nextjs-pages-router-template");
    assert.equal(archivedFound, null);

    // Non-existent slug must return null
    const missing = await getProductBySlug("non-existent-slug-12345");
    assert.equal(missing, null);
  });

  test("getPublishedCategories returns 6 valid categories", async () => {
    const categories = await getPublishedCategories();
    assert.ok(Array.isArray(categories));
    assert.equal(categories.length, 6);

    for (const c of categories) {
      assert.ok(c.id);
      assert.ok(c.name);
      assert.ok(c.slug);
    }
  });

  test("getCategoryBySlug and getProductsByCategory function correctly", async () => {
    const categories = await getPublishedCategories();
    const firstCat = categories[0];

    const category = await getCategoryBySlug(firstCat.slug);
    assert.ok(category);
    assert.equal(category.slug, firstCat.slug);

    const categoryProducts = await getProductsByCategory(firstCat.slug);
    assert.ok(Array.isArray(categoryProducts));
    for (const p of categoryProducts) {
      assert.notEqual(p.status, "draft");
      assert.notEqual(p.status, "archived");
    }

    // Missing category
    const missingCat = await getCategoryBySlug("non-existent-category-999");
    assert.equal(missingCat, null);
  });

  test("getFeaturedProducts returns only featured non-draft products", async () => {
    const featured = await getFeaturedProducts();
    assert.ok(Array.isArray(featured));
    assert.ok(featured.length >= 3);
    for (const p of featured) {
      assert.equal(p.featured, true);
      assert.notEqual(p.status, "draft");
      assert.notEqual(p.status, "archived");
    }
  });
});
