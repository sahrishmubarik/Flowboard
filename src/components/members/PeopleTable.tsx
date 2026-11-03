"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Download,
  LayoutGrid,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { invitationsQueryKey } from "@/components/invitationStatusCard";
import InviteMemberDialog from "@/components/members/InviteMemberDialog";
import MemberBoardDialog, {
  type BoardDialogAction,
  type BoardDialogMember,
} from "@/components/members/MemberBoardDialog";

type Role = "owner" | "admin" | "manager" | "member";
type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED";
type PersonStatus = "JOINED" | "PENDING" | "EXPIRED" | "REVOKED";
type StatusTab = "ALL" | "MEMBERS" | "PENDING" | "REVOKED";

type Member = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  expiresAt: string | null;
  createdAt: string;
};

type Pagination = { totalPages?: number };

type MembersResponse = {
  message?: string;
  members?: Member[];
  pagination?: Pagination;
};

type InvitationsResponse = {
  message?: string;
  invitations?: Invitation[];
  pagination?: Pagination;
};

type WorkspacesResponse = {
  workspace?: { workspaceId: string; role: Role }[];
};

type CurrentUserResponse = {
  user?: { id: string };
};

// One row of the table: a workspace member or an invitation.
type Person = {
  key: string;
  name: string;
  email: string;
  role: Role;
  status: PersonStatus;
  // Joined date for members, invited date for invitations.
  date: string;
  expiresAt: string | null;
  isYou: boolean;
  member?: Member;
  invitation?: Invitation;
};

type PeopleTableProps = {
  workspaceId: string;
};

const PAGE_SIZES = [10, 25, 50];
// The API caps a page at 100 records.
const FETCH_LIMIT = 100;

const roleOrder: Record<Role, number> = {
  owner: 0,
  admin: 1,
  manager: 2,
  member: 3,
};

const statusOrder: Record<PersonStatus, number> = {
  JOINED: 0,
  PENDING: 1,
  EXPIRED: 2,
  REVOKED: 3,
};

const roleMeta: Record<Role, { label: string; icon: ReactNode }> = {
  owner: { label: "Owner", icon: <Crown size={14} aria-hidden="true" /> },
  admin: { label: "Admin", icon: <ShieldCheck size={14} aria-hidden="true" /> },
  manager: {
    label: "Manager",
    icon: <Briefcase size={14} aria-hidden="true" />,
  },
  member: { label: "Member", icon: <User size={14} aria-hidden="true" /> },
};

const statusMeta: Record<PersonStatus, { label: string; tone: string }> = {
  JOINED: { label: "Joined", tone: "green" },
  PENDING: { label: "Pending", tone: "yellow" },
  EXPIRED: { label: "Expired", tone: "neutral" },
  REVOKED: { label: "Revoked", tone: "red" },
};

const avatarTones = ["blue", "purple", "green", "red", "yellow", "neutral"];

function toneStyle(tone: string) {
  return {
    backgroundColor: `var(--color-tag-${tone}-bg)`,
    color: `var(--color-tag-${tone}-text)`,
  };
}

// Same colour for the same person on every render.
function avatarTone(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return avatarTones[hash % avatarTones.length];
}

function initials(name: string) {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

// Reads every page of a list endpoint so search, filters and paging can
// work across members and invitations together.
async function fetchAllPages<R extends { pagination?: Pagination }, T>(
  url: string,
  pick: (data: R) => T[],
  signal: AbortSignal,
) {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(FETCH_LIMIT),
    });
    const response = await fetch(`${url}?${query.toString()}`, {
      signal,
      cache: "no-store",
    });
    const data: R & { message?: string } = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");

    items.push(...pick(data));
    totalPages = Math.max(1, data.pagination?.totalPages ?? 1);
    page += 1;
  } while (page <= totalPages);

  return items;
}

