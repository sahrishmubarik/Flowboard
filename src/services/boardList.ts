import { AppError } from "@/lib/errors/AppError";
import { getCurrentUser } from "@/lib/middleware/auth";
import { requireBoardRole } from "@/lib/middleware/boardPermission";
import { BoardListRepo } from "@/repositories/boardListRepo";
import { BoardRepo } from "@/repositories/boardRepo";

import { NextResponse } from "next/server";

export async function createBoardList(boardId: string, listName: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("User not found:", 403);
  }
  const user_id = user.userId;
  console.log("See the list name that pass to endpoint");
  console.log(listName);
  await requireBoardRole(user_id, boardId, ["owner", "admin"]);
  const createdBy = user_id;
  const NewList = await BoardListRepo.create(boardId, listName, createdBy);
  return NextResponse.json(
    {
      message: "Create Board  List successfully! ",
      list: NewList,
    },
    {
      status: 201,
    },
  );
}
export async function getBoardList(boardId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("User not found: ", 403);
  }
  const boardLists = await BoardListRepo.getListByBoardId(boardId);
  return NextResponse.json(
    {
      message: "Get  Board  List successfully! ",
      lists: boardLists,
    },
    {
      status: 201,
    },
  );
}

export async function getBoardListByListId(boardId: string, listId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("User not found: ", 403);
  }
  const List = await BoardListRepo.getListByListId(boardId, listId);
  return NextResponse.json(
    {
      message: "Get  Board  List successfully! ",
      list: List,
    },
    {
      status: 201,
    },
  );
}
export async function updateListName(
  boardId: string,
  listId: string,
  listName: string,
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 403);
  }

  const user_id = user.userId;

  await requireBoardRole(user_id, boardId, ["owner", "admin"]);

  const updateList = await BoardListRepo.updateListNameById(
    boardId,
    listId,
    listName,
  );
  if (!updateList) {
    throw new AppError("Board list not found", 404);
  }

  return NextResponse.json(
    {
      message: "Update  Board List successfully!",
      list: updateList,
    },
    {
      status: 201,
    },
  );
}
export async function deleteListById(boardId: string, listId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("User not found .", 403);
  }
  const board = await BoardRepo.getBoardById(boardId);
  if (!board) {
    throw new AppError("Board Not found.", 403);
  }
  const user_id = user.userId;
  await requireBoardRole(user_id, boardId, ["owner", "admin"]);
  const deleteList = await BoardListRepo.DeleteList(boardId, listId);
  return NextResponse.json(
    {
      message: " Delete Board List successfully!",
      list: deleteList,
    },
    {
      status: 201,
    },
  );
}

export async function reorderBoardLists(boardId: string, orderedIds: string[]) {
  // 1. Authenticate the user
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("User not found", 403);
  }

  const userId = user.userId;

  // 2. Check board permissions
  await requireBoardRole(userId, boardId, ["owner", "admin", "manager"]);

  // 3. Validate the request
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  if (
    orderedIds.some((id) => typeof id !== "string" || id.trim().length === 0)
  ) {
    throw new AppError("Every list ID must be a non-empty string", 400);
  }

  // Prevent the same list from appearing more than once
  if (new Set(orderedIds).size !== orderedIds.length) {
    throw new AppError("Duplicate list IDs are not allowed", 400);
  }

  // 4. Confirm that the submitted IDs match every list on this board
  const existingLists = await BoardListRepo.getListByBoardId(boardId);

  const existingIds = new Set(existingLists.map((list) => list.id));

  const allIdsBelongToBoard = orderedIds.every((id) => existingIds.has(id));

  const allListsIncluded = orderedIds.length === existingLists.length;

  if (!allIdsBelongToBoard || !allListsIncluded) {
    throw new AppError(
      "orderedIds must contain every list on this board exactly once",
      400,
    );
  }

  // 5. Persist the new order
  const boardLists = await BoardListRepo.reorderLists(boardId, orderedIds);

  // 6. Return the updated order
  return NextResponse.json(
    {
      message: "Board lists reordered successfully",
      lists: boardLists,
    },
    {
      status: 200,
    },
  );
}
