import { test, describe } from "node:test";
import assert from "node:assert";
import { getAdminProductStats, checkSlugUniqueness, getAdminProducts } from "../lib/admin/data-access";
import { assertAdminAuth, AuthorizationError } from "../lib/admin/auth-guard";
import { createProductAction, updateProductAction, archiveProductAction } from "../app/admin/actions";
import { getPublishedProducts, getProductBySlug } from "../lib/db/data-access";

describe("Admin Authorization & Security Boundary Tests", () => {
  test("assertAdminAuth succeeds in dev fallback mode", async () => {
    const auth = await assertAdminAuth();
    assert.strictEqual(auth.isAuthenticated, true);
    assert.strictEqual(auth.role, "admin");
  });

  test("assertAdminAuth throws AuthorizationError when ALLOW_DEV_ADMIN_UNAUTHENTICATED is false", async () => {
    const orig = process.env.ALLOW_DEV_ADMIN_UNAUTHENTICATED;
    try {
      process.env.ALLOW_DEV_ADMIN_UNAUTHENTICATED = "false";
      await assertAdminAuth();
      assert.fail("Should have thrown AuthorizationError");
    } catch (err) {
      assert.ok(err instanceof AuthorizationError);
      assert.match(err.message, /Admin access is disabled/i);
    } finally {
      if (orig !== undefined) {
        process.env.ALLOW_DEV_ADMIN_UNAUTHENTICATED = orig;
      } else {
        delete process.env.ALLOW_DEV_ADMIN_UNAUTHENTICATED;
      }
    }
  });
});

describe("Admin Data Access & Metrics Tests", () => {
  test("getAdminProductStats returns non-negative counters for all statuses", async () => {
    const stats = await getAdminProductStats();
    assert.ok(typeof stats.total === "number" && stats.total >= 0);
    assert.ok(typeof stats.published === "number" && stats.published >= 0);
    assert.ok(typeof stats.draft === "number" && stats.draft >= 0);
    assert.ok(typeof stats.comingSoon === "number" && stats.comingSoon >= 0);
    assert.ok(typeof stats.archived === "number" && stats.archived >= 0);
    assert.ok(typeof stats.free === "number" && stats.free >= 0);
    assert.ok(typeof stats.paid === "number" && stats.paid >= 0);
  });

  test("getAdminProducts includes draft and archived items", async () => {
    const result = await getAdminProducts({ status: "all" });
    assert.ok(Array.isArray(result.products));
    assert.ok(result.products.length > 0);
    assert.ok(result.pagination.total >= result.products.length);
  });

  test("checkSlugUniqueness detects existing fallback slugs", async () => {
    const isUnique = await checkSlugUniqueness("nextjs-saas-starter-kit");
    assert.strictEqual(isUnique, false);

    const isUniqueNew = await checkSlugUniqueness("brand-new-unique-admin-test-slug");
    assert.strictEqual(isUniqueNew, true);
  });
});

describe("Admin Product Mutation Validation Rules", () => {
  test("createProductAction fails when required fields are missing", async () => {
    const result = await createProductAction({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      status: "draft",
      productType: "software",
      isFree: false,
      price: -10,
      categoryId: "",
      featured: false,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.fieldErrors?.name);
    assert.ok(result.fieldErrors?.slug);
    assert.ok(result.fieldErrors?.shortDescription);
    assert.ok(result.fieldErrors?.description);
    assert.ok(result.fieldErrors?.categoryId);
    assert.ok(result.fieldErrors?.price);
  });

  test("createProductAction fails when paid product price is 0", async () => {
    const result = await createProductAction({
      name: "Paid Test Product",
      slug: "paid-test-product",
      shortDescription: "Short test desc",
      description: "Full test desc",
      status: "draft",
      productType: "software",
      isFree: false,
      price: 0,
      categoryId: "cat-1",
      featured: false,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.fieldErrors?.price);
    assert.match(result.fieldErrors.price, /valid price greater than 0/i);
  });

  test("createProductAction fails when free product price is non-zero", async () => {
    const result = await createProductAction({
      name: "Free Test Product",
      slug: "free-test-product",
      shortDescription: "Short test desc",
      description: "Full test desc",
      status: "draft",
      productType: "software",
      isFree: true,
      price: 25,
      categoryId: "cat-1",
      featured: false,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.fieldErrors?.price);
    assert.match(result.fieldErrors.price, /must be 0 for free products/i);
  });

  test("createProductAction rejects invalid slug format", async () => {
    const result = await createProductAction({
      name: "Invalid Slug Product",
      slug: "Invalid Slug With Spaces!",
      shortDescription: "Short test desc",
      description: "Full test desc",
      status: "draft",
      productType: "software",
      isFree: true,
      price: 0,
      categoryId: "cat-1",
      featured: false,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.fieldErrors?.slug);
    assert.match(result.fieldErrors.slug, /lowercase letters, numbers, and hyphens/i);
  });
});

describe("Public Catalog vs Admin Data Separation", () => {
  test("Public query getPublishedProducts strictly excludes draft and archived products", async () => {
    const publicProducts = await getPublishedProducts();
    for (const prod of publicProducts) {
      assert.notStrictEqual(prod.status, "draft");
      assert.notStrictEqual(prod.status, "archived");
    }
  });

  test("Public query getProductBySlug returns null for draft product", async () => {
    const draftProduct = await getProductBySlug("internal-analytics-micro-engine");
    assert.strictEqual(draftProduct, null);
  });

  test("Public query getProductBySlug returns null for archived product", async () => {
    const archivedProduct = await getProductBySlug("legacy-nextjs-pages-router-template");
    assert.strictEqual(archivedProduct, null);
  });
});
