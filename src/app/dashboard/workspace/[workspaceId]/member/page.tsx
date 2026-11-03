"use client";
import { useParams } from "next/navigation";
import PageHeader, { pageContainerClass } from "@/components/ui/PageHeader";
import PeopleTable from "@/components/members/PeopleTable";
import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";

export default function MembersPage() {
  const params = useParams<{ workspaceId: string }>();

  const workspaceId = params.workspaceId;

  return (
    <main className="min-h-screen w-full bg-[var(--color-app-bg)] text-[var(--color-text-primary)]">
      <div className={pageContainerClass}>
        {/* PAGE HEADER */}
        <PageHeader
          workspaceId={workspaceId}
          title="Members & access"
          description="See who's in this workspace, invite teammates and manage pending invitations."
        />

        {/* MEMBERS AND INVITATIONS, WITH INVITE IN ITS TOOLBAR */}
        <PeopleTable workspaceId={workspaceId} />

        <div className="mt-10">
          <DeleteWorkspaceCard workspaceId={workspaceId} />
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-6 text-xs leading-6 text-[var(--color-text-muted)]">
          Access to workspace administration depends on your assigned role and
          the permissions enforced by the server.
        </p>
      </div>
    </main>
  );
}

// "use client";

// import { useState } from "react";
// import WorkspaceMemberCard from "@/components/workspaceMemberCard";
// import InvitationStatusCard from "@/components/invitationStatusCard";
// import InviteMemberCard from "@/components/inviteMemberCard";
// import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";

// const sections = [
//   {
//     id: "members",
//     title: "Workspace members",
//     description: "Manage members and their workspace access.",
//   },
//   {
//     id: "invite",
//     title: "Invite members",
//     description: "Invite people to collaborate with your team.",
//   },
//   {
//     id: "invitations",
//     title: "Invitation status",
//     description: "Review pending and completed invitations.",
//   },
//   {
//     id: "delete",
//     title: "Delete workspace",
//     description: "Permanently remove this workspace.",
//   },
// ];

// export default function MembersPage() {
//   const [activeSection, setActiveSection] = useState<string | null>(null);

//   return (
//     <main className="w-full min-w-0">
//       {/* PAGE HEADER */}
//       <header className="mb-8">
//         <p className="mb-2 text-sm font-medium text-[var(--color-primary)]">
//           WORKSPACE SETTINGS
//         </p>

//         <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
//           Members & access
//         </h1>

//         <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
//           Manage your workspace members, send invitations, review invitation
//           activity, and control workspace settings from one place.
//         </p>
//       </header>

//       {/* SECTION SELECTORS */}
//       <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
//         {sections.map((section) => (
//           <button
//             key={section.id}
//             type="button"
//             onClick={() =>
//               setActiveSection((current) =>
//                 current === section.id ? null : section.id
//               )
//             }
//             aria-expanded={activeSection === section.id}
//             className={`rounded-xl border p-4 text-left transition-colors ${
//               activeSection === section.id
//                 ? "border-[var(--color-primary)] bg-[var(--color-primary-active-bg)]"
//                 : "border-[var(--color-border)] bg-[var(--color-card-bg)] hover:bg-[var(--color-app-bg)]"
//             }`}
//           >
//             <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
//               {section.title}
//             </span>

//             <span className="mt-2 block text-xs leading-5 text-[var(--color-text-secondary)]">
//               {section.description}
//             </span>

//             <span className="mt-3 block text-sm font-medium text-[var(--color-primary)]">
//               {activeSection === section.id ? "Close section −" : "Open section →"}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* CENTERED COMPONENT CONTAINER */}
//       {activeSection && (
//         <section className="flex w-full min-w-0 justify-center">
//           <div className="w-full max-w-5xl min-w-0">
//             {activeSection === "members" && <WorkspaceMemberCard />}
//             {activeSection === "invite" && <InviteMemberCard />}
//             {activeSection === "invitations" && <InvitationStatusCard />}
//             {activeSection === "delete" && <DeleteWorkspaceCard />}
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }
