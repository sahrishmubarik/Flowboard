import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Actor ID is retained even if the user is later deleted.
    performedBy: uuid("performed_by"),

    // Resource context; intentionally no cascading foreign keys.
    workspaceId: uuid("workspace_id"),
    boardId: uuid("board_id"),

    // Examples: CARD, BOARD, SPRINT, WORKSPACE, USER.
    entityType: varchar("entity_type", { length: 50 }).notNull(),

    // ID of the affected resource.
    entityId: uuid("entity_id").notNull(),

    // Examples: CARD_CREATED, CARD_UPDATED, CARD_DELETED.
    action: varchar("action", { length: 100 }).notNull(),

    // Relevant changes or event-specific metadata.
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    // Server-generated event timestamp.
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_workspace_created_idx").on(
      table.workspaceId,
      table.createdAt,
    ),

    index("audit_logs_board_created_idx").on(table.boardId, table.createdAt),

    index("audit_logs_entity_created_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt,
    ),

    index("audit_logs_actor_created_idx").on(
      table.performedBy,
      table.createdAt,
    ),

    index("audit_logs_action_created_idx").on(table.action, table.createdAt),
  ],
);
