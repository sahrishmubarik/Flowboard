import { NextResponse } from "next/server";

import {
  registerUser,
  verifyUserEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutSession,
  getCurrentUserDetails,
  changePassword,
} from "@/services/auth";
import { handleRouteError } from "@/lib/errors/handleRouteError";

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
      case "change-password":
        return await changePassword(body);
      case "logout":
        return await logoutSession();

      default:
        return NextResponse.json(
          {
            message: "Page not found .",
          },
          { status: 404 },
        );
    }
  } catch (error) {
    return handleRouteError(error, "AUTH_API_ERROR:");
  }
}

export async function GET() {
  try {
    const userData = await getCurrentUserDetails();

    return NextResponse.json(
      {
        message: "User details fetched successfully",
        user: userData,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, "AUTH_API_ERROR:", "Internal server error");
  }
}
