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
  decimal,
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
export const cardTaskTypeEnum = pgEnum("card_type", [
  "bug",
  "feature",
  "task",
  "tbd",
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
    sprintId: uuid("sprint_id")
      .array()
      .references(() => sprint.id, {
        onDelete: "set null",
      }),

    cardNumber: integer("card_number").notNull(),

    title: varchar("title", {
      length: 255,
    }).notNull(),

    description: text("description"),

    priority: cardPriorityEnum("priority").default("normal").notNull(),
    taskType: cardTaskTypeEnum("type").default("task").notNull(),
    // Card ordering inside its current board list
    position: integer("position").notNull(),

    // User who created/reported the card
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    /* assigned user to task  */
    assignedTo: uuid("assigned_to").references(() => users.id, {
      onDelete: "set null",
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
    estimateTime: decimal("estimate_time"),
    spentTime: decimal("spent_time"),
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

export const cardAttachment = pgTable(
  "card_attachment",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Which card owns this attachment?
    cardId: uuid("card_id")
      .notNull()
      .references(() => card.id, {
        onDelete: "cascade",
      }),

    // Original filename shown in the UI
    fileName: varchar("file_name", {
      length: 255,
    }).notNull(),

    // URL returned by Vercel Blob
    fileUrl: text("file_url").notNull(),

    // Needed to identify and delete the Blob later
    blobPathname: text("blob_pathname").notNull(),

    contentType: varchar("content_type", {
      length: 255,
    }).notNull(),

    size: integer("size").notNull(),

    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("card_attachment_card_id_idx").on(table.cardId)],
);

export const commit = pgTable("commit", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Card always belongs to one board
  cardId: uuid("card_id")
    .notNull()
    .references(() => card.id, {
      onDelete: "cascade",
    }),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  description: text("description"),

  // User who created/reported the card
  createdBy: uuid("created_By")
    .notNull()
    .references(() => users.id, {
      onDelete: "restrict",
    }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
