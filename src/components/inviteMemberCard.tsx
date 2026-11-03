// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";

// const roles = [
//   {
//     value: "admin",
//     label: "Admin",
//     description: "Can manage organization settings and members.",
//   },
//   {
//     value: "manager",
//     label: "Manager",
//     description: "Can manage members and organization activity.",
//   },
//   {
//     value: "member",
//     label: "Member",
//     description: "Can access the organization and its boards.",
//   },
// ];

// export default function InviteMemberCard() {
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("member");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   const params = useParams();

//   const workspaceId = params.workspaceId as string;

//   async function handleInvite() {
//     setMessage("");
//     setError("");

//     if (!email.trim()) {
//       setError("Please enter an email address.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           action: "invite-member",
//           email: email.trim(),
//           role,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to send invitation.");
//       }

//       setMessage("Invitation sent successfully.");
//       setEmail("");
//       setRole("member");
//     } catch (error) {
//       setError(
//         error instanceof Error ? error.message : "Something went wrong.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <section
//       className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-sm"
//       style={{
//         border: "1px solid var(--color-border)",
//         backgroundColor: "var(--color-card-bg)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className="px-6 py-5"
//         style={{
//           borderBottom: "1px solid var(--color-border)",
//         }}
//       >
//         <div className="flex items-start gap-4">
//           <div
//             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
//             style={{
//               backgroundColor: "var(--color-primary-active-bg)",
//               color: "var(--color-primary)",
//             }}
//           >
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <line x1="19" y1="8" x2="19" y2="14" />
//               <line x1="22" y1="11" x2="16" y2="11" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight"
//               style={{
//                 fontFamily: "var(--font-display)",
//                 color: "var(--color-text-primary)",
//               }}
//             >
//               Invite a member
//             </h2>

//             <p
//               className="mt-1 text-sm leading-6"
//               style={{
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               Add someone to your organization by sending them an invitation.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="space-y-6 p-6">
//         {/* Email */}
//         <div>
//           <label
//             htmlFor="email"
//             className="mb-2 block text-sm font-medium"
//             style={{
//               color: "var(--color-text-primary)",
//             }}
//           >
//             Email address
//           </label>

//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(event) => {
//               setEmail(event.target.value);
//               setError("");
//               setMessage("");
//             }}
//             placeholder="user@example.com"
//             className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
//             style={{
//               border: "1px solid var(--color-border)",
//               backgroundColor: "var(--color-app-bg)",
//               color: "var(--color-text-primary)",
//             }}
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <div className="mb-2">
//             <label
//               htmlFor="role"
//               className="block text-sm font-medium"
//               style={{
//                 color: "var(--color-text-primary)",
//               }}
//             >
//               Organization role
//             </label>

//             <p
//               className="mt-1 text-xs"
//               style={{
//                 color: "var(--color-text-muted)",
//               }}
//             >
//               Choose what this member will be allowed to manage.
//             </p>
//           </div>

//           <select
//             id="role"
//             value={role}
//             onChange={(event) => {
//               setRole(event.target.value);
//               setError("");
//             }}
//             className="w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all"
//             style={{
//               border: "1px solid var(--color-border)",
//               backgroundColor: "var(--color-app-bg)",
//               color: "var(--color-text-primary)",
//             }}
//           >
//             {roles.map((item) => (
//               <option key={item.value} value={item.value}>
//                 {item.label}
//               </option>
//             ))}
//           </select>

//           <div
//             className="mt-2 rounded-lg px-3 py-2.5"
//             style={{
//               backgroundColor: "var(--color-app-bg)",
//               border: "1px solid var(--color-border)",
//             }}
//           >
//             <p
//               className="text-xs leading-5"
//               style={{
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               {roles.find((item) => item.value === role)?.description}
//             </p>
//           </div>
//         </div>

//         {/* Feedback */}
//         {message && (
//           <div
//             className="flex items-start gap-3 rounded-xl px-4 py-3"
//             style={{
//               border: "1px solid var(--color-tag-green-text)",
//               backgroundColor: "var(--color-tag-green-bg)",
//             }}
//           >
//             <span
//               className="mt-0.5"
//               style={{
//                 color: "var(--color-status-done)",
//               }}
//             >
//               ✓
//             </span>