// Quote CSV cells; prefix values a spreadsheet would run as a formula.
function csvCell(value: string) {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function PeopleTable({ workspaceId }: PeopleTableProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("ALL");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  // "<row key>:actions" or "<row key>:status"
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [boardDialog, setBoardDialog] = useState<{
    member: BoardDialogMember;
    action: BoardDialogAction;
  } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Person | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<Person | null>(null);

  // ----- Who is viewing (shared with the sidebar's queries) -----

  const { data: workspacesData } = useQuery<WorkspacesResponse>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch workspaces");
      return data;
    },
  });

  const { data: userData } = useQuery<CurrentUserResponse>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch("/api/auth");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch current user");
      return data;
    },
  });

  const myRole = workspacesData?.workspace?.find(
    (item) => item.workspaceId === workspaceId,
  )?.role;
  const myUserId = userData?.user?.id;

  // Matches the server: owners and admins manage people, invitations and
  // board removal; managers can also assign members to boards.
  const canManagePeople = myRole === "owner" || myRole === "admin";
  const canManageBoards = canManagePeople || myRole === "manager";

  // ----- Data -----

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId, "all"],
    queryFn: ({ signal }) =>
      fetchAllPages(
        `/api/workspace/${workspaceId}/members`,
        (data: MembersResponse) => data.members ?? [],
        signal,
      ),
    enabled: Boolean(workspaceId),
  });

  const invitationsQuery = useQuery({
    queryKey: [...invitationsQueryKey(workspaceId), "all"],
    queryFn: async ({ signal }) => {
      const invitations = await fetchAllPages(
        `/api/workspace/${workspaceId}/invitation`,
        (data: InvitationsResponse) => data.invitations ?? [],
        signal,
      );
      // Expiry is judged when the list is fetched, not on every render.
      const fetchedAt = Date.now();
      return invitations.map((invitation) => ({
        ...invitation,
        isExpired:
          invitation.status === "PENDING" &&
          invitation.expiresAt !== null &&
          new Date(invitation.expiresAt).getTime() < fetchedAt,
      }));
    },
    enabled: Boolean(workspaceId) && canManagePeople,
  });

  const people = useMemo<Person[]>(() => {
    const memberRows: Person[] = (membersQuery.data ?? []).map((member) => ({
      key: `member-${member.id}`,
      name: member.name?.trim() || member.email.split("@")[0],
      email: member.email,
      role: member.role,
      status: "JOINED",
      date: member.createdAt,
      expiresAt: null,
      isYou: member.userId === myUserId,
      member,
    }));

    // Accepted invitations already appear as members.
    const invitationRows: Person[] = (invitationsQuery.data ?? [])
      .filter((invitation) => invitation.status !== "ACCEPTED")
      .map((invitation) => {
        return {
          key: `invitation-${invitation.id}`,
          name: invitation.email.split("@")[0],
          email: invitation.email,
          role: invitation.role,
          status: invitation.isExpired
            ? "EXPIRED"
            : (invitation.status as Exclude<InvitationStatus, "ACCEPTED">),
          date: invitation.createdAt,
          expiresAt: invitation.expiresAt,
          isYou: false,
          invitation,
        } satisfies Person;
      });

    return [...memberRows, ...invitationRows].sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        (a.status === "JOINED"
          ? roleOrder[a.role] - roleOrder[b.role]
          : new Date(b.date).getTime() - new Date(a.date).getTime()) ||
        a.name.localeCompare(b.name),
    );
  }, [membersQuery.data, invitationsQuery.data, myUserId]);

  // Search and role apply first, so the tab counts match what they show.
  const searched = useMemo(() => {
    const term = search.trim().toLowerCase();
    return people.filter(
      (person) =>
        (!roleFilter || person.role === roleFilter) &&
        (!term ||
          person.name.toLowerCase().includes(term) ||
          person.email.toLowerCase().includes(term)),
    );
  }, [people, search, roleFilter]);

  const counts: Record<StatusTab, number> = {
    ALL: searched.length,
    MEMBERS: searched.filter((p) => p.status === "JOINED").length,
    PENDING: searched.filter(
      (p) => p.status === "PENDING" || p.status === "EXPIRED",
    ).length,
    REVOKED: searched.filter((p) => p.status === "REVOKED").length,
  };

  const visible = searched.filter((person) => {
    if (statusTab === "MEMBERS") return person.status === "JOINED";
    if (statusTab === "PENDING")
      return person.status === "PENDING" || person.status === "EXPIRED";
    if (statusTab === "REVOKED") return person.status === "REVOKED";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageRows = visible.slice(firstIndex, firstIndex + pageSize);

  const isLoading =
    membersQuery.isPending || (canManagePeople && invitationsQuery.isPending);
  const loadError =
    membersQuery.error ?? (canManagePeople ? invitationsQuery.error : null);
  const hasFilters = Boolean(search.trim() || roleFilter || statusTab !== "ALL");

  // ----- Menus close on outside click and Esc -----

  useEffect(() => {
    if (!openMenu) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-people-menu]")
      )
        setOpenMenu(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  // ----- Mutations -----

  const removeMutation = useMutation({
    mutationFn: async (person: Person) => {
      const response = await fetch(`/api/workspace/${workspaceId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: person.member?.userId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove workspace member.");
      return data as { message?: string };
    },
    onSuccess: async (_data, person) => {
      showToast(`${person.name} was removed from the workspace.`, "success");
      setMemberToRemove(null);
      // Also refreshes the member count on the workspace overview.
      await queryClient.invalidateQueries({
        queryKey: ["workspace-members", workspaceId],
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (person: Person) => {
      // Existing PATCH contract revokes the pending invitation by email.
      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: person.email }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to revoke invitation.");
      return data as { message?: string };
    },
    onSuccess: async (_data, person) => {
      showToast(`Invitation to ${person.email} was revoked.`, "success");
      setInviteToRevoke(null);
      await queryClient.invalidateQueries({
        queryKey: invitationsQueryKey(workspaceId),
      });
    },
  });

  // ----- Helpers -----

  function resetPaging() {
    setPage(1);
    setOpenMenu(null);
  }

  function clearFilters() {
    setSearch("");
    setRoleFilter("");
    setStatusTab("ALL");
    resetPaging();
  }

  function toggleMenu(id: string) {
    setOpenMenu((current) => (current === id ? null : id));
  }

  async function copyEmail(email: string) {
    setOpenMenu(null);
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied.", "success");
    } catch {
      showToast("Couldn't copy the email.", "error");
    }
  }

  function exportCsv() {
    const header = ["Name", "Email", "Access", "Last update", "Status", "Role"];
    const rows = visible.map((person) => [
      person.invitation ? "" : person.name,
      person.email,
      person.status === "JOINED" ? "Active" : "No access",
      formatDate(person.date),
      statusMeta[person.status].label,
      roleMeta[person.role].label,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `workspace-people-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const canRevoke = (person: Person) =>
    canManagePeople &&
    (person.status === "PENDING" || person.status === "EXPIRED");

  const hasActions = (person: Person) =>
    person.member
      ? person.role !== "owner" && canManageBoards
      : canManagePeople && person.status !== "REVOKED";

  // ----- Cells -----

  const menuItemClass =
    "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-card-hover)] focus-visible:bg-[var(--color-card-hover)] focus-visible:outline-none";
  const dangerItemClass =
    "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--color-tag-red-text)] transition-colors hover:bg-[var(--color-tag-red-bg)] focus-visible:bg-[var(--color-tag-red-bg)] focus-visible:outline-none";
  const menuPanelClass =
    "absolute right-0 top-[calc(100%+4px)] z-30 w-56 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-1 text-left shadow-[var(--shadow-md)]";

  const renderAvatar = (person: Person) =>
    person.invitation ? (
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--color-text-muted)] text-[var(--color-text-muted)]"
      >
        <Mail size={15} />
      </span>
    ) : (
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={toneStyle(avatarTone(person.email))}
      >
        {initials(person.name)}
      </span>
    );

  const renderName = (person: Person, showEmail: string) => (
    <div className="flex min-w-0 items-center gap-3">
      {renderAvatar(person)}
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5">
          <span
            className={`truncate text-sm font-medium ${
              person.invitation
                ? "text-[var(--color-text-secondary)]"
                : "text-[var(--color-text-primary)]"
            }`}
            title={person.name}
          >
            {person.name}
          </span>
          {person.isYou && (
            <span className="shrink-0 rounded-full bg-[var(--color-primary-active-bg)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              You
            </span>
          )}
        </p>
        <p
          className={`truncate text-xs text-[var(--color-text-muted)] ${showEmail}`}
          title={person.email}
        >
          {person.email}
        </p>
      </div>
    </div>
  );

  const renderAccess = (person: Person) => {
    const active = person.status === "JOINED";
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: active
              ? "var(--color-status-done)"
              : "var(--color-text-muted)",
          }}
        />
        {active ? "Active" : "No access"}
      </span>
    );
  };

  const renderDate = (person: Person) => (
    <div className="whitespace-nowrap">
      <p className="text-sm text-[var(--color-text-primary)]">
        {formatDate(person.date)}
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        {person.status === "JOINED"
          ? "Joined"
          : person.status === "PENDING" && person.expiresAt
            ? `Expires ${formatDate(person.expiresAt)}`
            : person.status === "EXPIRED"
              ? `Expired ${formatDate(person.expiresAt)}`
              : "Invited"}
      </p>
    </div>
  );

  const badgeClass =
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold";

  const renderStatus = (person: Person) => {
    const meta = statusMeta[person.status];

    // Pending invitations open a small menu with the revoke action.
    if (canRevoke(person)) {
      const menuId = `${person.key}:status`;
      return (
        <div className="relative inline-block" data-people-menu>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={openMenu === menuId}
            aria-label={`${meta.label} invitation for ${person.email}. Show options`}
            onClick={() => toggleMenu(menuId)}
            className={`${badgeClass} transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]`}
            style={toneStyle(meta.tone)}
          >
            {meta.label}
            <ChevronDown size={12} aria-hidden="true" />
          </button>
          {openMenu === menuId && (
            <div role="menu" className={`${menuPanelClass} left-0 right-auto`}>
              <p className="px-3 pb-1.5 pt-2 text-xs text-[var(--color-text-muted)]">
                {person.status === "EXPIRED"
                  ? `Expired ${formatDate(person.expiresAt)}`
                  : `Sent ${formatDate(person.date)}`}
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenu(null);
                  revokeMutation.reset();
                  setInviteToRevoke(person);
                }}
                className={dangerItemClass}
              >
                <XCircle size={15} aria-hidden="true" />
                Revoke invitation
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <span className={badgeClass} style={toneStyle(meta.tone)}>
        {meta.label}
      </span>
    );
  };

  const renderRole = (person: Person) => (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
      <span className="text-[var(--color-text-muted)]">
        {roleMeta[person.role].icon}
      </span>
      {roleMeta[person.role].label}
    </span>
  );

  const renderActions = (person: Person) => {
    if (!hasActions(person)) return null;

    const menuId = `${person.key}:actions`;
    const member = person.member;

    return (
      <div className="relative inline-block" data-people-menu>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === menuId}
          aria-label={`Actions for ${person.isYou ? "you" : person.name}`}
          onClick={() => toggleMenu(menuId)}
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] aria-expanded:bg-[var(--color-card-hover)]"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>

        {openMenu === menuId && (
          <div role="menu" className={menuPanelClass}>
            {member ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpenMenu(null);
                    setBoardDialog({
                      member: {
                        userId: member.userId,
                        name: person.name,
                        email: person.email,
                      },
                      action: "assign",
                    });
                  }}
                  className={menuItemClass}
                >
                  <LayoutGrid size={15} aria-hidden="true" />
                  Assign to board
                </button>
                {canManagePeople && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpenMenu(null);
                      setBoardDialog({
                        member: {
                          userId: member.userId,
                          name: person.name,
                          email: person.email,
                        },
                        action: "remove-board",
                      });
                    }}
                    className={menuItemClass}
                  >
                    <X size={15} aria-hidden="true" />
                    Remove from board
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void copyEmail(person.email)}
                  className={menuItemClass}
                >
                  <Copy size={15} aria-hidden="true" />
                  Copy email
                </button>
                {canManagePeople && (
                  <>
                    <div className="my-1 h-px bg-[var(--color-border)]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenMenu(null);
                        removeMutation.reset();
                        setMemberToRemove(person);
                      }}
                      className={dangerItemClass}
                    >
                      <UserMinus size={15} aria-hidden="true" />
                      Remove from workspace
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void copyEmail(person.email)}
                  className={menuItemClass}
                >
                  <Copy size={15} aria-hidden="true" />
                  Copy email
                </button>
                {canRevoke(person) && (
                  <>
                    <div className="my-1 h-px bg-[var(--color-border)]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenMenu(null);
                        revokeMutation.reset();
                        setInviteToRevoke(person);
                      }}
                      className={dangerItemClass}
                    >
                      <XCircle size={15} aria-hidden="true" />
                      Revoke invitation
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const tabs: { value: StatusTab; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "MEMBERS", label: "Members" },
    { value: "PENDING", label: "Pending" },
    { value: "REVOKED", label: "Revoked" },
  ];

  const iconButtonClass =
    "inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

  const thClass =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]";

  // ----- Render -----

  return (
    <section className="w-full min-w-0 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-sm)]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
              <Users size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
                People
                {!isLoading && !loadError && (
                  <span className="rounded-full bg-[var(--color-tag-neutral-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-tag-neutral-text)]">
                    {people.length}
                  </span>
                )}
              </h2>
              <p className="truncate text-xs text-[var(--color-text-muted)]">
                {canManagePeople
                  ? "Members and invitations for this workspace"
                  : "Members of this workspace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={isLoading || visible.length === 0}
              className={iconButtonClass}
              title="Download the current list as a CSV file"
            >
              <Download size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
              <span className="sr-only sm:hidden">Export CSV</span>
            </button>
            {canManagePeople && (
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                <UserPlus size={16} aria-hidden="true" />
                Invite member
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPaging();
              }}
              placeholder="Search name or email"
              aria-label="Search people by name or email"
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManagePeople && (
              <div
                role="group"
                aria-label="Filter by status"
                className="flex max-w-full overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-app-bg)] p-0.5"
              >
                {tabs.map((tab) => {
                  const selected = statusTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setStatusTab(tab.value);
                        resetPaging();
                      }}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                        selected
                          ? "bg-[var(--color-card-bg)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]"
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 text-[11px] ${
                          selected
                            ? "bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {counts[tab.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <label className="sr-only" htmlFor="people-role-filter">
              Filter by role
            </label>
            <select
              id="people-role-filter"
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as Role | "");
                resetPaging();
              }}
              className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)]"
            >
              <option value="">All roles</option>
              {(Object.keys(roleMeta) as Role[]).map((role) => (
                <option key={role} value={role}>
                  {roleMeta[role].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <ul aria-busy="true" aria-label="Loading people" className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex animate-pulse items-center gap-3 px-4 py-4 sm:px-5">
              <span className="h-9 w-9 rounded-full bg-[var(--color-border)]" />
              <span className="flex-1 space-y-2">
                <span className="block h-3 w-40 max-w-full rounded bg-[var(--color-border)]" />
                <span className="block h-3 w-56 max-w-full rounded bg-[var(--color-border)]" />
              </span>
              <span className="hidden h-6 w-16 rounded-full bg-[var(--color-border)] sm:block" />
            </li>
          ))}
        </ul>
      ) : loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Couldn&apos;t load people
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loadError instanceof Error ? loadError.message : "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => {
              void membersQuery.refetch();
              if (canManagePeople) void invitationsQuery.refetch();
            }}
            className={iconButtonClass}
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-app-bg)] text-[var(--color-text-muted)]">
            <Search size={18} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {hasFilters ? "No one matches these filters" : "No people yet"}
          </p>
          <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
            {search.trim()
              ? `Nothing found for “${search.trim()}”.`
              : hasFilters
                ? "Try another status or role."
                : "Invite teammates to start collaborating."}
          </p>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className={`${iconButtonClass} mt-2`}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <table className="hidden w-full table-fixed border-collapse lg:table">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-app-bg)]">
              <tr>
                <th scope="col" className={`${thClass} w-[34%] pl-5 xl:w-[24%]`}>
                  Name
                </th>
                <th scope="col" className={`${thClass} hidden w-[24%] xl:table-cell`}>
                  Email
                </th>
                <th scope="col" className={`${thClass} w-[14%] xl:w-[11%]`}>
                  Access
                </th>
                <th scope="col" className={`${thClass} w-[17%] xl:w-[13%]`}>
                  Last update
                </th>
                <th scope="col" className={`${thClass} w-[14%] xl:w-[11%]`}>
                  Status
                </th>
                <th scope="col" className={`${thClass} w-[13%] xl:w-[10%]`}>
                  Role
                </th>
                <th scope="col" className={`${thClass} w-[8%] pr-5 text-right xl:w-[7%]`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {pageRows.map((person) => (
                <tr key={person.key} className="transition-colors hover:bg-[var(--color-card-hover)]">
                  <td className="py-3 pl-5 pr-4">{renderName(person, "xl:hidden")}</td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <p className="truncate text-sm text-[var(--color-text-secondary)]" title={person.email}>
                      {person.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">{renderAccess(person)}</td>
                  <td className="px-4 py-3">{renderDate(person)}</td>
                  <td className="px-4 py-3">{renderStatus(person)}</td>
                  <td className="px-4 py-3">{renderRole(person)}</td>
                  <td className="py-3 pl-4 pr-5 text-right">{renderActions(person)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phones and tablets */}
          <ul className="divide-y divide-[var(--color-border)] lg:hidden">
            {pageRows.map((person) => (
              <li key={person.key} className="px-4 py-3.5 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {renderName(person, "")}
                  </div>
                  <div className="shrink-0">{renderActions(person)}</div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 pl-12">
                  {renderStatus(person)}
                  {renderRole(person)}
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {person.status === "JOINED" ? "Joined" : "Invited"}{" "}
                    {formatDate(person.date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p aria-live="polite">
              <span className="font-medium text-[var(--color-text-primary)]">
                {firstIndex + 1}–{firstIndex + pageRows.length}
              </span>{" "}
              of {visible.length}
            </p>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                Rows
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    resetPaging();
                  }}
                  className="h-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className={`${iconButtonClass} h-8 w-8 px-0`}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  <span className="min-w-16 text-center text-xs">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className={`${iconButtonClass} h-8 w-8 px-0`}
                  >
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </nav>
              )}
            </div>
          </div>
        </>
      )}

      {/* Dialogs */}
      {canManagePeople && (
        <InviteMemberDialog
          workspaceId={workspaceId}
          isOpen={inviteOpen}
          onClose={() => setInviteOpen(false)}
        />
      )}

      <MemberBoardDialog
        workspaceId={workspaceId}
        member={boardDialog?.member ?? null}
        action={boardDialog?.action ?? "assign"}
        onClose={() => setBoardDialog(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        title="Remove from workspace?"
        description={
          <>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {memberToRemove?.name}
            </span>{" "}
            will lose access to this workspace and its boards.
          </>
        }
        confirmLabel="Remove member"
        pendingLabel="Removing..."
        isPending={removeMutation.isPending}
        error={removeMutation.error?.message}
        onConfirm={() => memberToRemove && removeMutation.mutate(memberToRemove)}
        onCancel={() => {
          if (!removeMutation.isPending) setMemberToRemove(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(inviteToRevoke)}
        title="Revoke invitation?"
        description={
          <>
            The invitation link sent to{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {inviteToRevoke?.email}
            </span>{" "}
            will stop working. You can invite them again later.
          </>
        }
        confirmLabel="Revoke invitation"
        pendingLabel="Revoking..."
        isPending={revokeMutation.isPending}
        error={revokeMutation.error?.message}
        onConfirm={() => inviteToRevoke && revokeMutation.mutate(inviteToRevoke)}
        onCancel={() => {
          if (!revokeMutation.isPending) setInviteToRevoke(null);
        }}
      />
    </section>
  );
}
