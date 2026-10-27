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
import { userRepo } from "@/repositories/userRepo";
import { generateToken } from "@/lib/token/generateToken";
import { hashToken } from "@/lib/token/hashToken";
import { db } from "@/db";
import { AuditLogService } from "@/services/auditLogService";
export async function inviteMember(
  workspaceId: string,
  body: {
    email: string;
    role: string;
  },
) {
  const user = await getCurrentUser();
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

  // const invitation = await invitationRepo.create({
  //   workspaceId,
  //   email,
  //   role,
  //   token: tokenHash,
  //   expiresAt,
  //   createdBy: user_id,
  // });
  const invitation = await db.transaction(async (tx) => {
    const createdInvitation = await invitationRepo.create(
      {
        workspaceId,
        email,
        role,
        token: tokenHash,
        expiresAt,
        createdBy: user_id,
      },
      tx,
    );

    await AuditLogService.record(
      {
        performedBy: user_id,
        workspaceId,
        entityType: "workspace_invitation",
        entityId: createdInvitation.id,
        action: "WORKSPACE_INVITATION_CREATED",
        details: {
          email: createdInvitation.email,
          role: createdInvitation.role,
          status: createdInvitation.status,
          expiresAt: createdInvitation.expiresAt.toISOString(),
        },
      },
      tx,
    );

    return createdInvitation;
  });

  const assignRole = invitation.role;

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
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }
  const user_id = user.userId;

  const validation = validateData(acceptInvitationValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { token } = validation.data;

  const tokenHash = hashToken(token);

  const invitation = await invitationRepo.findByToken(tokenHash);

  if (!invitation) {
    throw new AppError("Invalid or expired invitation.", 404);
  }

  if (invitation.workspaceId !== workspaceId) {
    throw new AppError("Invalid invitation for this workspace.", 400);
  }

  if (invitation.status === "REVOKED") {
    throw new AppError(
      "This invitation has been cancelled by the workspace administrator.",
      400,
    );
  }

  if (invitation.status === "ACCEPTED") {
    throw new AppError("This invitation has already been accepted.", 400);
  }

  if (invitation.status !== "PENDING") {
    throw new AppError("This invitation is no longer available.", 400);
  }
  if (new Date() > invitation.expiresAt) {
    throw new AppError("This invitation has expired.", 400);
  }

  const account = await userRepo.getInvitationAccount(user_id);
  if (!account) {
    throw new AppError("Authenticated user was not found.", 401);
  }

  if (!account.emailVerified) {
    throw new AppError(
      "Please verify your email before accepting invitations.",
      403,
    );
  }

  if (
    account.email.trim().toLowerCase() !==
    invitation.email.trim().toLowerCase()
  ) {
    throw new AppError(
      "Sign in with the email address that received this invitation.",
      403,
    );
  }

  const existingMember = await organizationMemberRepo.findByUserAndWorkspace(
    user_id,
    workspaceId,
  );

  if (existingMember) {
    throw new AppError("You are already a member of this workspace.", 409);
  }

  return db.transaction(async (tx) => {
    await organizationMemberRepo.create(tx, {
      userId: user_id,
      organizationId: workspaceId,
      role: invitation.role,
      assignedBy: invitation.createdBy,
    });

    const acceptedInvitation = await invitationRepo.updateStatus(
      tx,
      invitation.id,
    );

    if (!acceptedInvitation) {
      throw new AppError(
        "This invitation is no longer pending or has expired.",
        409,
      );
    }

    await AuditLogService.record(
      {
        performedBy: user_id,
        workspaceId,
        entityType: "workspace_invitation",
        entityId: acceptedInvitation.id,
        action: "WORKSPACE_INVITATION_ACCEPTED",
        details: {
          email: acceptedInvitation.email,
          role: acceptedInvitation.role,
          memberUserId: user_id,
          previousStatus: "PENDING",
          newStatus: acceptedInvitation.status,
        },
      },
      tx,
    );

    return {
      message: "Invitation accepted successfully.",
      workspaceId,
    };
  });
}

