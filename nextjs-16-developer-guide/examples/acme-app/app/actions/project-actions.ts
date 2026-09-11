"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { SystemProject } from "@/lib/projects";

export interface ActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  project?: SystemProject;
}

export async function createProjectAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const headerList = await headers();
  const userId = headerList.get("x-user-id") || "usr-demo";

  const rawName = formData.get("name")?.toString().trim() || "";
  const rawSlug = formData.get("slug")?.toString().trim().toLowerCase() || "";
  const rawEnvironment = (formData.get("environment")?.toString() || "development") as any;
  const rawRegion = formData.get("region")?.toString() || "us-east-1";

  const errors: Record<string, string[]> = {};
  if (!rawName || rawName.length < 3) {
    errors.name = ["Project name must be at least 3 characters long."];
  }
  if (!rawSlug || !/^[a-z0-9-]+$/.test(rawSlug)) {
    errors.slug = ["Slug must contain only lowercase letters, numbers, and hyphens."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Validation failed. Correct the errors below.",
      errors,
    };
  }

  const newProject: SystemProject = {
    id: `proj-${Date.now().toString().slice(-4)}`,
    name: rawName,
    slug: rawSlug,
    environment: rawEnvironment,
    region: rawRegion,
    status: "active",
    deployCount: 1,
    lastDeployedAt: new Date().toISOString(),
  };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");

  return {
    success: true,
    message: `Project "${rawName}" created successfully!`,
    project: newProject,
  };
}
