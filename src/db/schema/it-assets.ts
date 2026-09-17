import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// Invariant State Machines
export const accessStatusEnum = pgEnum("access_status", [
  "active",
  "suspended",
  "revoked",
  "pending_approval",
]);

export const ticketStatusEnum = pgEnum("it_ticket_status", [
  "open",
  "in_progress",
  "waiting_on_employee",
  "resolved",
  "closed",
]);

// Open TypeScript Types for dynamic lookups (reference_lookups: 'device_status', 'it_ticket_priority')
export type StandardDeviceStatus =
  | "available_in_inventory"
  | "ordered"
  | "shipped"
  | "assigned_active"
  | "in_repair"
  | "in_transit"
  | "quarantined"
  | "awaiting_disposal"
  | "lost_or_stolen"
  | "returned"
  | "retired"
  | (string & {});

export type StandardTicketPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent"
  | "p1_critical"
  | (string & {});

// Open TypeScript Types
export type StandardDeviceCategory =
  | "laptop"
  | "desktop"
  | "monitor"
  | "phone"
  | "tablet"
  | "accessory"
  | "yubikey"
  | "vr_headset"
  | "starlink_terminal"
  | "standing_desk"
  | (string & {});

export type StandardDeviceOwnership =
  | "purchased"
  | "leased"
  | "byod"
  | (string & {});

export type StandardMdmProvider =
  | "intune"
  | "jamf"
  | "kandji"
  | "kaseya"
  | "jumpcloud"
  | "custom_agent"
  | "none"
  | (string & {});

// 1. Device Catalog
export const deviceCatalog = pgTable(
  "device_catalog",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    brand: varchar("brand", { length: 100 }).notNull(),
    modelName: varchar("model_name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).default("laptop").notNull(), // dynamic device category
    specifications: jsonb("specifications").notNull(),
    purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
    monthlyLeasePrice: numeric("monthly_lease_price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("catalog_tenant_id_idx").on(table.tenantId),
  ]
);

// 2. Hardware Devices (Fleet inventory & MDM tracking)
export const hardwareDevices = pgTable(
  "hardware_devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    catalogId: uuid("catalog_id").references(() => deviceCatalog.id, {
      onDelete: "set null",
    }),
    serialNumber: varchar("serial_number", { length: 100 }).notNull(),
    assetTag: varchar("asset_tag", { length: 50 }).notNull(),
    deviceCategory: varchar("device_category", { length: 50 }).default("laptop").notNull(),
    ownershipType: varchar("ownership_type", { length: 50 }).default("purchased").notNull(),
    assignedEmployeeId: uuid("assigned_employee_id").references(() => employees.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 50 }).default("available_in_inventory").notNull(),
    
    // MDM & Security Compliance
    mdmEnrolled: boolean("mdm_enrolled").default(false).notNull(),
    mdmProvider: varchar("mdm_provider", { length: 50 }).default("none").notNull(),
    mdmDeviceId: varchar("mdm_device_id", { length: 255 }),
    osVersion: varchar("os_version", { length: 100 }),
    diskEncryptionActive: boolean("disk_encryption_active").default(false).notNull(),
    isCompliant: boolean("is_compliant").default(true).notNull(),
    lastCheckInAt: timestamp("last_check_in_at", { withTimezone: true }),
    
    // Logistics & Warranty
    purchaseDate: date("purchase_date"),
    warrantyExpiryDate: date("warranty_expiry_date"),
    leaseExpiryDate: date("lease_expiry_date"),
    customFields: jsonb("custom_fields").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("devices_tenant_id_idx").on(table.tenantId),
    index("devices_org_id_idx").on(table.organizationId),
    index("devices_assigned_emp_idx").on(table.assignedEmployeeId),
    uniqueIndex("devices_org_serial_idx").on(table.organizationId, table.serialNumber),
    uniqueIndex("devices_org_asset_tag_idx").on(table.organizationId, table.assetTag),
  ]
);

// 3. Device Assignments & Return Recovery Logistics
export const deviceAssignments = pgTable(
  "device_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    deviceId: uuid("device_id")
      .references(() => hardwareDevices.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow().notNull(),
    returnedAt: timestamp("returned_at", { withTimezone: true }),
    courierName: varchar("courier_name", { length: 100 }),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    returnTrackingNumber: varchar("return_tracking_number", { length: 100 }),
    handoverNotes: text("handover_notes"),
    signedHandoverUrl: text("signed_handover_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("dev_assign_tenant_id_idx").on(table.tenantId),
    index("dev_assign_device_idx").on(table.deviceId),
    index("dev_assign_emp_idx").on(table.employeeId),
  ]
);

// 4. SaaS Applications Catalog
export const saasApplications = pgTable(
  "saas_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    category: varchar("category", { length: 100 }),
    logoUrl: text("logo_url"),
    ssoSupported: boolean("sso_supported").default(true).notNull(),
    adminPortalUrl: text("admin_portal_url"),
    isAutoProvisionedOnHire: boolean("is_auto_provisioned_on_hire").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("saas_apps_tenant_id_idx").on(table.tenantId),
    uniqueIndex("saas_apps_org_code_idx").on(table.tenantId, table.code),
  ]
);

// 5. Employee SaaS Access Grants
export const saasAccessGrants = pgTable(
  "saas_access_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    saasApplicationId: uuid("saas_application_id")
      .references(() => saasApplications.id, { onDelete: "cascade" })
      .notNull(),
    accountUsernameOrEmail: varchar("account_username_or_email", { length: 255 }).notNull(),
    roleOrLicenseTier: varchar("role_or_license_tier", { length: 100 }).default("standard").notNull(),
    status: accessStatusEnum("status").default("active").notNull(),
    provisionedAt: timestamp("provisioned_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    autoRevokedOnExit: boolean("auto_revoked_on_exit").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("saas_grants_tenant_id_idx").on(table.tenantId),
    index("saas_grants_emp_idx").on(table.employeeId),
    index("saas_grants_app_idx").on(table.saasApplicationId),
  ]
);

// 6. IT Support Tickets & Device Repairs
export const itSupportTickets = pgTable(
  "it_support_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    deviceId: uuid("device_id").references(() => hardwareDevices.id, {
      onDelete: "set null",
    }),
    ticketNumber: varchar("ticket_number", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).default("hardware_defect").notNull(),
    priority: varchar("priority", { length: 50 }).default("medium").notNull(),
    status: ticketStatusEnum("status").default("open").notNull(),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("it_tickets_tenant_id_idx").on(table.tenantId),
    index("it_tickets_emp_idx").on(table.employeeId),
    index("it_tickets_status_idx").on(table.status),
  ]
);
