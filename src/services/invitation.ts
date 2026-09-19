import { getCurrentUser } from "@/lib/middleware/auth";
import { AppError } from "@/lib/errors/AppError";
import { requireWorkspaceRole } from "@/lib/middleware/workspacePermission";
import {
  validateData,
  inviteValidation,
  acceptInvitationValidation,
  revokeInvitationValidation,
} from "@/lib/validations/workspace";
import { sendInvitationEmail } from "@/lib/email/verificationEmail";
import { organizationMemberRepo } from "@/repositories/organizationMemberRepo";
import { workspaceRepo } from "@/repositories/organizationRepo";
import { invitationRepo } from "@/repositories/invitationRepo";
import { generateToken } from "@/lib/token/generateToken";
import { hashToken } from "@/lib/token/hashToken";



export async function inviteMember(
  workspaceId: string,
  body: {
    email: string;
    role: string;
  },
) {
  const user = await getCurrentUser();
  console.log(body.role);
  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }
  const user_id = user.userId;
  const validation = validateData(inviteValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const workspaceData = await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }
  const organizationName = workspaceData.workspaceName;
  const { email, role } = validation.data;
  await requireWorkspaceRole(user.userId, workspaceId, ["owner", "admin"]);
  const existingInvitation =
    await invitationRepo.findPendingByEmailAndWorkspace(email, workspaceId);

  if (existingInvitation) {
    throw new AppError("An invitation is already pending for this email.", 409);
  }

  const token = generateToken();
  const tokenHash = hashToken(token);

  // 12 hours expiration
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

  const invitation = await invitationRepo.create({
    workspaceId,
    email,
    role,
    token: tokenHash,
    expiresAt,
    createdBy: user_id,
  });
  const assignRole=invitation.role;
  console.log(invitation);
  // 9. Verification URL

  const invitationUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}` +
    `/dashboard/workspace/${workspaceId}/invitation/accept` +
    `?token=${token}`;

  await sendInvitationEmail({
    email,
    assignRole,
    organizationName,
    invitationUrl,
  });

  return Response.json(
    {
      message: "Invitation send successfully",
      invitationId: invitation.id,
    },
    {
      status: 200,
    },
  );
}

export async function acceptInvitation(workspaceId: string, body: unknown) {
  // TEMPORARY TEST USER
  // 1. Get currently logged-in user
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }
  const user_id = user.userId;

  // 2. Validate request body

  const validation = validateData(acceptInvitationValidation, body);

  console.log("5. Validation:", validation);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { token } = validation.data;

  // 3. Hash token

  const tokenHash = hashToken(token);

  // 4. Find invitation

  const invitation = await invitationRepo.findByToken(tokenHash);

  if (!invitation) {
    throw new AppError("Invalid or expired invitation.", 404);
  }

  // 5. Workspace check

  if (invitation.workspaceId !== workspaceId) {
    throw new AppError("Invalid invitation for this workspace.", 400);
  }

  // 6. Status

// 6. Status

if (invitation.status === "REVOKED") {
  throw new AppError(
    "This invitation has been cancelled by the workspace administrator.",
    400,
  );
}

if (invitation.status === "ACCEPTED") {
  throw new AppError(
    "This invitation has already been accepted.",
    400,
  );
}

if (invitation.status !== "PENDING") {
  throw new AppError(
    "This invitation is no longer available.",
    400,
  );
}
  // 7. Expiry

  if (new Date() > invitation.expiresAt) {
    throw new AppError("This invitation has expired.", 400);
  }

  // 8. Existing member
  console.log("16. Checking existing membership...");

  const existingMember = await organizationMemberRepo.findByUserAndWorkspace(
    user_id,
    workspaceId,
  );

  if (existingMember) {
    throw new AppError("You are already a member of this workspace.", 409);
  }

  // 9. Transaction

  const result = await db.transaction(async (tx) => {
    console.log("19. Transaction started");

    const member = await organizationMemberRepo.create(tx, {
      userId: user_id,
      organizationId: workspaceId,
      role: invitation.role,
      assignedBy: invitation.createdBy,
    });

    const updatedInvitation = await invitationRepo.updateStatus(
      tx,
      invitation.id,
    );

    return {
      member,
      updatedInvitation,
    };
  });

  return {
    message: "Invitation accepted successfully.",
    workspaceId,
  };
}

export async function revokeInvitation(
  workspaceId: string,
  body: {
    status: string;
    email: string;
  },
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const user_id = user.userId;

 const validation = validateData(
  revokeInvitationValidation,
  body,
);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const workspaceData = await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }

  await requireWorkspaceRole(
    user_id,
    workspaceId,
    ["owner", "admin"],
  );

  const { email } = validation.data;

  const cancelInvitation =
    await invitationRepo.revokeInvitation(
      workspaceId,
      email,
    );
  if (!cancelInvitation) {
  throw new AppError("Invitation not found.", 404);
}
  return Response.json(
    {
      message: "Invitation revoked successfully",
      invitation: cancelInvitation,
    },
    {
      status: 200,
    },
  );
}
export async function getInvitationStatus(
  workspaceId: string,
   page: number,
  limit: number,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const user_id = user.userId;

  const workspaceData =
    await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }

  await requireWorkspaceRole(
    user_id,
    workspaceId,
    ["owner", "admin"],
  );

  const invitations =
    await invitationRepo.getInvitationByWorkspaceId(workspaceId, page , limit);

  return Response.json(
    {
      message: "Invitation status fetched successfully",
      invitations,
    },
    {
      status: 200,
    },
  );
}