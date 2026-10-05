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
