"use client";

import React, { useState } from "react";
import { Plus, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { ImageInput } from "@/app/admin/actions";

interface ImageListInputProps {
  images: ImageInput[];
  onChange: (images: ImageInput[]) => void;
}

export function ImageListInput({ images, onChange }: ImageListInputProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");

  const addImage = () => {
    if (!newUrl.trim()) return;
    const isPrimary = images.length === 0;
    const updated = [
      ...images,
      {
        url: newUrl.trim(),
        altText: newAlt.trim(),
        sortOrder: images.length,
        isPrimary,
      },
    ];
    onChange(updated);
    setNewUrl("");
    setNewAlt("");
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    const reordered = updated.map((img, i) => ({
      ...img,
      sortOrder: i,
      isPrimary: i === 0 ? true : img.isPrimary,
    }));
    onChange(reordered);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Image URL (e.g. /images/products/starter.png or https://...)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          placeholder="Alt text"
          value={newAlt}
          onChange={(e) => setNewAlt(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={addImage}
          disabled={!newUrl.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      <p className="text-xs text-neutral-500">
        Note: Actual media asset uploads will be added in a future storage milestone. Provide safe image URL paths.
      </p>

      {images.length === 0 ? (
        <p className="text-xs text-neutral-500 italic">No image metadata provided.</p>
      ) : (
        <ul className="space-y-2">
          {images.map((img, idx) => (
            <li
              key={idx}
              className={`flex items-center justify-between gap-3 border rounded-lg p-3 text-sm ${
                img.isPrimary
                  ? "bg-emerald-950/30 border-emerald-800/80"
                  : "bg-neutral-900/80 border-neutral-800"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <ImageIcon className="w-5 h-5 text-neutral-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-neutral-200 truncate">{img.url}</p>
                  {img.altText && <p className="text-xs text-neutral-400 truncate">Alt: {img.altText}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className={`text-xs px-2.5 py-1 rounded flex items-center gap-1 border transition-colors ${
                    img.isPrimary
                      ? "bg-emerald-900/50 text-emerald-300 border-emerald-700"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${img.isPrimary ? "fill-emerald-300" : ""}`} />
                  {img.isPrimary ? "Primary" : "Set Primary"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
