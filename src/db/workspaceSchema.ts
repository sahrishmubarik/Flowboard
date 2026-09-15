import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/db/authSchema";
export const workspace = pgTable("workspace", {
  id: uuid("id").defaultRandom().primaryKey(),

  workspaceName: varchar("workspace_name").notNull(),

  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});