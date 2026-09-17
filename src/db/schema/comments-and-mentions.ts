/**
 * =========================================================================================
 * UNIVERSAL POLYMORPHIC COMMENTS, COLLABORATIVE DISCUSSIONS & MENTIONS MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enables social collaboration and contextual audit discussions across ANY entity in Zuri:
 * 1. Polymorphic Entity Discussions:
 *    - Attach comments to Leave Requests, Expense Claims, Candidate Applications,
 *      Performance Reviews, OKR Goals, Employee Profiles, Disciplinary Cases, Policies, etc.
 * 2. Enterprise Visibility & Privacy Scopes:
 *    - `public`: Visible to everyone with view access to the entity (including the employee).
 *    - `internal_hr_only`: Confidential HR-only discussions (e.g. salary debate, background checks).
 *    - `manager_only`: Direct managers & HR leadership only.
 * 3. Threaded Discussions:
 *    - Infinite-level or hierarchical parent-child comment nesting.
 * 4. Rich Mentions & Real-Time Notification Triggers:
 *    - @mention any user, indexing their user ID to trigger notifications and badge unreads.
 * 5. Emoji Reactions & Attachments:
 *    - Lightweight team reactions and document/image proof attachments.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Invariant State Machines
export const commentVisibilityEnum = pgEnum("comment_visibility", [
  "public",
  "internal_hr_only",
  "manager_only",
]);

// 1. Comments (Universal Polymorphic Comment Thread)
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    
    // Polymorphic Target Entity (e.g. 'leave_application', 'candidate', 'expense_claim', 'goal', 'employee')
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    
    parentCommentId: uuid("parent_comment_id"), // Self-reference for threaded replies
    authorUserId: uuid("author_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    content: text("content").notNull(),
    attachments: jsonb("attachments").default([]).notNull(), // Array of { name, url, size, type }
    
    visibility: commentVisibilityEnum("visibility").default("public").notNull(),
    
    isPinned: boolean("is_pinned").default(false).notNull(),
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    
    metadata: jsonb("metadata").default({}).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comments_tenant_id_idx").on(table.tenantId),
    index("comments_entity_idx").on(table.entityType, table.entityId, table.createdAt),
    index("comments_parent_idx").on(table.parentCommentId),
    index("comments_author_idx").on(table.authorUserId),
  ]
);

// 2. Comment Mentions (Explicitly tracks @mentions within comments for notification routing)
export const commentMentions = pgTable(
  "comment_mentions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    mentionedUserId: uuid("mentioned_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    isResolved: boolean("is_resolved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comm_mentions_tenant_id_idx").on(table.tenantId),
    index("comm_mentions_user_idx").on(table.mentionedUserId, table.isResolved),
    index("comm_mentions_comment_idx").on(table.commentId),
  ]
);

// 3. Comment Reactions (Lightweight Emoji Feedback)
export const commentReactions = pgTable(
  "comment_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    emoji: varchar("emoji", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("comm_react_tenant_id_idx").on(table.tenantId),
    uniqueIndex("comm_react_unique_idx").on(table.commentId, table.userId, table.emoji),
  ]
);
