
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DeleteWorkspaceCard(){
 
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
 const router=useRouter();
  const workspaceId = params.workspaceId as string;
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/workspace/${workspaceId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete workspace",
        );
      }

      console.log("Workspace deleted:", data);
  
      router.push("/dashboard/workspace");
    } catch (error) {
      console.error("DELETE_WORKSPACE_ERROR:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-red-200 p-6">
      <h2 className="text-xl font-semibold">
        Delete Workspace
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Delete permanently.
      </p>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete Workspace"}
      </button>
    </div>
  );
}

