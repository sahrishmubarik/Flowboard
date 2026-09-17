
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/AppError";
import { registerUser,verifyUserEmail,loginUser,forgotPassword,resetPassword ,logoutSession } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { action } = body;

    switch (action) {
      case "register":
        return await registerUser(body);

     case "login":
         return await loginUser(body);

      case "verify-email":
        return await verifyUserEmail(body);

      case "forgot-password":
         return await forgotPassword(body);

      case "reset-password":
         return await resetPassword(body);
      case "logout":
         return await logoutSession();

      default:
        return NextResponse.json(
          {
            message: "Page not found .",
          },
          { status: 404 }
        );
    }
  } 
  catch (error) {
  console.error("AUTH_API_ERROR:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    {
      message: "Internal server error. Please try again.",
    },
    { status: 500 }
  );
}
}