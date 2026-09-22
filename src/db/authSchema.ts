import { pgTable, uuid, text, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Users Table (Core Registration and Auth Data)
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* Verification email schema */
export const emailVerificationTokens = pgTable("email_verification_token", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  token: varchar("token", { length: 255 }).notNull().unique(),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const resetPasswordTokens = pgTable("reset_password_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
