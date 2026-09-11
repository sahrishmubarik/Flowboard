import { NextResponse } from "next/server";
import { db } from "@/db";
import { users , emailVerificationTokens} from "@/db/authSchema";
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
  
    const body = await request.json();

  
    const validation = validateData(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
    } = validation.data;

   const existingUser = await db
  .select({
    id: users.id,
  })
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 400 }
      );
    }

  
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });
  
    
    return NextResponse.json(
      { message: "Registration successful!" },
      { status: 201 }
    );
    const token = generateToken();

const tokenHash = hashToken(token);

await db.insert(emailVerificationTokens).values({
  userId: users.id,
  token: tokenHash,
  expiresAt: new Date(Date.now() + 30 * 60 * 1000),
});

const verificationUrl =
  `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

await sendVerificationEmail({
  email: users.email,
  verificationUrl,
});
  } catch (error) {
    console.error("REGISTRATION_API_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}