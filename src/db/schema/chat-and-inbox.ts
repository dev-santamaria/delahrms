/**
 * =========================================================================================
 * REAL-TIME IN-APP CHAT, UNIFIED INBOX & CONVERSATIONS MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enterprise workforce communication engine supporting:
 * 1. Multi-Format Conversations:
 *    - Direct 1-on-1 employee chats
 *    - Department & Team Channels (#engineering, #hr-general, #sales-east-africa)
 *    - Contextual Entity Rooms (Chat attached to a Job Opening, Onboarding Ticket, or Disciplinary Review)
 * 2. Enterprise Chat Features:
 *    - Threaded replies (parent/child message nesting)
 *    - Rich file attachments (PDFs, images, documents)
 *    - Interactive Action Cards (Approve Leave, View Payslip directly in-chat)
 *    - Message edit and soft-delete histories
 *    - Real-time read cursors (lastReadMessageId) and unread counters
 *    - Emoji reactions and user @mentions
 * 3. Security & Compliance:
 *    - Strict tenant and organization boundaries
 *    - Channel moderation roles (channel_admin, moderator, member)
 *    - Mute and notification overrides
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
export const conversationTypeEnum = pgEnum("conversation_type", [
  "direct",
  "group",
  "channel",
  "entity_thread",
]);

export const conversationRoleEnum = pgEnum("conversation_role", [
  "admin",
  "moderator",
  "member",
]);

export const chatMessageTypeEnum = pgEnum("chat_message_type", [
  "text",
  "file",
  "system_event",
  "action_card",
]);

// 1. Conversations (Direct Messages, Channels, and Entity-Linked Rooms)
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    type: conversationTypeEnum("type").default("direct").notNull(),
    title: varchar("title", { length: 255 }), // null for 1:1 direct messages, or channel title e.g. "Talent Acquisition"
    slug: varchar("slug", { length: 100 }), // for channels e.g. "hr-announcements"
    description: text("description"),
    avatarUrl: text("avatar_url"),
    
    isPublic: boolean("is_public").default(false).notNull(), // true for company-wide discoverable channels
    isArchived: boolean("is_archived").default(false).notNull(),
    
    // Contextual Link to HRMS Entity (Optional: links chat to a job application, ticket, or case)
    entityType: varchar("entity_type", { length: 50 }), // 'job_opening', 'onboarding_case', 'it_support_ticket'
    entityId: varchar("entity_id", { length: 100 }),
    
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    lastMessagePreview: text("last_message_preview"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("conversations_tenant_id_idx").on(table.tenantId),
    index("conversations_type_idx").on(table.tenantId, table.type),
    index("conversations_entity_idx").on(table.entityType, table.entityId),
    index("conversations_last_msg_idx").on(table.lastMessageAt),
  ]
);

// 2. Conversation Participants (Membership, Roles, Cursors & Mute Settings)
export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: conversationRoleEnum("role").default("member").notNull(),
    
    isMuted: boolean("is_muted").default(false).notNull(),
    mutedUntil: timestamp("muted_until", { withTimezone: true }),
    isPinned: boolean("is_pinned").default(false).notNull(),
    
    lastReadMessageId: uuid("last_read_message_id"),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("conv_parts_tenant_id_idx").on(table.tenantId),
    index("conv_parts_user_idx").on(table.userId),
    uniqueIndex("conv_parts_unique_idx").on(table.conversationId, table.userId),
  ]
);

// 3. Chat Messages (Rich Text, Files, Threads, Action Cards)
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    senderUserId: uuid("sender_user_id").references(() => users.id, {
      onDelete: "set null",
    }), // null for automated system messages
    
    parentMessageId: uuid("parent_message_id"), // Self-reference for threaded discussions
    messageType: chatMessageTypeEnum("message_type").default("text").notNull(),
    content: text("content").notNull(),
    
    // File attachments [{ fileName, fileUrl, fileSizeBytes, mimeType }]
    attachments: jsonb("attachments").default([]).notNull(),
    
    // Interactive action payload (e.g. { action: "approve_leave", applicationId: "..." })
    actionCardPayload: jsonb("action_card_payload"),
    
    isEdited: boolean("is_edited").default(false).notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("chat_msgs_tenant_id_idx").on(table.tenantId),
    index("chat_msgs_conv_idx").on(table.conversationId, table.createdAt),
    index("chat_msgs_parent_idx").on(table.parentMessageId),
  ]
);

// 4. Chat Message Reactions (Emoji Reactions)
export const chatReactions = pgTable(
  "chat_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    messageId: uuid("message_id")
      .references(() => chatMessages.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    emoji: varchar("emoji", { length: 32 }).notNull(), // e.g., '👍', '❤️', '🚀', '🎉'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("chat_react_tenant_id_idx").on(table.tenantId),
    uniqueIndex("chat_react_unique_idx").on(table.messageId, table.userId, table.emoji),
  ]
);

// 5. Chat Message Mentions (Indexing mentions for notifications and fast filters)
export const chatMentions = pgTable(
  "chat_mentions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    messageId: uuid("message_id")
      .references(() => chatMessages.id, { onDelete: "cascade" })
      .notNull(),
    mentionedUserId: uuid("mentioned_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    mentionText: varchar("mention_text", { length: 100 }).notNull(), // e.g., "@jane.smith"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("chat_mentions_tenant_id_idx").on(table.tenantId),
    index("chat_mentions_user_idx").on(table.mentionedUserId),
    index("chat_mentions_msg_idx").on(table.messageId),
  ]
);
