import { NextResponse } from "next/server";
import { db } from "@/db";
import { cookies } from "next/headers";
import {
  users,
  emailVerificationTokens,
  resetPasswordTokens,
} from "@/db/authSchema";

import { eq } from "drizzle-orm";

import bcrypt from "bcryptjs";

import { generateToken, passwordHashed } from "@/lib/token/generateToken";
import { hashToken } from "@/lib/token/hashToken";
import { AppError } from "@/lib/errors/AppError";
import {
  sendVerificationEmail,
  resetPasswordEmail,
} from "@/lib/email/verificationEmail";

import {
  registerSchema,
  validateData,
  verifyEmailSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";
import jwt from "jsonwebtoken";

import { userRepo } from "@/repositories/userRepo";
import {
  RegisterBody,
  VerifyEmailBody,
  LoginBody,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "@/types/auth";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
export async function registerUser(body: RegisterBody) {
  // 1. Validate
  const validation = validateData(registerSchema, body);
  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { name, email, password } = validation.data;

  // 2. Check existing user
  const existingUser = await userRepo.findByEmail(email);

  if (existingUser) {
    throw new AppError("Email already registered.", 400);
  }

  // 3. Hash password
  // const saltRounds = 12;

  // const salt = await bcrypt.genSalt(saltRounds);

  // const hashedPassword = await bcrypt.hash(password, salt);
  const hashedPassword = await passwordHashed(password);
  // 4. Create user
  const newUser = await userRepo.create({
    name,
    email,
    password: hashedPassword,
  });

  // 5. Generate verification token
  const token = generateToken();

  // 6. Hash token
  const tokenHash = hashToken(token);

  // 7. Expiration - 30 minutes
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // 8. Store token
  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: tokenHash,
    expiresAt,
  });

  // 9. Verification URL
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

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
    { status: 201 },
  );
}

export async function verifyUserEmail(body: VerifyEmailBody) {
  // 1. Validate request
  const validation = validateData(verifyEmailSchema, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
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
    .where(eq(emailVerificationTokens.token, tokenHash))
    .limit(1);

  // 4. Token doesn't exist
  if (verificationToken.length === 0) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  const tokenData = verificationToken[0];

  // 5. Check expiration
  if (tokenData.expiresAt < new Date()) {
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, tokenData.id));

    throw new AppError("Invalid or expired verification link", 400);
  }

  // 6. Verify user's email
  await db
    .update(users)
    .set({
      emailVerified: new Date(),
    })
    .where(eq(users.id, tokenData.userId));

  // 7. Delete used token
  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, tokenData.id));

  // 8. Success
  return NextResponse.json(
    {
      message: "Email verified successfully. You can now login.",
    },
    { status: 200 },
  );
}

export async function loginUser(body: LoginBody) {
  // 1. Validate request
  const validation = validateData(loginSchema, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  // 2. Get email and password
  const { email, password } = validation.data;

  // 3. Find user
  const user = await userRepo.findByEmail(email);

  // 4. User doesn't exist
  if (!user) {
    throw new AppError("Invalid password or email", 400);
  }

  // 5. Check email verification
  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  // 6. Compare password
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new AppError("Invalid email or password.", 401);
  }

  // 7. Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "72h",
    },
  );

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
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
    { status: 200 },
  );
}

export async function forgotPassword(body: ForgotPasswordBody) {
  // 1. Validate request
  const validation = validateData(forgotPasswordSchema, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  // 2. Get email
  const { email } = validation.data;

  // 3. Find user
  const user = await userRepo.findByEmail(email);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // 4. Generate reset token
  const token = generateToken();

  // 5. Hash token
  const tokenHash = hashToken(token);

  // 6. Expiration - 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // 7. Store token
  await db.insert(resetPasswordTokens).values({
    userId: user.id,
    token: tokenHash,
    expiresAt,
  });

  // 8. Reset password URL
  const resetPasswordUrl: string = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  // 9. Send email
  await resetPasswordEmail({
    email: user.email,
    resetPasswordUrl,
  });

  // 10. Return response
  return Response.json(
    {
      message: "Please check your email to reset your password.",
    },
    { status: 200 },
  );
}

export async function resetPassword(body: ResetPasswordBody) {
  // 1. Validate request body
  const validation = validateData(resetPasswordSchema, body);

  if (!validation.success) {
    throw new AppError(validation.error, 400);
  }

  const { token, password } = validation.data;

  // 2. Hash raw token
  const tokenHash = hashToken(token);

  // 3. Find reset token
  const resetToken = await db
    .select({
      id: resetPasswordTokens.id,
      userId: resetPasswordTokens.userId,
      expiresAt: resetPasswordTokens.expiresAt,
    })
    .from(resetPasswordTokens)
    .where(eq(resetPasswordTokens.token, tokenHash))
    .limit(1);

  // 4. Token doesn't exist
  if (resetToken.length === 0) {
    throw new AppError("Invalid or expired reset link.", 400);
  }

  const tokenData = resetToken[0];

  // 5. Check expiration
  if (tokenData.expiresAt < new Date()) {
    await db
      .delete(resetPasswordTokens)
      .where(eq(resetPasswordTokens.id, tokenData.id));

    throw new AppError("Reset link has expired.", 400);
  }

  // 6. Hash new password
  const hashedPassword = await passwordHashed(password);

  // 7. Update user's password
  await db
    .update(users)
    .set({
      password: hashedPassword,
    })
    .where(eq(users.id, tokenData.userId));

  // 8. Delete used reset token
  await db
    .delete(resetPasswordTokens)
    .where(eq(resetPasswordTokens.id, tokenData.id));

  // 9. Success
  return NextResponse.json(
    {
      message: "Password reset successfully. You can now login.",
    },
    { status: 200 },
  );
}

export async function logoutSession() {
  const cookieStore = await cookies();

  cookieStore.delete("token");

  return Response.json({
    message: "Logged out successfully",
  });
}
