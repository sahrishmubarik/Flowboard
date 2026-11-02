import { startCheckout } from "@/services/billing";
import { handleRouteError } from "@/lib/errors/handleRouteError";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const { workspaceId } = await params;

    const body = await request.json();

    return await startCheckout(workspaceId, body);
  } catch (error) {
    return handleRouteError(error, "BILLING_CHECKOUT_API_ERROR:");
  }
}
