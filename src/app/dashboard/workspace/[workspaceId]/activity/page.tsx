import { notFound } from "next/navigation";

import WorkspaceActivity from "@/components/WorkspaceActivity";
import PageHeader, { pageContainerClass } from "@/components/ui/PageHeader";

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
    <main className="min-h-screen bg-[var(--color-app-bg)]">
      <div className={pageContainerClass}>
        <PageHeader
          workspaceId={workspaceId}
          title="Activity"
          description="Track changes and actions performed on your boards."
        />

        <WorkspaceActivity workspaceId={workspaceId} />
      </div>
    </main>
  );
}
