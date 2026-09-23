import { users } from "./authSchema";
import { workspace } from "./workspaceSchema";
import { pgTable,uuid, varchar,timestamp} from "drizzle-orm/pg-core";
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