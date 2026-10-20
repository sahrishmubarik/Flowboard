import { NextRequest, NextResponse } from "next/server";

import {
  uploadCardAttachment,
  getCardAttachments,
  removeCardAttachment,
} from "@/services/cardAttachmentService";

import { AppError } from "@/lib/errors/AppError";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
    boardId: string;
    cardId: string;
  }>;
};

// GET: Fetch all attachments for a card
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { workspaceId, boardId, cardId } = await params;

    const searchParams = request.nextUrl.searchParams;

    const scope = searchParams.get("scope");
    const commitId = searchParams.get("commitId");

    let filterCommitId: string | null | undefined;

    if (scope === "card") {
      filterCommitId = null;
    } else if (commitId) {
      filterCommitId = commitId;
    } else {
      filterCommitId = undefined;
    }

    const attachments = await getCardAttachments(
      workspaceId,
      boardId,
      cardId,
      filterCommitId,
    );

    return NextResponse.json(
      {
        message: "Attachments fetched successfully.",
        attachments,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("GET card attachments error:", error);

    return NextResponse.json(
      { message: "Failed to fetch attachments." },
      { status: 500 },
    );
  }
}
// POST: Upload an attachment
// export async function POST(request: NextRequest, { params }: RouteContext) {
//   try {
//     const { workspaceId, boardId, cardId } = await params;

//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!(file instanceof File)) {
//       return NextResponse.json(
//         { message: "Please provide a file." },
//         { status: 400 },
//       );
//     }

//     const attachment = await uploadCardAttachment(
//       workspaceId,
//       boardId,
//       cardId,
//       file,
//     );

//     return NextResponse.json(
//       {
//         message: "Attachment uploaded successfully.",
//         attachment,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     if (error instanceof AppError) {
//       return NextResponse.json(
//         { message: error.message },
//         { status: error.statusCode },
//       );
//     }

//     console.error("POST card attachment error:", error);

//     return NextResponse.json(
//       { message: "Failed to upload attachment." },
//       { status: 500 },
//     );
//   }
// }

// POST: Upload a ticket or commit attachment
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { workspaceId, boardId, cardId } = await params;

    const formData = await request.formData();
    const file = formData.get("file");
    const rawCommitId = formData.get("commitId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Please provide a file." },
        { status: 400 },
      );
    }

    const commitId =
      typeof rawCommitId === "string" && rawCommitId.trim()
        ? rawCommitId.trim()
        : null;

    const attachment = await uploadCardAttachment(
      workspaceId,
      boardId,
      cardId,
      file,
      commitId,
    );

    return NextResponse.json(
      {
        message: "Attachment uploaded successfully.",
        attachment,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("POST attachment error:", error);

    return NextResponse.json(
      { message: "Failed to upload attachment." },
      { status: 500 },
    );
  }
}
// DELETE: Remove an attachment
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { workspaceId, boardId, cardId } = await params;

    const attachmentId = request.nextUrl.searchParams.get("attachmentId");

    if (!attachmentId) {
      return NextResponse.json(
        { message: "attachmentId is required." },
        { status: 400 },
      );
    }

    const attachment = await removeCardAttachment(
      workspaceId,
      boardId,
      cardId,
      attachmentId,
    );

    return NextResponse.json(
      {
        message: "Attachment deleted successfully.",
        attachment,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("DELETE card attachment error:", error);

    return NextResponse.json(
      { message: "Failed to delete attachment." },
      { status: 500 },
    );
  }
}
