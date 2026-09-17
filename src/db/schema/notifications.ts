/**
 * =========================================================================================
 * MULTI-CHANNEL NOTIFICATION ENGINE, TEMPLATES & DELIVERY DISPATCH MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enterprise-grade omni-channel notification orchestration supporting:
 * 1. In-App Notification Center (real-time bell notifications, badges, read/unread state).
 * 2. Multi-Channel Dispatch: Email (SendGrid/Resend/AWS SES), SMS (Twilio/Infobip/AfricasTalking),
 *    WhatsApp (Meta Cloud API), and Push (FCM/Web Push).
 * 3. Centralized Notification Templates: Parameterized templates with mustache-style variables,
 *    multi-lingual translations, and fallback channels.
 * 4. User Notification Preferences: Granular per-category and per-channel delivery toggles,
 *    including timezone-aware quiet hours to prevent off-hours disturbance.
 * 5. Immutable Dispatch Logs: Full delivery audits with provider tracking IDs, delivery receipts,
 *    retry counts, and failure reason codes.
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
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Invariant State Machines
export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

// Open TypeScript Types for notification channels (reference_lookups: 'notification_channel')
export type StandardNotificationChannel =
  | "in_app"
  | "email"
  | "sms"
  | "whatsapp"
  | "push"
  | "slack"
  | "teams"
  | "telegram"
  | "discord"
  | "webhook"
  | (string & {});

export const notificationDeliveryStatusEnum = pgEnum("notification_delivery_status", [
  "queued",
  "sending",
  "delivered",
  "read",
  "failed",
  "bounced",
  "suppressed",
]);

// 1. Notification Templates (Standardized System & Custom Templates)
export const notificationTemplates = pgTable(
  "notification_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    templateCode: varchar("template_code", { length: 100 }).notNull(), // e.g., 'payroll.payslip_ready', 'leave.approved', 'claim.submitted'
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // 'payroll', 'leave', 'attendance', 'recruitment', 'performance', 'security'
    description: text("description"),
    
    // Channels supported for this notification event
    defaultChannels: jsonb("default_channels").default(["in_app", "email"]).notNull(),
    
    // Channel-specific template payloads with {{variable}} placeholders
    inAppTitle: varchar("in_app_title", { length: 255 }).notNull(),
    inAppBody: text("in_app_body").notNull(),
    emailSubject: varchar("email_subject", { length: 255 }),
    emailBodyHtml: text("email_body_html"),
    smsBody: text("sms_body"),
    whatsappTemplateId: varchar("whatsapp_template_id", { length: 100 }), // Approved Meta Template ID
    whatsappBody: text("whatsapp_body"),
    
    actionUrlTemplate: text("action_url_template"), // e.g. "/portal/payroll/payslips/{{payslip_id}}"
    variablesSchema: jsonb("variables_schema").default([]).notNull(), // List of supported template parameters
    
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notif_tmpl_tenant_id_idx").on(table.tenantId),
    uniqueIndex("notif_tmpl_tenant_code_idx").on(table.tenantId, table.templateCode),
  ]
);

// 2. User Notification Preferences (Matrix of preferences & quiet hours)
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    category: varchar("category", { length: 50 }).notNull(), // 'payroll', 'leave', 'social', 'security', 'tasks'
    
    // Channel opt-ins
    inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
    emailEnabled: boolean("email_enabled").default(true).notNull(),
    smsEnabled: boolean("sms_enabled").default(false).notNull(),
    whatsappEnabled: boolean("whatsapp_enabled").default(true).notNull(),
    pushEnabled: boolean("push_enabled").default(true).notNull(),
    
    // Quiet Hours Settings
    quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // e.g., "22:00"
    quietHoursEnd: varchar("quiet_hours_end", { length: 5 }),     // e.g., "07:00"
    timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notif_pref_tenant_id_idx").on(table.tenantId),
    uniqueIndex("notif_pref_user_cat_idx").on(table.userId, table.category),
  ]
);

// 3. In-App Notifications Feed (Bell Center / Toast Inbox)
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    recipientUserId: uuid("recipient_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    senderUserId: uuid("sender_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    templateCode: varchar("template_code", { length: 100 }),
    
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    priority: notificationPriorityEnum("priority").default("normal").notNull(),
    category: varchar("category", { length: 50 }).default("general").notNull(),
    
    actionUrl: text("action_url"),
    entityType: varchar("entity_type", { length: 50 }), // 'leave_application', 'payslip', 'contract', 'interview'
    entityId: varchar("entity_id", { length: 100 }),
    metadata: jsonb("metadata").default({}).notNull(),
    
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notifications_tenant_id_idx").on(table.tenantId),
    index("notifications_recipient_idx").on(table.recipientUserId, table.isRead),
    index("notifications_created_idx").on(table.createdAt),
  ]
);

// 4. Notification Dispatches (Outbound Omni-Channel Delivery Logs: Email, WhatsApp, SMS, Push)
export const notificationDispatches = pgTable(
  "notification_dispatches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    notificationId: uuid("notification_id").references(() => notifications.id, {
      onDelete: "set null",
    }),
    recipientUserId: uuid("recipient_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    channel: varchar("channel", { length: 50 }).notNull(),
    destinationAddress: varchar("destination_address", { length: 255 }).notNull(), // Email address, E.164 phone number, or device push token
    
    status: notificationDeliveryStatusEnum("status").default("queued").notNull(),
    provider: varchar("provider", { length: 50 }).notNull(), // 'resend', 'sendgrid', 'twilio', 'infobip', 'meta_whatsapp', 'africastalking', 'firebase'
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    
    payloadSent: jsonb("payload_sent").default({}).notNull(),
    providerResponse: jsonb("provider_response").default({}).notNull(),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0).notNull(),
    maxRetries: integer("max_retries").default(3).notNull(),
    
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notif_dispatch_tenant_id_idx").on(table.tenantId),
    index("notif_dispatch_recipient_idx").on(table.recipientUserId, table.channel),
    index("notif_dispatch_status_idx").on(table.status),
    index("notif_dispatch_provider_idx").on(table.provider, table.providerMessageId),
  ]
);
