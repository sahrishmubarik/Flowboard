"use client";
import Link from "next/link";

// import { useEffect, useState } from "react";

// type Workspace = {
//   id: string;
//   workspaceName: string;
// };

// export default function WorkspacePage() {
//   const [workspace, setWorkspace] = useState<Workspace | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const workspaceId = "49e69387-f8e1-4137-8bde-3cfb11e70a3f";

//   useEffect(() => {
//     async function fetchWorkspace() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch(
//           `/api/workspace/${workspaceId}`
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data.message || "Failed to fetch workspace"
//           );
//         }

//         setWorkspace(data.workspace);
//       } catch (error) {
//         setError(
//           error instanceof Error
//             ? error.message
//             : "Something went wrong"
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchWorkspace();
//   }, []);

//   if (loading) {
//     return (
//       <main className="flex min-h-screen items-center justify-center">
//         <p>Loading workspace...</p>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="flex min-h-screen items-center justify-center">
//         <div className="rounded-lg border p-6 text-center">
//           <h1 className="text-xl font-semibold">
//             Something went wrong
//           </h1>

//           <p className="mt-2 text-red-500">
//             {error}
//           </p>
//         </div>
//       </main>
//     );
//   }

//   if (!workspace) {
//     return (
//       <main className="flex min-h-screen items-center justify-center">
//         <p>Workspace not found.</p>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <div className="mx-auto max-w-5xl">
//         <div className="rounded-xl border bg-white p-8 shadow-sm">
//           <p className="text-sm text-gray-500">
//             Workspace
//           </p>

//           <h1 className="mt-2 text-3xl font-bold">
//             {workspace.workspaceName}
//           </h1>

//           <p className="mt-3 text-sm text-gray-500">
//             Workspace ID: {workspace.id}
//           </p>
//         </div>
//       </div>
//     </main>
//   );
// }

// export default function workspace(){
//   return(
//     <>
//     <h1>See your Organization Here</h1>
//     <div>
//       <h2>
//         Go to and create your space for organization
//       </h2>
//       <a href="/dashboard/workspace/create-workspace">
//       Click here to create
//       </a>
//     </div>
//     </>
//   )

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
export default function Workspace() {
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workspaces");
      }

      return data;
    },
  });

  if (isLoading) {
    return <p>Loading organizations...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  const workspaces = data?.workspace ?? [];
  console.log(workspaces.length);

  return (
    <main>
      <h1>See Your Organizations Here</h1>

      {workspaces.length === 0 ? (
        <div>
          <h2>Create your organization space</h2>

          <Link href="/dashboard/workspace/create-workspace">
            Click here to create
          </Link>
        </div>
      ) : (
        <div>
          <h2>Your Organizations</h2>

          <select
            defaultValue=""
            onChange={(event) => {
              const workspaceId = event.target.value;

              if (!workspaceId) return;

              router.push(`/dashboard/workspace/${workspaceId}`);
            }}
          >
            <option value="" disabled>
              Select an organization
            </option>

            {workspaces.map((workspace) => (
              <option key={workspace.workspaceId} value={workspace.workspaceId}>
                {workspace.workspaceName} ({workspace.role})
              </option>
            ))}
          </select>

          <br />

          <Link href="/dashboard/workspace/create-workspace">
            + Create New Organization
          </Link>
        </div>
      )}
    </main>
  );
}
