"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function CreateProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createProject = api.project.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createProject.mutateAsync({ name, description });
      router.push("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-extrabold text-purple-500">
            Create Project
          </h1>
          <p className="text-gray-400">Set up a new lock-controlled project</p>
        </div>
        
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl border border-purple-900/50 bg-slate-900 p-8 shadow-2xl"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300" htmlFor="name">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-purple-900/50 bg-slate-950/50 px-4 py-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="My Awesome Project"
            />
          </div>
          
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-purple-300"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-purple-900/50 bg-slate-950/50 px-4 py-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Optional: Describe your project"
              rows={4}
            />
          </div>

          <div className="rounded-xl bg-purple-500/10 p-4 text-sm text-purple-300">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Note
            </div>
            Projects are locked by default. You can manage lock status from the dashboard.
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 rounded-xl border border-purple-900/50 bg-slate-950/50 px-6 py-3 font-semibold text-white transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProject.status === "pending"}
              className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {createProject.status === "pending" ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </span>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
