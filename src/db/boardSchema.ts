import { users } from "./authSchema";
import { workspace } from "./workspaceSchema";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  integer,
  index,
  boolean,
  text,
  date,
} from "drizzle-orm/pg-core";
export const board = pgTable("board", {
  id: uuid("id").defaultRandom().primaryKey(),

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
});

/* board Member table */
export const boardMemberRoleEnum = pgEnum("board_member_role", [
  "owner",
  "admin",
  "manager",
  "member",
]);

export const boardStatusEnum = pgEnum("board_Member_Repo", [
  "ACTIVE",
  "DEACTIVATED",
]);
export const boardMembers = pgTable("board_members", {
  id: uuid("id").defaultRandom().primaryKey(),

  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  role: boardMemberRoleEnum("role").notNull().default("member"),
  status: boardStatusEnum("board_status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  assignedBy: uuid("assigned_by")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
});

/* board list schema */
export const boardList = pgTable(
  "board_list",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, {
        onDelete: "cascade",
      }),

    listName: varchar("list_name").notNull(),

    position: integer("list_position").notNull(),

    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("board_list_board_position_idx").on(table.boardId, table.position),
  ],
  // position = where the list is.   ///index = helps the database find/order lists faster.
);

/* sprint schema */

export const sprintStatusEnum = pgEnum("sprint_status", [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const sprint = pgTable("sprint", {
  id: uuid("id").defaultRandom().primaryKey(),

  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),

  sprintName: text("sprint_name").notNull(),

  goal: text("goal"),

  status: sprintStatusEnum("status").notNull().default("PLANNED"),

  startDate: date("start_date"),

  endDate: date("end_date"),

  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
