import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  emailVerificationTokens,
} from "@/db/authSchema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          message: "Verification token is required.",
        },
        { status: 400 }
      );
    }

    const verificationToken = await db
      .select({
        id: emailVerificationTokens.id,
        userId: emailVerificationTokens.userId,
        expiresAt: emailVerificationTokens.expiresAt,
      })
      .from(emailVerificationTokens)
      .where(
        eq(emailVerificationTokens.token, token)
      )
      .limit(1);

    if (verificationToken.length === 0) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired verification link.",
        },
        { status: 400 }
      );
    }

    const tokenData = verificationToken[0];

    if (tokenData.expiresAt < new Date()) {
      await db
        .delete(emailVerificationTokens)
        .where(
          eq(
            emailVerificationTokens.id,
            tokenData.id
          )
        );

      return NextResponse.json(
        {
          message:
            "Verification link has expired.",
        },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerified: new Date(),
      })
      .where(eq(users.id, tokenData.userId));

    await db
      .delete(emailVerificationTokens)
      .where(
        eq(
          emailVerificationTokens.id,
          tokenData.id
        )
      );

    return NextResponse.json(
      {
        message:
          "Email verified successfully. You can now login.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("VERIFY_EMAIL_API_ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Unable to verify email. Please try again.",
      },
      { status: 500 }
    );
  }
}