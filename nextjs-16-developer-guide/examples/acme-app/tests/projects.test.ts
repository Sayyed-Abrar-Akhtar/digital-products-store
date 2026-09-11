import { test, describe } from "node:test";
import assert from "node:assert";
import { fetchProjects, fetchProjectBySlug, fetchSystemMetrics } from "../lib/projects";

describe("Acme Reference Application - Server Data Layer", () => {
  test("fetchProjects returns list of active system projects", async () => {
    const projects = await fetchProjects();
    assert.ok(Array.isArray(projects));
    assert.ok(projects.length >= 3);
    assert.strictEqual(projects[0].slug, "acme-web-portal");
  });

  test("fetchProjectBySlug resolves project by slug parameter", async () => {
    const project = await fetchProjectBySlug("billing-api");
    assert.ok(project !== null);
    assert.strictEqual(project?.name, "Billing & Subscriptions API");
    assert.strictEqual(project?.region, "us-west-2");
  });

  test("fetchProjectBySlug returns null for invalid slug", async () => {
    const project = await fetchProjectBySlug("non-existent-slug");
    assert.strictEqual(project, null);
  });

  test("fetchSystemMetrics returns telemetry health metrics", async () => {
    const metrics = await fetchSystemMetrics();
    assert.ok(Array.isArray(metrics));
    assert.strictEqual(metrics.length, 3);
    assert.strictEqual(metrics[0].status, "healthy");
  });
});
