import React from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminCategories, getAdminTags } from "@/lib/admin/data-access";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  const tags = await getAdminTags();

  return (
    <div>
      <ProductForm mode="create" categories={categories} tags={tags} />
    </div>
  );
}
