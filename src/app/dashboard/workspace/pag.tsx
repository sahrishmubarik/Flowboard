"use client";

import { useEffect, useState } from "react";

type Workspace = {
  id: string;
  workspaceName: string;
};

export default function WorkspacePage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const workspaceId = "49e69387-f8e1-4137-8bde-3cfb11e70a3f";

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/workspace/${workspaceId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch workspace"
          );
        }

        setWorkspace(data.workspace);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspace();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading workspace...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border p-6 text-center">
          <h1 className="text-xl font-semibold">
            Something went wrong
          </h1>

          <p className="mt-2 text-red-500">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Workspace not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {workspace.workspaceName}
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Workspace ID: {workspace.id}
          </p>
        </div>
      </div>
    </main>
  );
}