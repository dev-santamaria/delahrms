/**
 * =========================================================================================
 * SAAS MANAGEMENT, SUBSCRIPTIONS, BILLING & USER INVITATIONS MODULE
 * =========================================================================================
 * Manages enterprise client accounts, multi-tenant billing, quotas, onboarding,
 * Supabase user invitations, and storage telemetry.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users, roles } from "./auth-tenancy";

// Invariant Enums
export const subscriptionStatusEnum = pgEnum("saas_subscription_status", [
  "trialing",
  "active",
  "past_due",
  "suspended",
  "cancelled",
]);

export const invoiceStatusEnum = pgEnum("saas_invoice_status", [
  "draft",
  "issued",
  "paid",
  "void",
  "uncollectible",
]);

export const invitationStatusEnum = pgEnum("saas_invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

// 1. Tenant Subscriptions & Tiers
export const tenantSubscriptions = pgTable(
  "tenant_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    planTier: varchar("plan_tier", { length: 50 }).default("enterprise").notNull(), // 'starter', 'growth', 'enterprise'
    billingCycle: varchar("billing_cycle", { length: 20 }).default("monthly").notNull(), // 'monthly', 'annually'
    status: subscriptionStatusEnum("status").default("active").notNull(),
    seatLimit: integer("seat_limit").default(250).notNull(), // Maximum allowed active employee headcount
    currentHeadcount: integer("current_headcount").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    unitPricePerSeat: numeric("unit_price_per_seat", { precision: 10, scale: 2 }).default("4.50").notNull(),
    totalBillingAmount: numeric("total_billing_amount", { precision: 12, scale: 2 }).default("1125.00").notNull(),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodStartsAt: timestamp("current_period_starts_at", { withTimezone: true }).defaultNow().notNull(),
    currentPeriodEndsAt: timestamp("current_period_ends_at", { withTimezone: true }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).default("bank_wire").notNull(), // 'stripe', 'mpesa_b2b', 'pesalink', 'bank_wire'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tenant_sub_tenant_idx").on(table.tenantId),
    index("tenant_sub_status_idx").on(table.status),
  ]
);

// 2. Tenant Invoices
export const tenantInvoices = pgTable(
  "tenant_invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    subscriptionId: uuid("subscription_id")
      .references(() => tenantSubscriptions.id, { onDelete: "cascade" }),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    billingPeriodStart: timestamp("billing_period_start", { withTimezone: true }).notNull(),
    billingPeriodEnd: timestamp("billing_period_end", { withTimezone: true }).notNull(),
    subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    status: invoiceStatusEnum("status").default("issued").notNull(),
    pdfDownloadUrl: text("pdf_download_url"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("tenant_inv_tenant_idx").on(table.tenantId),
    uniqueIndex("tenant_inv_number_idx").on(table.invoiceNumber),
  ]
);

// 3. Tenant Onboarding Checklists
export const tenantOnboardingChecklists = pgTable(
  "tenant_onboarding_checklists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    hasCompanyProfile: boolean("has_company_profile").default(false).notNull(),
    hasTaxRegistrySetup: boolean("has_tax_registry_setup").default(false).notNull(),
    hasPayGroupsDefined: boolean("has_pay_groups_defined").default(false).notNull(),
    hasImportedEmployees: boolean("has_imported_employees").default(false).notNull(),
    hasConfiguredWorkflows: boolean("has_configured_workflows").default(false).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("onboarding_tenant_idx").on(table.tenantId),
  ]
);

// 4. Team User Invitations (Supabase Auth Integration)
export const userInvitations = pgTable(
  "user_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    roleId: uuid("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    inviteToken: varchar("invite_token", { length: 100 }).notNull(),
    status: invitationStatusEnum("status").default("pending").notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_inv_tenant_idx").on(table.tenantId),
    uniqueIndex("user_inv_token_idx").on(table.inviteToken),
  ]
);

// 5. Tenant Storage Quotas & Compression Telemetry
export const tenantStorageQuotas = pgTable(
  "tenant_storage_quotas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    storageLimitBytes: numeric("storage_limit_bytes", { precision: 20, scale: 0 }).default("53687091200").notNull(), // 50 GB default
    usedStorageBytes: numeric("used_storage_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
    uncompressedOriginalBytes: numeric("uncompressed_original_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
    totalSavedBytes: numeric("total_saved_bytes", { precision: 20, scale: 0 }).default("0").notNull(),
    compressionRatio: numeric("compression_ratio", { precision: 5, scale: 2 }).default("0.00").notNull(),
    deduplicatedObjectsCount: integer("deduplicated_objects_count").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("storage_quota_tenant_idx").on(table.tenantId),
  ]
);