//             <p
//               className="text-sm"
//               style={{
//                 color: "var(--color-tag-green-text)",
//               }}
//             >
//               {message}
//             </p>
//           </div>
//         )}

//         {error && (
//           <div
//             className="flex items-start gap-3 rounded-xl px-4 py-3"
//             style={{
//               border: "1px solid var(--color-tag-red-text)",
//               backgroundColor: "var(--color-tag-red-bg)",
//             }}
//           >
//             <span
//               className="mt-0.5"
//               style={{
//                 color: "var(--color-priority-high)",
//               }}
//             >
//               !
//             </span>

//             <p
//               className="text-sm"
//               style={{
//                 color: "var(--color-tag-red-text)",
//               }}
//             >
//               {error}
//             </p>
//           </div>
//         )}

//         {/* Action */}
//         <div
//           className="flex items-center justify-between gap-4 pt-5"
//           style={{
//             borderTop: "1px solid var(--color-border)",
//           }}
//         >
//           <p
//             className="hidden text-xs sm:block"
//             style={{
//               color: "var(--color-text-muted)",
//             }}
//           >
//             An invitation will be sent to this email.
//           </p>

//           <button
//             type="button"
//             onClick={handleInvite}
//             disabled={loading}
//             className="ml-auto inline-flex min-w-[150px] items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
//             style={{
//               backgroundColor: "var(--color-primary)",
//             }}
//           >
//             {loading ? (
//               <>
//                 <span
//                   className="mr-2 h-4 w-4 animate-spin rounded-full border-2"
//                   style={{
//                     borderColor: "rgba(255,255,255,0.3)",
//                     borderTopColor: "#ffffff",
//                   }}
//                 />
//                 Sending...
//               </>
//             ) : (
//               "Send invitation"
//             )}
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invitationsQueryKey } from "@/components/invitationStatusCard";

export const inviteRoles = [
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

export default function InviteMemberCard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const queryClient = useQueryClient();

  async function handleInvite() {
    setMessage("");
    setError("");
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "invite-member",
          email: email.trim(),
          role,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to send invitation.");
      setMessage("Invitation sent successfully.");
      setEmail("");
      setRole("member");
      // Re-fetch the invitation list so the new PENDING row (with its real
      // id and timestamps) appears without a page reload.
      await queryClient.invalidateQueries({
        queryKey: invitationsQueryKey(workspaceId),
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading) void handleInvite();
  }

  const fieldClass =
    "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-app-bg)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)] disabled:opacity-60";

  return (
    <section className="w-full max-w-6xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-sm">
      <div className="border-b border-[var(--color-border)] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              <path d="M19 8v6M16 11h6" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Invite a member
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              Add someone to your organization by sending them an invitation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <label
              htmlFor="invite-member-email"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Email address
            </label>
            <input
              id="invite-member-email"
              type="email"
              required
              value={email}
              disabled={loading}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setMessage("");
              }}
              placeholder="user@example.com"
              className={fieldClass}
            />
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              An invitation will be sent to this email address.
            </p>
          </div>
          <div>
            <label
              htmlFor="invite-member-role"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Organization role
            </label>
            <select
              id="invite-member-role"
              value={role}
              disabled={loading}
              onChange={(event) => {
                setRole(event.target.value);
                setError("");
              }}
              className={fieldClass}
            >
              {inviteRoles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {inviteRoles.find((item) => item.value === role)?.description}
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className="rounded-xl border border-[var(--color-tag-green-text)] bg-[var(--color-tag-green-bg)] px-4 py-3 text-sm text-[var(--color-tag-green-text)]"
          >
            ✓ {message}
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--color-tag-red-text)] bg-[var(--color-tag-red-bg)] px-4 py-3 text-sm text-[var(--color-tag-red-text)]"
          >
            ! {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            Select a role before sending the invitation.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
      </form>
    </section>
  );
}
