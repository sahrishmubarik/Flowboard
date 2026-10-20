// import { put, del } from "@vercel/blob";

// import { getCurrentUser } from "@/lib/middleware/auth";
// import { AppError } from "@/lib/errors/AppError";
// import { CommitRepo } from "@/repositories/cardCommitRepo";
// import { BoardRepo } from "@/repositories/boardRepo";
// import { CardRepo } from "@/repositories/cardRepo";
// import { CardAttachmentRepo } from "@/repositories/attachmentRepo";

// // Maximum file size: 4 MB for this initial server-upload approach.
// const MAX_FILE_SIZE = 4 * 1024 * 1024;

// const ALLOWED_FILE_TYPES = new Set([
//   "image/jpeg",
//   "image/png",
//   "image/webp",
//   "application/pdf",
//   "text/plain",
//   "application/zip",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
// ]);

// function validateFile(file: File) {
//   if (!file || file.size === 0) {
//     throw new AppError("Please select a file.", 400);
//   }

//   if (file.size > MAX_FILE_SIZE) {
//     throw new AppError("File size must not exceed 4 MB.", 400);
//   }

//   if (!ALLOWED_FILE_TYPES.has(file.type)) {
//     throw new AppError("This file type is not allowed.", 400);
//   }
// }

// // Verify that the board and card belong to the requested workspace/board.
// async function validateCard(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   commitId: string | null = null,
// ) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user.", 401);
//   }

//   const board = await BoardRepo.getBoardById(boardId);
//   const boardData = Array.isArray(board) ? board[0] : board;

//   if (!boardData || boardData.organizationId !== workspaceId) {
//     throw new AppError("Board not found.", 404);
//   }

//   const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

//   if (!cardDetails?.length) {
//     throw new AppError("Card not found.", 404);
//   }
//   if (commitId != null) {
//     const commitDetails = await CommitRepo.getCardCommitDetail(
//       cardId,
//       commitId,
//     );
//     if (!commitDetails?.length) throw new AppError("Card not found.", 404);
//   }

//   return user;
// }

// // Upload a file to Blob, then save its metadata in PostgreSQL.
// export async function uploadCardAttachment(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   file: File,
//   commitId: string | null = null,
// ) {
//   const user = await validateCard(workspaceId, boardId, cardId, commitId);

//   validateFile(file);

//   const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);

//   const pathname =
//     `workspaces/${workspaceId}/board/${boardId}` +
//     `/card/${cardId}/${crypto.randomUUID()}-${safeName}`;

//   console.log("[Attachment] Starting Blob upload");

//   const blob = await put(pathname, file, {
//     access: "public",
//     addRandomSuffix: false,
//     contentType: file.type,
//   });

//   console.log("[Attachment] Blob upload succeeded");

//   try {
//     console.log("[Attachment] Saving metadata to database");

//     const attachment = await CardAttachmentRepo.createAttachment({
//       cardId,
//       commitId,
//       fileName: file.name,
//       fileUrl: blob.url,
//       blobPathname: blob.pathname,
//       contentType: file.type,
//       size: file.size,
//       uploadedBy: user.userId,
//     });

//     console.log("[Attachment] Database insert succeeded");

//     return attachment;
//   } catch (error) {
//     console.error("[Attachment] Database insert failed:", error);

//     try {
//       await del(blob.pathname);
//     } catch (cleanupError) {
//       console.error("[Attachment] Blob cleanup failed:", cleanupError);
//     }

//     throw error;
//   }
// }

// // Fetch the attachments belonging to a card.
// export async function getCardAttachments(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
// ) {
//   await validateCard(workspaceId, boardId, cardId);

//   return await CardAttachmentRepo.getAttachmentsByCardId(cardId);
// }

// // Delete a Blob and its corresponding database record.
// export async function removeCardAttachment(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   attachmentId: string,
// ) {
//   await validateCard(workspaceId, boardId, cardId);

//   const attachment = await CardAttachmentRepo.getAttachmentById(
//     cardId,
//     attachmentId,
//   );

