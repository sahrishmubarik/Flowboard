
import { NextResponse } from "next/server";

import { registerUser,verifyUserEmail,loginUser,forgotPassword,
  resetPassword
  } from "@/services/auth";

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

      default:
        return NextResponse.json(
          {
            message: "Invalid authentication action.",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("AUTH_API_ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}