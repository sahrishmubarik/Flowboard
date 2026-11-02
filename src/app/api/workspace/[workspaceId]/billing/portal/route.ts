import { openBillingPortal } from "@/services/billing";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    return await openBillingPortal(workspaceId);
  } catch (error) {
    return handleRouteError(error, "BILLING_PORTAL_API_ERROR:");
  }
}
