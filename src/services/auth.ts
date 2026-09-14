import { NextResponse } from "next/server";
import { db } from "@/db";

import { users,emailVerificationTokens,
} from "@/db/authSchema";

import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";

import { generateToken } from "@/lib/token/generateToken";
import { hashToken } from "@/lib/token/hashToken";

import { sendVerificationEmail } from "@/lib/email/verificationEmail";

import {
  registerSchema,
  validateData,verifyEmailSchema,loginSchema 
} from "@/lib/validations/auth";
import jwt from "jsonwebtoken";

import { userRepo } from "@/repositories/userRepo";

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
export async function registerUser(body: unknown) {
  // 1. Validate
  const validation = validateData(
    registerSchema,
    body
  );

  if (!validation.success) {
    return Response.json(
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

  // 2. Check existing user
  const existingUser = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return Response.json(
      {
        message: "Email already registered.",
      },
      { status: 400 }
    );
  }

  // 3. Hash password
  const saltRounds = 12;

  const salt = await bcrypt.genSalt(
    saltRounds
  );

  const hashedPassword =
    await bcrypt.hash(
      password,
      salt
    );

  // 4. Create user
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

  // 5. Generate verification token
  const token = generateToken();

  // 6. Hash token
  const tokenHash = hashToken(token);

  // 7. Expiration - 30 minutes
  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  // 8. Store token
  await db
    .insert(emailVerificationTokens)
    .values({
      userId: newUser.id,
      token: tokenHash,
      expiresAt,
    });

  // 9. Verification URL
  const verificationUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  // 10. Send email
  await sendVerificationEmail({
    email: newUser.email,
    verificationUrl,
  });

  // 11. Return result
  return Response.json(
    {
      message:
        "Registration successful. Please check your email to verify your account.",
    },
    { status: 201 }
  );
 
}




export async function verifyUserEmail(body: unknown) {
  // 1. Validate request
  const validation = validateData(
    verifyEmailSchema,
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

  // IMPORTANT:
  // validation.data = { token: "..." }
  // so destructure token from it
  const { token } = validation.data;

  // 2. Hash token
  const tokenHash = hashToken(token);

  // 3. Find verification token
  const verificationToken = await db
    .select({
      id: emailVerificationTokens.id,
      userId: emailVerificationTokens.userId,
      expiresAt: emailVerificationTokens.expiresAt,
    })
    .from(emailVerificationTokens)
    .where(
      eq(
        emailVerificationTokens.token,
        tokenHash
      )
    )
    .limit(1);

  // 4. Token doesn't exist
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

  // 5. Check expiration
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

  // 6. Verify user's email
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
    })
    .where(
      eq(
        users.id,
        tokenData.userId
      )
    );

  // 7. Delete used token
  await db
    .delete(emailVerificationTokens)
    .where(
      eq(
        emailVerificationTokens.id,
        tokenData.id
      )
    );

  // 8. Success
  return NextResponse.json(
    {
      message:
        "Email verified successfully. You can now login.",
    },
    { status: 200 }
  );
}


export async function loginUser(body: unknown) {
  // 1. Validate request
  const validation = validateData(
    loginSchema,
    body
  );

  if (!validation.success) {
    return Response.json(
      {
        message: validation.error,
      },
      { status: 400 }
    );
  }

  // 2. Get email and password
  const { email, password } = validation.data;

  // 3. Find user
  const user = await userRepo.findByEmail(email);

  // 4. User doesn't exist
  if (!user) {
    return Response.json(
      {
        message: "Invalid email or password.",
      },
      { status: 401 }
    );
  }

  // 5. Check email verification
  if (!user.emailVerified) {
    return Response.json(
      {
        message:
          "Please verify your email before logging in.",
      },
      { status: 403 }
    );
  }

  // 6. Compare password
  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    return Response.json(
      {
        message: "Invalid email or password.",
      },
      { status: 401 }
    );
  }

  // 7. Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "72h",
    }
  );

  // 8. Return JWT
  return Response.json(
    {
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
    { status: 200 }
  );
}