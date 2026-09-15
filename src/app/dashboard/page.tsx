import Link from "next/link";

// Placeholder data — replace with real data fetched via Drizzle
// (Server Component, so this can later become an `await db.query...` call)
const inboxCount = 3;

const boards = [
  {
    id: "1",
    title: "Product launch",
    workspace: "Flowboard",
    color: "var(--indigo)",
  },
  {
    id: "2",
    title: "Marketing site",
    workspace: "Flowboard",
    color: "var(--amber)",
  },
  {
    id: "3",
    title: "Personal goals",
    workspace: "Personal",
    color: "var(--sage)",
  },
  {
    id: "4",
    title: "Bug tracker",
    workspace: "Flowboard",
    color: "var(--coral)",
  },
  {
    id: "5",
    title: "Content calendar",
    workspace: "Marketing",
    color: "var(--sky)",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-[1160px] px-6 py-12 md:px-10">
        {/* Greeting */}
        <div>
          <h1
            className="text-[28px] font-medium tracking-tight md:text-[34px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] text-[var(--ink-soft)]">
            Here&apos;s what&apos;s on your boards and in your inbox.
          </p>
        </div>

        {/* Inbox summary card */}
        <Link
          href="/dashboard/inbox"
          className="mt-8 flex items-center justify-between rounded-2xl border border-dashed border-[var(--amber)] bg-[var(--amber)]/[0.06] px-6 py-5 transition-colors hover:bg-[var(--amber)]/[0.1]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--amber)]/20 text-[var(--amber-deep)]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-medium text-[var(--ink)]">
                Personal inbox
              </p>
              <p className="text-sm text-[var(--ink-soft)]">
                {inboxCount} idea{inboxCount === 1 ? "" : "s"} waiting to be
                sorted onto a board
              </p>
            </div>
          </div>
          <span className="text-sm font-medium text-[var(--amber-deep)]">
            Open inbox →
          </span>
        </Link>

        {/* Boards header */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[var(--ink)]">
            Your boards
          </h2>
          <Link
            href="/dashboard/boards/new"
            className="rounded-[7px] bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
          >
            New board
          </Link>
        </div>

        {/* Boards grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/dashboard/workspaces/${board.workspace}/boards/${board.id}`}
              className="group overflow-hidden rounded-xl border border-[var(--mist)] bg-[var(--paper-raised)] transition-shadow hover:shadow-lg"
            >
              <div
                className="h-20 w-full transition-transform duration-300 group-hover:scale-[1.03]"
                style={{ backgroundColor: board.color }}
              />
              <div className="px-4 py-3.5">
                <p className="text-[15px] font-medium text-[var(--ink)]">
                  {board.title}
                </p>
                <p className="mt-0.5 text-[13px] text-[var(--ink-soft)]">
                  {board.workspace}
                </p>
              </div>
            </Link>
          ))}

          {/* Create board card */}
          <Link
            href="/dashboard/boards/new"
            className="flex min-h-[128px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--mist)] text-[var(--ink-soft)] transition-colors hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm font-medium">Create new board</span>
          </Link>
        </div>
      </div>
    </div>
  );
}