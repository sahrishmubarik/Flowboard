import { pgTable, uuid, varchar, timestamp , pgEnum, text} from "drizzle-orm/pg-core";
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

/* role eum array  */
export const organizationRoleEnum=pgEnum( 
   "organization_role",
  ["owner", "admin", "manager", "member"])
export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),

  organizationId: uuid("organization_id")
    .notNull()
    .references(() => workspace.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
     assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  role: organizationRoleEnum("role")
    .notNull()
    .default("member"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
 
});


export const invitationSchema=pgTable("invite_members",{
  id:uuid("id").defaultRandom().notNull().primaryKey(),
  email: text("email").unique().notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  expiresAt: timestamp("expires_at").notNull(),
  role:organizationRoleEnum("role")
    .notNull()
    .default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})