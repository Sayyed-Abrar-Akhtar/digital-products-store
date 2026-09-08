import React from "react";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProductById, getAdminCategories, getAdminTags } from "@/lib/admin/data-access";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getAdminProductById(id);

  if (!product) {
    notFound();
  }

  const categories = await getAdminCategories();
  const tags = await getAdminTags();

  return (
    <div>
      <ProductForm mode="edit" initialData={product} categories={categories} tags={tags} />
    </div>
  );
}
