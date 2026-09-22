import Link from "next/link";

import DashboardOrganizations from "@/components/dashboard/DashboardOrganization";
import DashboardOverviewStats from "@/components/dashboard/OverviewStats";


const inboxCount: number = 3;

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--paper-raised)]">
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
            Here&apos;s what&apos;s on your organization spaces and in your
            inbox.
          </p>
        </div>

        {/* Inbox summary */}
        <Link
          href="/dashboard/workspace/inbox"
          className="mt-8 flex items-center justify-between rounded-2xl border border-dashed border-[var(--amber)] bg-[#f9f5ef] px-6 py-5 transition-all duration-300 hover:border-[var(--amber)] hover:bg-[#BFC9D1]/[0.1] hover:shadow-md"
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

    {/* Overview Stats */}
        <DashboardOverviewStats />

        <DashboardOrganizations />


        {/* Recent Activity
        <DashboardRecentActivity />

        Getting Started
        <DashboardGettingStarted /> */}
      </div>
    </div>
  );
}