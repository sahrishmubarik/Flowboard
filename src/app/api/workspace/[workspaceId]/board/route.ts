import { AppError } from "@/lib/errors/AppError";
import { NextResponse } from "next/server";
import { createBoard, getBoardByWorkspaceId } from "@/services/board";
type BoardName={
boardName:string;
};
export async function POST(request:Request,
  {params}:{params: Promise<{workspaceId:string}>}
){
 try{
  const { workspaceId }=await params;
  const body: BoardName=await request.json();
  const {boardName}=body;
    return await  createBoard(workspaceId, boardName);
 }
 catch (error) {
     console.error("BOARD_API_ERROR:", error);
 
     if (error instanceof AppError) {
       return NextResponse.json(
         {
           message: error.message,
         },
         { status: error.statusCode },
       );
     }
 
     return NextResponse.json(
       {
         message: "Internal server error. Please try again.",
       },
       { status: 500 },
     );
   }
}

export async function GET(
  request: Request,
{params}:{params: Promise<{workspaceId:string}>}
){

  try{
     const { workspaceId }=await params;
    return await getBoardByWorkspaceId(workspaceId);
  }
  catch(error){
    console.error("GET_BOARD_DETAIL_API_ERROR:", error);
 
     if (error instanceof AppError) {
       return NextResponse.json(
         {
           message: error.message,
         },
         { status: error.statusCode },
       );
     }
 
     return NextResponse.json(
       {
         message: "Internal server error. Please try again.",
       },
       { status: 500 },
     );
  }
}