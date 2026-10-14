import { db } from "@/db";
import { cardAttachment } from "@/db/cardSchema";
import { eq, asc, and } from "drizzle-orm";

export const CardAttachmentRepo = {
  // 1. Save uploaded file metadata in PostgreSQL
  async createAttachment(data: {
    cardId: string;
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

  // 2. Get all attachments belonging to a card
  async getAttachmentsByCardId(cardId: string) {
    return await db
      .select()
      .from(cardAttachment)
      .where(eq(cardAttachment.cardId, cardId))
      .orderBy(asc(cardAttachment.createdAt));
  },

  // 3. Find an attachment before deleting it
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

  // 4. Delete the database record
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
