"use client";

import { useEffect, useState } from "react";
import WorkspaceMemberCard from "@/components/workspaceMemberCard";
import InvitationStatusCard from "@/components/invitationStatusCard";
import InviteMemberCard from "@/components/inviteMemberCard";
import DeleteWorkspaceCard from "@/components/deleteWorkspaceCard";

type PanelType = "members" | "invite" | "invitations" | "delete";

const panels = [
  {
    id: "members" as const,
    number: "01",
    title: "Workspace members",
    description: "Manage your team and control access to boards.",
    action: "Manage members",
    icon: "users",
  },
  {
    id: "invite" as const,
    number: "02",
    title: "Invite members",
    description: "Bring teammates into your workspace.",
    action: "Invite teammates",
    icon: "user-plus",
  },
  {
    id: "invitations" as const,
    number: "03",
    title: "Invitation status",
    description: "Review pending, accepted, and revoked invitations.",
    action: "View invitations",
    icon: "mail",
  },
  {
    id: "delete" as const,
    number: "04",
    title: "Delete workspace",
    description: "Permanently remove this workspace and its data.",
    action: "Manage deletion",
    icon: "trash",
  },
];

export default function MembersPage() {
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeItem = panels.find((item) => item.id === activePanel);

  function renderPanel() {
    switch (activePanel) {
      case "members":
        return <WorkspaceMemberCard />;
      case "invite":
        return <InviteMemberCard />;
      case "invitations":
        return <InvitationStatusCard />;
      case "delete":
        return <DeleteWorkspaceCard />;
      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen w-full bg-[var(--color-app-bg)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {/* PAGE HEADER */}
        <header className="mb-8 border-b border-[var(--color-border)] pb-6">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[var(--color-primary)]">
              Members & access
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h1
                className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Members & access
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Everything you need to manage your team, invite collaborators,
                review invitations, and control your workspace in one place.
              </p>
            </div>

            <div className="shrink-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                Workspace settings
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--color-text-primary)]">
                Team & access management
              </p>
            </div>
          </div>
        </header>

        {/* INTRODUCTION */}
        <section className="mb-7">
          <h2
            className="text-lg font-semibold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            People and administration
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Select a section to open its management panel. Your workspace
            overview remains clean while each task gets its own dedicated space.
          </p>
        </section>

        {/* CLICKABLE MANAGEMENT OPTIONS */}
        <section
          aria-label="Workspace management options"
          className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
        >
          {panels.map((panel) => {
            const isDanger = panel.id === "delete";

            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActivePanel(panel.id)}
                className="group flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-[var(--color-card-bg)] sm:gap-5 sm:px-4"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] text-xs font-semibold transition-colors ${
                    isDanger
                      ? "text-[var(--color-priority-high)]"
                      : "text-[var(--color-primary)] group-hover:border-[var(--color-primary)]"
                  }`}
                >
                  {panel.number}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-base font-semibold ${
                      isDanger
                        ? "text-[var(--color-priority-high)]"
                        : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    {panel.title}
                  </span>

                  <span className="mt-1 block max-w-2xl text-sm leading-5 text-[var(--color-text-secondary)]">
                    {panel.description}
                  </span>
                </span>

                <span className="hidden shrink-0 text-sm font-medium text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-primary)] sm:block">
                  {panel.action}
                </span>

                <span
                  aria-hidden="true"
                  className="shrink-0 text-xl text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-primary)]"
                >
                  →
                </span>
              </button>
            );
          })}
        </section>

        {/* FOOTER NOTE */}
        <p className="mt-6 text-xs leading-6 text-[var(--color-text-muted)]">
          Access to workspace administration depends on your assigned role and
          the permissions enforced by the server.
        </p>
      </div>

      {/* LARGE, CENTERED MODAL */}
      {activePanel && activeItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6 lg:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActivePanel(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-panel-title"
            className="flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-2xl sm:max-h-[90dvh]"
          >
            {/* MODAL HEADER */}
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-8 sm:py-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  Workspace management
                </p>

                <h2
                  id="workspace-panel-title"
                  className="mt-1 text-xl font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {activeItem.title}
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {activeItem.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePanel(null)}
                aria-label="Close management panel"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] text-2xl text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-app-bg)] hover:text-[var(--color-text-primary)]"
              >
                ×
              </button>
            </header>

            {/* PANEL CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto w-full max-w-3.5xl">{renderPanel()}</div>
            </div>
          </section>
        </div>
      )}
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
