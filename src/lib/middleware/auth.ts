import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

type CurrentUserPayload = JwtPayload & {
  userId: string;
};

export async function getCurrentUser(): Promise<CurrentUserPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof payload === "string" || typeof payload.userId !== "string") {
      return null;
    }

    return payload as CurrentUserPayload;
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);

    return null;
  }
}
