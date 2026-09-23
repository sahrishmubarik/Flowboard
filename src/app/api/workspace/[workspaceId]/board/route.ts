import { AppError } from "@/lib/errors/AppError";
import { NextResponse } from "next/server";
import { createBoard } from "@/services/board";
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
     console.error("AUTH_API_ERROR:", error);
 
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