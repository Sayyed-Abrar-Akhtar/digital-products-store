"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProjectAction, ActionState } from "@/app/actions/project-actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-blue-600 text-white font-semibold text-sm rounded-md shadow hover:bg-blue-700 transition-opacity disabled:opacity-50"
    >
      {pending ? "Creating Project..." : "Create Project"}
    </button>
  );
}

const initialState: ActionState = {
  success: false,
  message: "",
};

export function CreateProjectForm() {
  const [state, formAction] = useActionState(createProjectAction, initialState);

  return (
    <form action={formAction} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 max-w-md text-white">
      <h3 className="text-lg font-bold">Deploy New Project</h3>

      {state.message && (
        <div
          className={`p-3 text-xs rounded-md font-medium ${
            state.success ? "bg-green-950 text-green-300 border border-green-800" : "bg-red-950 text-red-300 border border-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-semibold text-slate-400">
          Project Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Telemetry Service"
          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {state.errors?.name && (
          <p className="text-xs text-red-400 font-medium">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="slug" className="text-xs font-semibold text-slate-400">
          URL Slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="e.g. telemetry-service"
          className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {state.errors?.slug && (
          <p className="text-xs text-red-400 font-medium">{state.errors.slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="environment" className="text-xs font-semibold text-slate-400">
            Environment
          </label>
          <select
            id="environment"
            name="environment"
            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="region" className="text-xs font-semibold text-slate-400">
            Region
          </label>
          <select
            id="region"
            name="region"
            className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="us-east-1">us-east-1</option>
            <option value="us-west-2">us-west-2</option>
            <option value="eu-central-1">eu-central-1</option>
          </select>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
