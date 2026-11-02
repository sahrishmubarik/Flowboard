import { getBillingOverview } from "@/services/billing";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    return await getBillingOverview(workspaceId);
  } catch (error) {
    return handleRouteError(error, "BILLING_OVERVIEW_API_ERROR:");
  }
}
