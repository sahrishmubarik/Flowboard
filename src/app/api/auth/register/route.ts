import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/authSchema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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
  } catch (error) {
    console.error("REGISTRATION_API_ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}