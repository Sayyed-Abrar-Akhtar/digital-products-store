"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  ProductFormData,
  createProductAction,
  updateProductAction,
  createProductVersionAction,
} from "@/app/admin/actions";
import { FeatureListInput } from "./FeatureListInput";
import { ImageListInput } from "./ImageListInput";
import { ProductStatusType, ProductKindType } from "@/lib/db/models";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: any;
  categories: CategoryOption[];
  tags: TagOption[];
}

export function ProductForm({ mode, initialData, categories, tags }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<ProductStatusType>(initialData?.status || "draft");
  const [productType, setProductType] = useState<ProductKindType>(initialData?.productType || "software");
  const [isFree, setIsFree] = useState<boolean>(initialData?.isFree ?? false);
  const [price, setPrice] = useState<number>(initialData?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(initialData?.compareAtPrice);
  const [currency, setCurrency] = useState(initialData?.currency || "USD");
  const [featured, setFeatured] = useState<boolean>(initialData?.featured ?? false);
  const [demoUrl, setDemoUrl] = useState(initialData?.demoUrl || "");
  const [documentationUrl, setDocumentationUrl] = useState(initialData?.documentationUrl || "");
  const [requirements, setRequirements] = useState<string>(
    Array.isArray(initialData?.requirements) ? initialData.requirements.join("\n") : ""
  );
  const [version, setVersion] = useState(initialData?.version || "1.0.0");
  const [categoryId, setCategoryId] = useState(initialData?.category?.id || categories[0]?.id || "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    Array.isArray(initialData?.tags) ? initialData.tags.map((t: any) => t.id || t) : []
  );
  const [images, setImages] = useState(initialData?.images || []);
  const [features, setFeatures] = useState(initialData?.features || []);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [badge, setBadge] = useState(initialData?.badge || "");

  // Version bump form state for Edit mode
  const [newVersion, setNewVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [versionSaving, setVersionSaving] = useState(false);
  const [versionMessage, setVersionMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  const toggleFree = (free: boolean) => {
    setIsFree(free);
    if (free) {
      setPrice(0);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData?.id || !newVersion.trim()) return;

    setVersionSaving(true);
    setVersionMessage(null);

    const res = await createProductVersionAction(initialData.id, {
      version: newVersion.trim(),
      releaseNotes: releaseNotes.trim(),
    });

    setVersionSaving(false);
    if (res.success) {
      setVersion(newVersion.trim());
      setNewVersion("");
      setReleaseNotes("");
      setVersionMessage(`Successfully recorded version v${newVersion.trim()}`);
    } else {
      setVersionMessage(`Error: ${res.error || "Failed to create version."}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGlobalError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const formData: ProductFormData = {
      name,
      slug,
      shortDescription,
      description,
      status,
      productType,
      isFree,
      price: isFree ? 0 : Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      currency,
      featured,
      demoUrl,
      documentationUrl,
      requirements: requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      version,
      categoryId,
      tagIds: selectedTagIds,
      images,
      features,
      seoTitle,
      seoDescription,
      badge,
    };

    let result;
    if (mode === "create") {
      result = await createProductAction(formData);
    } else {
      result = await updateProductAction(initialData.id, formData);
    }

    setSubmitting(false);

    if (result.success) {
      setSuccessMessage(
        mode === "create" ? "Product created successfully!" : "Product updated successfully!"
      );
      if (mode === "create" && result.data && result.data.productId) {
        const newId = result.data.productId;
        setTimeout(() => {
          router.push(`/admin/products/${newId}`);
        }, 800);
      } else {
        router.refresh();
      }
    } else {
      setGlobalError(result.error || "Form submission failed.");
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {mode === "create" ? "Create New Product" : `Edit Product: ${initialData?.name}`}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Manage database catalog fields, pricing, metadata, features, and visibility status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {mode === "edit" && initialData?.slug && (
            <a
              href={`/products/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-700"
            >
              <span>View Product</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {globalError && (
        <div className="bg-red-950/80 border border-red-800 p-4 rounded-xl flex items-start gap-3 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Action Failed</p>
            <p className="mt-0.5">{globalError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl flex items-start gap-3 text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-300">Success</p>
            <p className="mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Section 1: Core Details */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          1. Basic Product Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Next.js 16 SaaS Architecture Starter"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase text-neutral-300">
                Slug <span className="text-red-400">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-emerald-600 focus:ring-0"
                />
                Auto-generate
              </label>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="nextjs-saas-starter-kit"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            {fieldErrors.slug && <p className="text-xs text-red-400 mt-1">{fieldErrors.slug}</p>}
            {mode === "edit" && slug !== initialData?.slug && (
              <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Changing the public slug will alter URL routing for this product.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
            Short Description <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief summary displayed in catalog cards (1-2 sentences)"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          {fieldErrors.shortDescription && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.shortDescription}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
            Full Product Overview <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed product specification, architecture overview, and value proposition..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.description}</p>
          )}
        </div>
      </div>

      {/* Section 2: Catalog Status, Type & Category */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          2. Status, Classification & Tags
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Publication Status <span className="text-red-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatusType)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="draft">Draft (Private)</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="published">Published (Public)</option>
              <option value="archived">Archived (Hidden)</option>
            </select>
            {fieldErrors.status && <p className="text-xs text-red-400 mt-1">{fieldErrors.status}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Product Type <span className="text-red-400">*</span>
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as ProductKindType)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="software">Software / Starter</option>
              <option value="template">Website Template</option>
              <option value="resource">Guide / Resource</option>
              <option value="tool">Developer Tool</option>
              <option value="ebook">Ebook</option>
              <option value="course">Course</option>
            </select>
            {fieldErrors.productType && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.productType}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.categoryId}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
            Assign Tags
          </label>
          {tags.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">No tags available in database yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700 font-semibold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Pricing & Free Tier */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          3. Pricing & Promotion
        </h2>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-200">
            <input
              type="radio"
              name="freePaid"
              checked={!isFree}
              onChange={() => toggleFree(false)}
              className="text-emerald-600 focus:ring-0"
            />
            Paid Product
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-neutral-200">
            <input
              type="radio"
              name="freePaid"
              checked={isFree}
              onChange={() => toggleFree(true)}
              className="text-emerald-600 focus:ring-0"
            />
            Free Resource ($0)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Price (USD) {!isFree && <span className="text-red-400">*</span>}
            </label>
            <input
              type="number"
              min="0"
              step="1"
              disabled={isFree}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="49"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            />
            {fieldErrors.price && <p className="text-xs text-red-400 mt-1">{fieldErrors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Compare-at Price (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              disabled={isFree}
              value={compareAtPrice ?? ""}
              onChange={(e) =>
                setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="79"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Badge Label (Optional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Bestseller, New, Free Resource"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded bg-neutral-800 border-neutral-700 text-emerald-600 focus:ring-0"
          />
          <label htmlFor="featured" className="text-sm font-medium text-neutral-200 cursor-pointer">
            Feature this product on homepage catalog grids
          </label>
        </div>
      </div>

      {/* Section 4: URLs, Version & Requirements */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          4. Technical Metadata & Versions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Current Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Demo URL (Optional)
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://example.com/demo"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
              Documentation URL (Optional)
            </label>
            <input
              type="url"
              value={documentationUrl}
              onChange={(e) => setDocumentationUrl(e.target.value)}
              placeholder="https://example.com/docs"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
            System Requirements (One per line)
          </label>
          <textarea
            rows={3}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Node.js 20.x or higher&#10;Next.js 16+&#10;MongoDB 6.0+"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Version Bump Form inside edit mode */}
        {mode === "edit" && initialData?.id && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Record Product Version Release
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="New version (e.g. 1.1.0)"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                className="w-48 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Release notes summary"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleCreateVersion}
                disabled={versionSaving || !newVersion.trim()}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 border border-neutral-700 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {versionSaving ? "Saving..." : "Add Version Record"}
              </button>
            </div>
            {versionMessage && (
              <p className="text-xs text-emerald-400 font-medium">{versionMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Section 5: Features Manager */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          5. Feature List
        </h2>
        <FeatureListInput features={features} onChange={setFeatures} />
      </div>

      {/* Section 6: Image References */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          6. Product Image Metadata
        </h2>
        <ImageListInput images={images} onChange={setImages} />
        {fieldErrors.images && <p className="text-xs text-red-400">{fieldErrors.images}</p>}
      </div>

      {/* Section 7: SEO Fields */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-neutral-800 pb-3">
          7. Search Engine Optimization (SEO)
        </h2>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase text-neutral-300">
              SEO Title Tag
            </label>
            <span className="text-xs font-mono text-neutral-500">
              {seoTitle.length} / 60 chars
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="e.g. Next.js 16 SaaS Architecture Starter — Full-Stack Boilerplate"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase text-neutral-300">
              SEO Meta Description
            </label>
            <span className="text-xs font-mono text-neutral-500">
              {seoDescription.length} / 160 chars
            </span>
          </div>
          <textarea
            rows={3}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="e.g. Production-ready SaaS boilerplate engineered with Next.js 16 App Router, React 19, strict TypeScript, and MongoDB."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="px-5 py-2.5 text-sm font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
