"use client";

import React, { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { FeatureInput } from "@/app/admin/actions";

interface FeatureListInputProps {
  features: FeatureInput[];
  onChange: (features: FeatureInput[]) => void;
}

export function FeatureListInput({ features, onChange }: FeatureListInputProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addFeature = () => {
    if (!newTitle.trim()) return;
    const updated = [
      ...features,
      {
        title: newTitle.trim(),
        description: newDesc.trim(),
        sortOrder: features.length,
      },
    ];
    onChange(updated);
    setNewTitle("");
    setNewDesc("");
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    const reordered = updated.map((f, i) => ({ ...f, sortOrder: i }));
    onChange(reordered);
  };

  const moveFeature = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === features.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...features];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((f, i) => ({ ...f, sortOrder: i }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Feature title (e.g., Next.js 16 App Router)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <input
          type="text"
          placeholder="Optional detail description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={addFeature}
          disabled={!newTitle.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {features.length === 0 ? (
        <p className="text-xs text-neutral-500 italic">No features added yet. Add key feature highlights above.</p>
      ) : (
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 rounded-lg p-3 text-sm"
            >
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-neutral-200 block truncate">
                  {idx + 1}. {feature.title}
                </span>
                {feature.description && (
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{feature.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveFeature(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFeature(idx, "down")}
                  disabled={idx === features.length - 1}
                  className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors ml-1"
                  title="Remove Feature"
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
