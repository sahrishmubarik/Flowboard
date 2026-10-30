import { notFound } from "next/navigation";

import WorkspaceBilling from "@/components/billing/WorkspaceBilling";
import PageHeader, { pageContainerClass } from "@/components/ui/PageHeader";

type BillingPageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    checkout?: string;
  }>;
};

export default async function BillingPage({
  params,
  searchParams,
}: BillingPageProps) {
  const { workspaceId } = await params;
  const { checkout } = await searchParams;

  if (!workspaceId) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-app-bg)]">
      <div className={pageContainerClass}>
        <PageHeader
          workspaceId={workspaceId}
          title="Billing"
          description="Choose a plan for this workspace and see its payment history."
        />

        <WorkspaceBilling
          workspaceId={workspaceId}
          checkoutResult={
            checkout === "success" || checkout === "cancelled"
              ? checkout
              : null
          }
        />
      </div>
    </main>
  );
}
