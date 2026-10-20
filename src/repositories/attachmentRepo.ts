// import { db } from "@/db";
// import { cardAttachment } from "@/db/cardSchema";
// import { eq, asc, and, isNull } from "drizzle-orm";

// export const CardAttachmentRepo = {
//   // 1. Save uploaded file metadata in PostgreSQL
//   async createAttachment(data: {
//     cardId: string;
//     commitId:string | null;
//     fileName: string;
//     fileUrl: string;
//     blobPathname: string;
//     contentType: string;
//     size: number;
//     uploadedBy: string;
//   }) {
//     const [attachment] = await db
//       .insert(cardAttachment)
//       .values({
//         cardId: data.cardId,
//         commitId:data.commitId | null,
//         fileName: data.fileName,
//         fileUrl: data.fileUrl,
//         blobPathname: data.blobPathname,
//         contentType: data.contentType,
//         size: data.size,
//         uploadedBy: data.uploadedBy,
//       })
//       .returning();

//     return attachment;
//   },

//   // 2. Get all attachments belonging to a card
//   async getAttachmentsByCardId(cardId: string) {
//     return await db
//       .select()
//       .from(cardAttachment)
//       .where(
//         and(eq(cardAttachment.cardId, cardId), isNull(cardAttachment.commitId)),
//       )
//       .orderBy(asc(cardAttachment.createdAt));
//   },

//   // 3. Find an attachment before deleting it
//   async getAttachmentById(cardId: string, attachmentId: string) {
//     const [attachment] = await db
//       .select()
//       .from(cardAttachment)
//       .where(
//         and(
//           eq(cardAttachment.id, attachmentId),
//           eq(cardAttachment.cardId, cardId),
//           isNull(cardAttachment.commitId),
//         ),
//       )
//       .limit(1);

//     return attachment ?? null;
//   },

//   // 4. Delete the database record
//   async deleteAttachment(cardId: string, attachmentId: string) {
//     const [deletedAttachment] = await db
//       .delete(cardAttachment)
//       .where(
//         and(
//           eq(cardAttachment.id, attachmentId),
//           eq(cardAttachment.cardId, cardId),
//         ),
//       )
//       .returning();

//     return deletedAttachment ?? null;
//   },
// };

import { db } from "@/db";
import { cardAttachment } from "@/db/cardSchema";
import { eq, asc, and, isNull } from "drizzle-orm";

export const CardAttachmentRepo = {
  // 1. Save card-level or commit-level attachment metadata
  async createAttachment(data: {
    cardId: string;
    commitId: string | null;
    fileName: string;
    fileUrl: string;
    blobPathname: string;
    contentType: string;
    size: number;
    uploadedBy: string;
  }) {
    const [attachment] = await db
      .insert(cardAttachment)
      .values({
        cardId: data.cardId,
        commitId: data.commitId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        blobPathname: data.blobPathname,
        contentType: data.contentType,
        size: data.size,
        uploadedBy: data.uploadedBy,
      })
      .returning();

    return attachment;
  },

  async getAttachmentsByCardId(cardId: string, commitId?: string | null) {
    return db
      .select()
      .from(cardAttachment)
      .where(
        and(
          eq(cardAttachment.cardId, cardId),
          commitId === undefined
            ? undefined
            : commitId === null
              ? isNull(cardAttachment.commitId)
              : eq(cardAttachment.commitId, commitId),
        ),
      )
      .orderBy(asc(cardAttachment.createdAt));
  },
  // 3. Find an attachment belonging to the card
  async getAttachmentById(cardId: string, attachmentId: string) {
    const [attachment] = await db
      .select()
      .from(cardAttachment)
      .where(
        and(
          eq(cardAttachment.id, attachmentId),
          eq(cardAttachment.cardId, cardId),
        ),
      )
      .limit(1);

    return attachment ?? null;
  },

  // 4. Delete an attachment belonging to the card
  async deleteAttachment(cardId: string, attachmentId: string) {
    const [deletedAttachment] = await db
      .delete(cardAttachment)
      .where(
        and(
          eq(cardAttachment.id, attachmentId),
          eq(cardAttachment.cardId, cardId),
        ),
      )
      .returning();

    return deletedAttachment ?? null;
  },
};