//   if (!attachment) {
//     throw new AppError("Attachment not found.", 404);
//   }

//   // Remove the actual file from Vercel Blob first.
//   await del(attachment.blobPathname);

//   // Then remove its metadata from PostgreSQL.
//   const deleted = await CardAttachmentRepo.deleteAttachment(
//     cardId,
//     attachmentId,
//   );

//   if (!deleted) {
//     throw new AppError(
//       "The file was removed, but its database record could not be deleted.",
//       500,
//     );
//   }

//   return deleted;
// }

// function validateFile(file: File) {
//   if (!file || file.size === 0) {
//     throw new AppError("Please select a file.", 400);
//   }

//   if (file.size > MAX_FILE_SIZE) {
//     throw new AppError("File size must not exceed 4 MB.", 400);
//   }

//   if (!ALLOWED_FILE_TYPES.has(file.type)) {
//     throw new AppError("This file type is not allowed.", 400);
//   }
// }

// // Verify that the board and card belong to the requested workspace/board.
// async function validateCard(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   commitId: string | null = null,
// ) {
//   const user = await getCurrentUser();

//   if (!user) {
//     throw new AppError("Unauthorized user.", 401);
//   }

//   const board = await BoardRepo.getBoardById(boardId);
//   const boardData = Array.isArray(board) ? board[0] : board;

//   if (!boardData || boardData.organizationId !== workspaceId) {
//     throw new AppError("Board not found.", 404);
//   }

//   const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

//   if (!cardDetails?.length) {
//     throw new AppError("Card not found.", 404);
//   }
//   if (commitId != null) {
//     const commitDetails = await CommitRepo.getCardCommitDetail(
//       cardId,
//       commitId,
//     );
//     if (!commitDetails?.length) throw new AppError("Card not found.", 404);
//   }

//   return user;
// }

// // Upload a file to Blob, then save its metadata in PostgreSQL.
// export async function uploadCardAttachment(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   file: File,
//   commitId: string | null = null,
// ) {
//   const user = await validateCard(workspaceId, boardId, cardId, commitId);

//   validateFile(file);

//   const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);

//   const pathname =
//     `workspaces/${workspaceId}/board/${boardId}` +
//     `/card/${cardId}/${crypto.randomUUID()}-${safeName}`;

//   console.log("[Attachment] Starting Blob upload");

//   const blob = await put(pathname, file, {
//     access: "public",
//     addRandomSuffix: false,
//     contentType: file.type,
//   });

//   console.log("[Attachment] Blob upload succeeded");

//   try {
//     console.log("[Attachment] Saving metadata to database");

//     const attachment = await CardAttachmentRepo.createAttachment({
//       cardId,
//       commitId,
//       fileName: file.name,
//       fileUrl: blob.url,
//       blobPathname: blob.pathname,
//       contentType: file.type,
//       size: file.size,
//       uploadedBy: user.userId,
//     });

//     console.log("[Attachment] Database insert succeeded");

//     return attachment;
//   } catch (error) {
//     console.error("[Attachment] Database insert failed:", error);

//     try {
//       await del(blob.pathname);
//     } catch (cleanupError) {
//       console.error("[Attachment] Blob cleanup failed:", cleanupError);
//     }

//     throw error;
//   }
// }

// // Fetch the attachments belonging to a card.
// export async function getCardAttachments(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
// ) {
//   await validateCard(workspaceId, boardId, cardId);

//   return await CardAttachmentRepo.getAttachmentsByCardId(cardId);
// }

// // Delete a Blob and its corresponding database record.
// export async function removeCardAttachment(
//   workspaceId: string,
//   boardId: string,
//   cardId: string,
//   attachmentId: string,
// ) {
//   await validateCard(workspaceId, boardId, cardId);

//   const attachment = await CardAttachmentRepo.getAttachmentById(
//     cardId,
//     attachmentId,
//   );

//   if (!attachment) {
//     throw new AppError("Attachment not found.", 404);
//   }

