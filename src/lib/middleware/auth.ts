import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    console.log("JWT PAYLOAD:", payload);

    return payload;
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);
    return null;
  }
}