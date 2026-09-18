"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAcceptInvitation() {
    setError("");

    if (!workspaceId || !token) {
      setError("Invalid invitation link.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept-invitation",
          token,
        }),
      });

      const data = await response.json();

      // User is not logged in
      if (response.status === 401) {
        const currentUrl = `/dashboard/workspace/${workspaceId}/invitation/accept?token=${encodeURIComponent(token)}`;

        router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);

        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation.");
      }

      router.push("/dashboard/workspace");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Workspace Invitation</h1>

          <p className="mt-3 text-sm text-gray-500">
            You have been invited to join a Flowboard workspace.
          </p>
        </div>

        {error && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAcceptInvitation}
          disabled={loading || !token || !workspaceId}
          className="mt-6 w-full rounded-lg bg-[var(--board-panel)] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Accepting..." : "Accept Invitation"}
        </button>
      </div>
    </main>
  );
}
