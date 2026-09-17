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
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Invariant Webhook Delivery State Machine
export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "pending",
  "delivered",
  "failed",
  "retrying",
]);

// Payment gateway types and rails are dynamically managed via reference_lookups
// (category = 'payment_gateway_type'), allowing integration of any global or regional payment gateway.

// 1. API Keys
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),
    keyHash: varchar("key_hash", { length: 255 }).notNull(),
    scopes: jsonb("scopes").default([]).notNull(),
    rateLimitPerMinute: integer("rate_limit_per_minute").default(600).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("api_keys_tenant_id_idx").on(table.tenantId),
    index("api_keys_prefix_idx").on(table.keyPrefix),
  ]
);

// 2. Webhook Endpoints
export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    url: text("url").notNull(),
    secret: varchar("secret", { length: 255 }).notNull(),
    description: text("description"),
    subscribedEvents: jsonb("subscribed_events").default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("webhooks_tenant_id_idx").on(table.tenantId),
  ]
);

// 3. Webhook Deliveries
export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    endpointId: uuid("endpoint_id")
      .references(() => webhookEndpoints.id, { onDelete: "cascade" })
      .notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    httpStatusCode: integer("http_status_code"),
    responseBody: text("response_body"),
    attemptCount: integer("attempt_count").default(1).notNull(),
    status: webhookDeliveryStatusEnum("status").default("pending").notNull(),
    nextRetryAt: timestamp("next_retry_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("wh_deliveries_tenant_id_idx").on(table.tenantId),
    index("wh_deliveries_endpoint_idx").on(table.endpointId),
    index("wh_deliveries_status_idx").on(table.status),
  ]
);

// 4. Payment Gateway Configurations
export const paymentGateways = pgTable(
  "payment_gateways",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    gatewayType: varchar("gateway_type", { length: 50 }).notNull(), // dynamic payment rail code
    displayName: varchar("display_name", { length: 100 }).notNull(),
    credentials: jsonb("credentials").notNull(),
    isLive: boolean("is_live").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payment_gateways_tenant_id_idx").on(table.tenantId),
    index("payment_gateways_org_id_idx").on(table.organizationId),
  ]
);
