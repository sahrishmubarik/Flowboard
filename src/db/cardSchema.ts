import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { board, boardList, sprint } from "./boardSchema";

import { users } from "./authSchema";

export const cardPriorityEnum = pgEnum("card_priority", [
  "normal",
  "show stopper",
  "critical",
  "major",
  "minor",
]);

export const card = pgTable(
  "card",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Card always belongs to one board
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, {
        onDelete: "cascade",
      }),

    // Current list of the card
    boardListId: uuid("board_list_id")
      .notNull()
      .references(() => boardList.id, {
        onDelete: "cascade",
      }),

    // Nullable because card can stay in backlog / outside sprint
    sprintId: uuid("sprint_id").references(() => sprint.id, {
      onDelete: "set null",
    }),

    // Example:
    // cardNumber = 21
    // Board key = FLOW
    // UI => FLOW-21
    cardNumber: integer("card_number").notNull(),

    title: varchar("title", {
      length: 255,
    }).notNull(),

    description: text("description"),

    priority: cardPriorityEnum("priority").default("normal").notNull(),

    // Card ordering inside its current board list
    position: integer("position").notNull(),

    // User who created/reported the card
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    startDate: timestamp("start_date", {
      withTimezone: true,
    }),

    dueDate: timestamp("due_date", {
      withTimezone: true,
    }),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
    }),

    isArchived: boolean("is_archived").default(false).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },

  (table) => [
    // Fast: get all cards for a board
    index("card_board_id_idx").on(table.boardId),

    // Fast: get cards for specific list
    index("card_board_list_id_idx").on(table.boardListId),

    // Important for:
    // WHERE boardListId = ? ORDER BY position
    index("card_list_position_idx").on(table.boardListId, table.position),

    // Fast sprint card queries
    index("card_sprint_id_idx").on(table.sprintId),

    // Card number should be unique inside one board
    uniqueIndex("card_board_card_number_unique").on(
      table.boardId,
      table.cardNumber,
    ),
  ],
);