//   // Remove the actual file from Vercel Blob first.
//   await del(attachment.blobPathname);

//   // Then remove its metadata from PostgreSQL.
//   const deleted = await CardAttachmentRepo.deleteAttachment(
//     cardId,
//     attachmentId,
//   );

//   if (!deleted) {
//     throw new AppError(
//       "The file was removed, but its database record could not be deleted.",
//       500,
//     );
//   }

//   return deleted;
// }

import { put, del } from "@vercel/blob";

import { getCurrentUser } from "@/lib/middleware/auth";
import { AppError } from "@/lib/errors/AppError";
import { CommitRepo } from "@/repositories/cardCommitRepo";
import { BoardRepo } from "@/repositories/boardRepo";
import { CardRepo } from "@/repositories/cardRepo";
import { CardAttachmentRepo } from "@/repositories/attachmentRepo";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function validateFile(file: File) {
  if (!file || file.size === 0) {
    throw new AppError("Please select a file.", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError("File size must not exceed 4 MB.", 400);
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    throw new AppError("This file type is not allowed.", 400);
  }
}

// Validate the card and, when provided, its commit.
async function validateCard(
  workspaceId: string,
  boardId: string,
  cardId: string,
  commitId: string | null = null,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("Unauthorized user.", 401);
  }

  const board = await BoardRepo.getBoardById(boardId);
  const boardData = Array.isArray(board) ? board[0] : board;

  if (!boardData || boardData.organizationId !== workspaceId) {
    throw new AppError("Board not found.", 404);
  }

  const cardDetails = await CardRepo.getBoardCardDetail(boardId, cardId);

  if (!cardDetails?.length) {
    throw new AppError("Card not found.", 404);
  }

  if (commitId !== null) {
    const commitDetails = await CommitRepo.getCardCommitDetail(
      cardId,
      commitId,
    );

    if (!commitDetails?.length) {
      throw new AppError("Commit not found for this card.", 404);
    }
  }

  return user;
}

// Upload a ticket-level or commit-level attachment.
export async function uploadCardAttachment(
  workspaceId: string,
  boardId: string,
  cardId: string,
  file: File,
  commitId: string | null = null,
) {
  const user = await validateCard(workspaceId, boardId, cardId, commitId);

  validateFile(file);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180);

  const pathname =
    `workspaces/${workspaceId}/board/${boardId}` +
    `/card/${cardId}/${crypto.randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  try {
    return await CardAttachmentRepo.createAttachment({
      cardId,
      commitId,
      fileName: file.name,
      fileUrl: blob.url,
      blobPathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      uploadedBy: user.userId,
    });
  } catch (error) {
    console.error("Attachment database insert failed:", error);

    try {
      await del(blob.pathname);
    } catch (cleanupError) {
      console.error("Attachment Blob cleanup failed:", cleanupError);
    }

    throw error;
  }
}

// Fetch card-level attachments or attachments of one specific commit.
// Omitted commitId means card-level attachments only.

export async function getCardAttachments(
  workspaceId: string,
  boardId: string,
  cardId: string,
  commitId?: string | null,
) {
  // Check card access and permissions.
  await validateCard(workspaceId, boardId, cardId);

  return CardAttachmentRepo.getAttachmentsByCardId(cardId, commitId);
}

// Delete an attachment after verifying its card ownership.
export async function removeCardAttachment(
  workspaceId: string,
  boardId: string,
  cardId: string,
  attachmentId: string,
) {
  await validateCard(workspaceId, boardId, cardId);

  const attachment = await CardAttachmentRepo.getAttachmentById(
    cardId,
    attachmentId,
  );

  if (!attachment) {
    throw new AppError("Attachment not found.", 404);
  }

  await del(attachment.blobPathname);

  const deleted = await CardAttachmentRepo.deleteAttachment(
    cardId,
    attachmentId,
  );

  if (!deleted) {
    throw new AppError(
      "The file was removed, but its database record could not be deleted.",
      500,
    );
  }

  return deleted;
}
