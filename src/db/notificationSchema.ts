import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./authSchema";
import { workspace } from "./workspaceSchema";
import { board, sprint } from "./boardSchema";
import { card, commit } from "./cardSchema";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    // Who performed the action; kept as null if that user is deleted.
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // CARD_ASSIGNED | COMMIT_CREATED | SPRINT_CREATED | CARD_MOVED
    type: varchar("type", { length: 50 }).notNull(),

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, {
        onDelete: "cascade",
      }),

    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, {
        onDelete: "cascade",
      }),

    cardId: uuid("card_id").references(() => card.id, {
      onDelete: "set null",
    }),

    sprintId: uuid("sprint_id").references(() => sprint.id, {
      onDelete: "set null",
    }),

    commitId: uuid("commit_id").references(() => commit.id, {
      onDelete: "set null",
    }),

    // The audit_logs entry written in the same transaction. Together with
    // recipientId it prevents notifying someone twice for the same event.
    sourceEventId: uuid("source_event_id"),

    // Snapshot for the message text, e.g. card title or list name, so it
    // stays readable after renames or deletes.
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    // Null means unread.
    readAt: timestamp("read_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Listing a user's notifications, newest first.
    index("notifications_recipient_created_idx").on(
      table.recipientId,
      table.createdAt,
    ),

    // Fast unread count: only unread rows are indexed.
    index("notifications_recipient_unread_idx")
      .on(table.recipientId)
      .where(sql`${table.readAt} is null`),

    uniqueIndex("notifications_source_event_recipient_unique").on(
      table.sourceEventId,
      table.recipientId,
    ),
  ],
);
