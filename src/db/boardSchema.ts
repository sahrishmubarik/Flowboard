import { users } from "./authSchema";
import { workspace } from "./workspaceSchema";
import { pgTable,uuid, varchar,timestamp,  pgEnum,} from "drizzle-orm/pg-core";
export const board=pgTable("board",
{
    id:uuid("id").defaultRandom().primaryKey(),
  
    boardName: varchar("board_name").notNull(),
     organizationId: uuid("organization_id")
        .notNull()
        .references(() => workspace.id, {
          onDelete: "cascade",
        }),
     createdBy: uuid("created_by")
       .notNull()
       .references(() => users.id, {
         onDelete: "cascade",
       }),
   
     createdAt: timestamp("created_at").defaultNow().notNull(),
}

);

/* board Member table */
export const boardMemberRoleEnum = pgEnum(
  "board_member_role",
  [
    "owner",
    "admin",
    "manager",
    "member",
  ],
);

export const boardMembers = pgTable("board_members", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  role: boardMemberRoleEnum("role")
    .notNull()
    .default("member"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});