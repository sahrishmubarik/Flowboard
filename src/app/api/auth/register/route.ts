import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  emailVerificationTokens,
} from "@/db/authSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { generateToken } from "@/lib/token/generateToken";
import { hashToken } from "@/lib/token/hashToken";

import { sendVerificationEmail } from "@/lib/email/verificationEmail";

import {
  registerSchema,
  validateData,
} from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    // 1. Get request body
    const body = await request.json();

    // 2. Validate request body
    const validation = validateData(
      registerSchema,
      body
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
    } = validation.data;

    // 3. Check if email already exists
    const existingUser = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          message:
            "Email already registered.",
        },
        { status: 400 }
      );
    }

    // 4. Hash password
    const saltRounds = 12;

    const salt = await bcrypt.genSalt(
      saltRounds
    );

    const hashedPassword =
      await bcrypt.hash(password, salt);

    // 5. Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
      });

    // 6. Generate verification token
    const token = generateToken();

    // 7. Hash token before storing it
    const tokenHash = hashToken(token);

    // 8. Calculate expiration
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    // 9. Store verification token
    await db
      .insert(emailVerificationTokens)
      .values({
        userId: newUser.id,
        token: tokenHash,
        expiresAt,
      });

    // 10. Create verification URL
    const verificationUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    // 11. Send verification email
    await sendVerificationEmail({
      email: newUser.email,
      verificationUrl,
    });

    // 12. Return success
    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "REGISTRATION_API_ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}