// Read-only details for the accept page: who the invitation is for and who is
// signed in, so the page can explain what will happen before the user clicks.
export async function getInvitationPreview(workspaceId: string, body: unknown) {
  const validation = validateData(acceptInvitationValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const invitation = await invitationRepo.findByToken(
    hashToken(validation.data.token),
  );

  if (!invitation || invitation.workspaceId !== workspaceId) {
    throw new AppError("Invalid or expired invitation.", 404);
  }

  const workspaceData = await workspaceRepo.findById(workspaceId);

  const user = await getCurrentUser();
  const account = user
    ? await userRepo.getInvitationAccount(user.userId)
    : null;

  const isExpired = new Date() > invitation.expiresAt;
  const emailMatches =
    !!account &&
    account.email.trim().toLowerCase() ===
      invitation.email.trim().toLowerCase();

  return {
    invitation: {
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      isExpired,
      workspaceName: workspaceData?.workspaceName ?? null,
    },
    signedInAs: account
      ? { email: account.email, emailVerified: !!account.emailVerified }
      : null,
    emailMatches,
    canAccept:
      invitation.status === "PENDING" &&
      !isExpired &&
      emailMatches &&
      !!account?.emailVerified,
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

  const validation = validateData(revokeInvitationValidation, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const workspaceData = await workspaceRepo.findById(workspaceId);

  if (!workspaceData) {
    throw new AppError("Workspace not found.", 404);
  }

  await requireWorkspaceRole(user_id, workspaceId, ["owner", "admin"]);

  const { email } = validation.data;

  // const cancelInvitation = await invitationRepo.revokeInvitation(
  //   workspaceId,
  //   email,
  // );
  const cancelInvitation = await db.transaction(async (tx) => {
    const revokedInvitation = await invitationRepo.revokeInvitation(
      workspaceId,
      email,
      tx,
    );

    if (!revokedInvitation) {
      throw new AppError("Pending invitation not found.", 404);
    }

    await AuditLogService.record(
      {
        performedBy: user_id,
        workspaceId,
        entityType: "workspace_invitation",
        entityId: revokedInvitation.id,
        action: "WORKSPACE_INVITATION_REVOKED",
        details: {
          email: revokedInvitation.email,
          role: revokedInvitation.role,
          previousStatus: "PENDING",
          newStatus: revokedInvitation.status,
        },
      },
      tx,
    );

    return revokedInvitation;
  });

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

// export async function getInvitationStatus(
//   workspaceId: string,
//   page: number,
//   limit: number,
// ) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user.", 401);
//   }

//   const user_id = user.userId;

//   const workspaceData = await workspaceRepo.findById(workspaceId);

//   if (!workspaceData) {
//     throw new AppError("Workspace not found.", 404);
//   }

//   await requireWorkspaceRole(user_id, workspaceId, ["owner", "admin"]);

//   const result = await invitationRepo.getInvitationByWorkspaceId(
//     workspaceId,
//     page,
//     limit,
//   );
//   console.log("INVITATION RESULT:", result);
//   return Response.json(
//     {
//       message: "Invitation status fetched successfully",
//       invitations: result.invitations,

//       pagination: {
//         page,
//         limit,
//         total: result.total,
//         totalPages: Math.ceil(result.total / limit),
//       },
//     },
//     {
//       status: 200,
//     },
//   );
// }

export async function getInvitationStatus(
  workspaceId: string,
  page: number,
  limit: number,
  status?: "PENDING" | "ACCEPTED" | "REVOKED",
) {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Unauthorized user.", 401);

  const workspaceData = await workspaceRepo.findById(workspaceId);
  if (!workspaceData) throw new AppError("Workspace not found.", 404);

  await requireWorkspaceRole(user.userId, workspaceId, ["owner", "admin"]);

  const result = await invitationRepo.getInvitationByWorkspaceId(
    workspaceId,
    page,
    limit,
    status,
  );

  return Response.json(
    {
      message: "Invitation status fetched successfully",
      invitations: result.invitations,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    },
    { status: 200 },
  );
}
