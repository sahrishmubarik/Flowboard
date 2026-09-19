
"use client";

import { useState } from "react";
import {  useParams } from "next/navigation";


export default function UpdateWorkspaceCard() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/workspace/${workspaceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update workspace");
      }

      console.log("Workspace updated:", data);
    } catch (error) {
      console.error("UPDATE_WORKSPACE_ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Update Workspace
      </h2>

      <input
        type="text"
        value={workspaceName}
        onChange={(event) => setWorkspaceName(event.target.value)}
        placeholder="Workspace name"
        className="mb-4 w-full rounded-md border px-3 py-2"
      />

      <button
        type="button"
        onClick={handleUpdate}
        disabled={isLoading}
        className="rounded-md px-4 py-2"
      >
        {isLoading ? "Updating..." : "Update Workspace"}
      </button>
    </div>
  );
}

