import { notFound } from "next/navigation";

import WorkspaceActivity from "@/components/WorkspaceActivity";

type ActivityPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { workspaceId } = await params;

  if (!workspaceId) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-app-bg)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <WorkspaceActivity workspaceId={workspaceId} />
      </div>
    </main>
  );
}
