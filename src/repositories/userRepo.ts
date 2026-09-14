import { db } from "@/db";
import { users } from "@/db/authSchema";
import { eq } from "drizzle-orm"; 


export const userRepo={
  async findByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

//   async findById(id) {
//     const [user] = await db.select().from(users).where(eq(users.id, id));
//     return user;
//   }
}
