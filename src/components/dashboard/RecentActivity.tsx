const activities = [
  {
    id: 1,
    title: "Created a new board",
    description: "Product Launch",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Ali joined your organization",
    description: "Teach Flow",
    time: "Today",
  },
  {
    id: 3,
    title: "Invited Ahmed",
    description: "Teach Flow",
    time: "Yesterday",
  },
  {
    id: 4,
    title: "Created a new organization",
    description: "Marketing",
    time: "2 days ago",
  },
];

export default function DashboardRecentActivity() {
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-[var(--ink)]">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Recent changes across your organization spaces.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--mist)] bg-white">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={`flex items-center gap-4 px-5 py-4 ${
              index !== activities.length - 1
                ? "border-b border-[var(--mist)]"
                : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mist)] text-sm text-[var(--ink-soft)]">
              ✓
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--ink)]">
                {activity.title}
              </p>

              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                {activity.description}
              </p>
            </div>

            <span className="shrink-0 text-xs text-[var(--ink-soft)]">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}