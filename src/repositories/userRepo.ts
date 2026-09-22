import { db } from "@/db";
import { users } from "@/db/authSchema";
import { eq } from "drizzle-orm";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

export const userRepo = {
  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  },

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  },
  async getUserData(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, id));

  return user;
},
  async create({ name, email, password }: CreateUserData) {
    const [row] = await db
      .insert(users)
      .values({
        name,
        email,
        password,
      })
      .returning({
        id: users.id,
        email: users.email,
      });

    return row;
  },
};
