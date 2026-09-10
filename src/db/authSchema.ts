import { pgTable, uuid, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";


// 1. Users Table (Core Registration and Auth Data)
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  password: text("password"), 
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});