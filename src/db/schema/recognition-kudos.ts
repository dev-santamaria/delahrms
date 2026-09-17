/**
 * =========================================================================================
 * EMPLOYEE RECOGNITION, SOCIAL KUDOS & CULTURE BADGES MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Modern enterprise HCMs (Workhuman, Lattice, Bonusly) embed peer-to-peer recognition
 * to drive retention, morale, and core value alignment:
 * 1. Social Kudos Awards:
 *    - Peer-to-peer and manager-to-peer recognition posts with core company value badges
 *      (e.g., #CustomerObsessed, #DeliverExcellence, #ExtremeOwnership, #Innovate).
 * 2. Gamified Recognition Points:
 *    - Optional redeemable point allocations attached to kudos.
 * 3. Company Feed & Cheer Reactions:
 *    - Social emoji reactions and comments celebrating team achievements publicly.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// 1. Kudos Awards
export const kudosAwards = pgTable(
  "kudos_awards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    
    senderUserId: uuid("sender_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    receiverUserId: uuid("receiver_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    coreValueTag: varchar("core_value_tag", { length: 50 }).notNull(), // e.g. '#ownership', '#teamwork', '#innovation'
    message: text("message").notNull(),
    points: integer("points").default(0).notNull(),
    
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("kudos_tenant_id_idx").on(table.tenantId),
    index("kudos_receiver_idx").on(table.receiverUserId),
    index("kudos_sender_idx").on(table.senderUserId),
    index("kudos_created_idx").on(table.createdAt),
  ]
);

// 2. Kudos Reactions (Celebration claps, hearts, trophies)
export const kudosReactions = pgTable(
  "kudos_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    kudosId: uuid("kudos_id")
      .references(() => kudosAwards.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    emoji: varchar("emoji", { length: 32 }).default("👏").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("kudos_react_tenant_id_idx").on(table.tenantId),
    uniqueIndex("kudos_react_unique_idx").on(table.kudosId, table.userId, table.emoji),
  ]
);
