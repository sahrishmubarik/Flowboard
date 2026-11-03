import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/authSchema";

type CurrentUserPayload = JwtPayload & {
  userId: string;
  tokenVersion: number;
};

export async function getCurrentUser(): Promise<CurrentUserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.tokenVersion !== "number"
    ) {
      return null;
    }

    const [user] = await db
      .select({
        id: users.id,
        tokenVersion: users.tokenVersion,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    return payload as CurrentUserPayload;
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return null;
  }
}
