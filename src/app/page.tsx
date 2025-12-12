"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProjectsLanding() {
  const { data: projects, isLoading, refetch } = api.project.list.useQuery();
  const lockMutation = api.project.lock.useMutation();
  const unlockMutation = api.project.unlock.useMutation();
  const { status } = useSession();
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const router = useRouter();

  const handleLockToggle = async (projectId: number, locked: boolean) => {
    setLoadingProjectId(projectId);
    try {
      if (locked) {
        await unlockMutation.mutateAsync({ projectId });
      } else {
        await lockMutation.mutateAsync({ projectId });
      }
      await refetch();
    } finally {
      setLoadingProjectId(null);
    }
  };

  const copyApiUrl = (projectId: number) => {
    const apiUrl = `${window.location.origin}/api/lock-status?projectId=${projectId}`;
    void navigator.clipboard.writeText(apiUrl);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <span className="text-lg font-medium text-white">Loading projects...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-6xl font-extrabold tracking-tight text-purple-500">
              LockSystem
            </h1>
            <p className="text-lg text-gray-400">Manage your project deployments with ease</p>
          </div>
          <button
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105"
            onClick={() => router.push("/create")}
          >
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-2xl border border-purple-900/50 bg-slate-900 p-6 shadow-xl transition-all hover:scale-[1.02] hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                {/* Lock Status Badge */}
                <div className="absolute right-4 top-4">
                  <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    project.locked
                      ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                      : "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      project.locked ? "bg-red-500" : "bg-green-500"
                    } animate-pulse`}></span>
                    {project.locked ? "Locked" : "Unlocked"}
                  </div>
                </div>

                {/* Project Name */}
                <h2 className="mb-4 mt-2 text-2xl font-bold text-white">
                  {project.name}
                </h2>

                {/* API Endpoint */}
                <div className="mb-4 rounded-lg bg-slate-950/50 p-3 font-mono text-xs">
                  <div className="mb-1 text-gray-400">API Endpoint:</div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 overflow-hidden text-ellipsis text-purple-300">
                      /api/lock-status?projectId={project.id}
                    </code>
                    <button
                      onClick={() => copyApiUrl(project.id)}
                      className="rounded bg-purple-600/50 px-2 py-1 text-white transition hover:bg-purple-600"
                      title="Copy full URL"
                    >
                      {copiedId === project.id ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Created Date */}
                <div className="mb-4 text-sm text-gray-400">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>

                {/* Lock Toggle Button */}
                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
                    project.locked
                      ? "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50"
                      : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => handleLockToggle(project.id, project.locked)}
                  disabled={
                    lockMutation.status === "pending" ||
                    unlockMutation.status === "pending" ||
                    loadingProjectId === project.id
                  }
                >
                  {loadingProjectId === project.id ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {project.locked ? (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span>Unlock Project</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Lock Project</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-900/50 bg-slate-900/50 p-12 text-center">
            <svg className="mb-4 h-16 w-16 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mb-2 text-xl font-semibold text-white">No projects yet</h3>
            <p className="mb-6 text-gray-400">Create your first project to get started</p>
            <button
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105"
              onClick={() => router.push("/create")}
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
