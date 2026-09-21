
// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";

// const roles = [
//   {
//     value: "admin",
//     label: "Admin",
//   },
//   {
//     value: "manager",
//     label: "Manager",
//   },
//   {
//     value: "member",
//     label: "Member",
//   },
// ];

// export default function InviteMemberCard() {
//   const { workspaceId } = useParams<{
//     workspaceId: string;
//   }>();

//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("member");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   async function handleInvite() {
//     setMessage("");
//     setError("");

//     if (!email.trim()) {
//       setError("Please enter an email address.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch(
//         `/api/workspace/${workspaceId}/invitation`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             action: "invite-member",
//             email: email.trim(),
//             role,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to send invitation.",
//         );
//       }

//       setMessage("Invitation sent successfully.");
//       setEmail("");
//       setRole("member");
//     } catch (error) {
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Something went wrong.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="rounded-xl border bg-white p-6 shadow-sm">
//       <div className="mb-5">
//         <h2 className="text-lg font-semibold">
//           Invite Member
//         </h2>

//         <p className="mt-1 text-sm text-gray-500">
//           Invite someone to join this organization.
//         </p>
//       </div>

//       <div className="space-y-4">
//         {/* Email */}
//         <div>
//           <label
//             htmlFor="email"
//             className="mb-1 block text-sm font-medium"
//           >
//             Email address
//           </label>

//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(event) =>
//               setEmail(event.target.value)
//             }
//             placeholder="user@example.com"
//             className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label
//             htmlFor="role"
//             className="mb-1 block text-sm font-medium"
//           >
//             Role
//           </label>

//           <select
//             id="role"
//             value={role}
//             onChange={(event) =>
//               setRole(event.target.value)
//             }
//             className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
//           >
//             {roles.map((item) => (
//               <option
//                 key={item.value}
//                 value={item.value}
//               >
//                 {item.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Success */}
//         {message && (
//           <p className="text-sm text-green-600">
//             {message}
//           </p>
//         )}

//         {/* Error */}
//         {error && (
//           <p className="text-sm text-red-600">
//             {error}
//           </p>
//         )}

//         {/* Button */}
//         <button
//           type="button"
//           onClick={handleInvite}
//           disabled={loading}
//           className="rounded-lg bg-[var(--board-panel)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           {loading ? "Sending..." : "Send Invitation"}
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const roles = [
  {
    value: "admin",
    label: "Admin",
    description: "Can manage organization settings and members.",
  },
  {
    value: "manager",
    label: "Manager",
    description: "Can manage members and organization activity.",
  },
  {
    value: "member",
    label: "Member",
    description: "Can access the organization and its boards.",
  },
];

type InviteMemberCardProps = {
  workspaceId: string;
};

export default function InviteMemberCard({
  workspaceId,
}: InviteMemberCardProps){

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
    <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--mist)] px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>

          <div>
            <h2
              className="text-xl font-medium tracking-tight text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Invite a member
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              Add someone to your organization by sending them an
              invitation.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6 p-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--ink)]"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder="user@example.com"
            className="w-full rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
          />
        </div>

        {/* Role */}
        <div>
          <div className="mb-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[var(--ink)]"
            >
              Organization role
            </label>

            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              Choose what this member will be allowed to manage.
            </p>
          </div>

          <select
            id="role"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setError("");
            }}
            className="w-full appearance-none rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
          >
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <div className="mt-2 rounded-lg bg-[var(--paper)] px-3 py-2.5">
            <p className="text-xs leading-5 text-[var(--ink-soft)]">
              {
                roles.find((item) => item.value === role)
                  ?.description
              }
            </p>
          </div>
        </div>

        {/* Feedback */}
        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--sage)]/30 bg-[var(--sage)]/[0.08] px-4 py-3">
            <span className="mt-0.5 text-[var(--sage)]">✓</span>

            <p className="text-sm text-[var(--ink)]">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
            <span className="mt-0.5 text-[var(--coral)]">!</span>

            <p className="text-sm text-[var(--ink)]">
              {error}
            </p>
          </div>
        )}

        {/* Action */}
        <div className="flex items-center justify-between gap-4 border-t border-[var(--mist)] pt-5">
          <p className="hidden text-xs text-[var(--ink-soft)] sm:block">
            An invitation will be sent to this email.
          </p>

          <button
            type="button"
            onClick={handleInvite}
            disabled={loading}
            className="ml-auto inline-flex min-w-[150px] items-center justify-center rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--board-ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending...
              </>
            ) : (
              "Send invitation"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

