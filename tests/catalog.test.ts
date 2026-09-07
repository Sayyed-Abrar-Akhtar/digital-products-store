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
  test("getPublishedProducts returns list of products without drafts", async () => {
    const products = await getPublishedProducts();
    assert.ok(Array.isArray(products));
    assert.ok(products.length > 0);

    for (const p of products) {
      assert.notEqual(p.status, "draft");
      assert.notEqual(p.status, "archived");
      assert.ok(p.id);
      assert.ok(p.name);
      assert.ok(p.slug);
    }
  });

  test("getProductBySlug retrieves valid product and handles missing/draft gracefully", async () => {
    const products = await getPublishedProducts();
    const targetSlug = products[0].slug;

    const found = await getProductBySlug(targetSlug);
    assert.ok(found);
    assert.equal(found.slug, targetSlug);

    // Missing product should return null
    const missing = await getProductBySlug("non-existent-slug-12345");
    assert.equal(missing, null);
  });

  test("getPublishedCategories returns all valid categories", async () => {
    const categories = await getPublishedCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);

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
    for (const p of featured) {
      assert.equal(p.featured, true);
      assert.notEqual(p.status, "draft");
      assert.notEqual(p.status, "archived");
    }
  });
});
