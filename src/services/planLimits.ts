import type { DbTransaction } from "@/db/types";
import {
  getEffectivePlan,
  PLAN_DETAILS,
  PLAN_LIMITS,
  type PlanKey,
} from "@/lib/billing/plans";
import { AppError } from "@/lib/errors/AppError";
import { planUsageRepo } from "@/repositories/planUsageRepo";
import { subscriptionRepo } from "@/repositories/subscriptionRepo";

// 402 Payment Required: the action is allowed on a higher plan.
const LIMIT_STATUS = 402;

// The plan a workspace has right now, including the 7-day grace period.
export async function getWorkspacePlan(workspaceId: string): Promise<PlanKey> {
  const subscription = await subscriptionRepo.findByWorkspace(workspaceId);

  return getEffectivePlan(subscription);
}

// The next plan up and what it allows, for the limit message.
function upgradeHint(plan: PlanKey, key: "boards" | "members") {
  const next = plan === "FREE" ? "PRO" : "BUSINESS";
  const limit = PLAN_LIMITS[next][key];

  return `Upgrade to ${PLAN_DETAILS[next].name} for ${
    limit === null ? `unlimited ${key}` : `up to ${limit} ${key}`
  }.`;
}

// Call inside the transaction that creates the board. Existing boards are
// never touched; only creating one more is refused.
export async function assertCanCreateBoard(
  tx: DbTransaction,
  workspaceId: string,
) {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].boards;

  if (limit === null) return;

  await planUsageRepo.lockBoards(tx, workspaceId);

  const boards = await planUsageRepo.countBoards(workspaceId, tx);

  if (boards >= limit) {
    throw new AppError(
      `The ${PLAN_DETAILS[plan].name} plan allows up to ${limit} boards. ${upgradeHint(plan, "boards")}`,
      LIMIT_STATUS,
    );
  }
}

// Call inside the transaction that creates an invitation. Pending
// invitations count as members, otherwise a Free workspace could invite
// 50 people at once.
export async function assertCanInviteMember(
  tx: DbTransaction,
  workspaceId: string,
) {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].members;

  if (limit === null) return;

  await planUsageRepo.lockMembers(tx, workspaceId);

  const [members, pending] = await Promise.all([
    planUsageRepo.countActiveMembers(workspaceId, tx),
    planUsageRepo.countPendingInvitations(workspaceId, tx),
  ]);

  if (members + pending >= limit) {
    throw new AppError(
      `The ${PLAN_DETAILS[plan].name} plan allows up to ${limit} members, including pending invitations. ${upgradeHint(plan, "members")}`,
      LIMIT_STATUS,
    );
  }
}

// Call inside the transaction that adds the member. The invitation was
// already counted when it was sent, so only active members are checked
// here; this still stops joins after a downgrade.
export async function assertCanAcceptInvitation(
  tx: DbTransaction,
  workspaceId: string,
) {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = PLAN_LIMITS[plan].members;

  if (limit === null) return;

  await planUsageRepo.lockMembers(tx, workspaceId);

  const members = await planUsageRepo.countActiveMembers(workspaceId, tx);

  if (members >= limit) {
    throw new AppError(
      "This workspace has reached the member limit of its plan. Ask the workspace owner to upgrade.",
      LIMIT_STATUS,
    );
  }
}

// Current usage against the plan, for the billing page.
export async function getWorkspaceUsage(workspaceId: string, plan: PlanKey) {
  const [boards, members, pendingInvitations] = await Promise.all([
    planUsageRepo.countBoards(workspaceId),
    planUsageRepo.countActiveMembers(workspaceId),
    planUsageRepo.countPendingInvitations(workspaceId),
  ]);

  return {
    boards: { used: boards, limit: PLAN_LIMITS[plan].boards },
    members: {
      used: members + pendingInvitations,
      limit: PLAN_LIMITS[plan].members,
      pendingInvitations,
    },
  };
}
