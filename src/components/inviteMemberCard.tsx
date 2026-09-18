
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const roles = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "member",
    label: "Member",
  },
];

export default function InviteMemberCard() {
  const { workspaceId } = useParams<{
    workspaceId: string;
  }>();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleInvite() {
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/workspace/${workspaceId}/invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "invite-member",
            email: email.trim(),
            role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send invitation.",
        );
      }

      setMessage("Invitation sent successfully.");
      setEmail("");
      setRole("member");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Invite Member
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Invite someone to join this organization.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="user@example.com"
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="mb-1 block text-sm font-medium"
          >
            Role
          </label>

          <select
            id="role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
          >
            {roles.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Success */}
        {message && (
          <p className="text-sm text-green-600">
            {message}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="button"
          onClick={handleInvite}
          disabled={loading}
          className="rounded-lg bg-[var(--board-panel)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </div>
    </div>
  );
}

