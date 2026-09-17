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
import { tenants, organizations, costCenters, departments, users } from "./auth-tenancy";

// Standard Financial Accounting Invariants (GAAP / IFRS Double-Entry)
export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "expense",
  "revenue",
]);

export const journalStatusEnum = pgEnum("journal_status", [
  "draft",
  "posted",
  "voided",
  "synced",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "in_progress",
  "synced",
  "failed",
]);

// Open TypeScript types for accounting integration flexibility
export type StandardAccountCategory =
  | "cash_and_bank"
  | "payroll_clearing"
  | "tax_payable"
  | "social_security_payable"
  | "pension_payable"
  | "net_salaries_payable"
  | "wages_expense"
  | "benefits_expense"
  | "employer_tax_expense"
  | "advances_receivable"
  | (string & {});

export type StandardErpSystem =
  | "sap"
  | "erpnext"
  | "quickbooks"
  | "xero"
  | "netsuite"
  | "microsoft_dynamics"
  | "sage"
  | "custom_webhook"
  | (string & {});

// 1. Chart of Accounts (COA tailored for HR & Workforce Payroll)
export const chartOfAccounts = pgTable(
  "chart_of_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    accountCode: varchar("account_code", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 255 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    category: varchar("category", { length: 50 }).notNull(), // dynamic category lookup
    currency: varchar("currency", { length: 3 }).notNull(),
    parentAccountId: uuid("parent_account_id"),
    description: text("description"),
    isReconciliation: boolean("is_reconciliation").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("coa_tenant_id_idx").on(table.tenantId),
    index("coa_org_id_idx").on(table.organizationId),
    uniqueIndex("coa_org_code_idx").on(table.organizationId, table.accountCode),
  ]
);

// 2. Payroll to GL Account Mappings
export const payrollAccountMappings = pgTable(
  "payroll_account_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    componentCode: varchar("component_code", { length: 50 }).notNull(),
    debitAccountId: uuid("debit_account_id")
      .references(() => chartOfAccounts.id, { onDelete: "restrict" })
      .notNull(),
    creditAccountId: uuid("credit_account_id")
      .references(() => chartOfAccounts.id, { onDelete: "restrict" })
      .notNull(),
    employerDebitAccountId: uuid("employer_debit_account_id").references(
      () => chartOfAccounts.id,
      { onDelete: "restrict" }
    ),
    employerCreditAccountId: uuid("employer_credit_account_id").references(
      () => chartOfAccounts.id,
      { onDelete: "restrict" }
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("mappings_tenant_id_idx").on(table.tenantId),
    index("mappings_org_id_idx").on(table.organizationId),
    uniqueIndex("mappings_org_component_idx").on(table.organizationId, table.componentCode),
  ]
);

// 3. Journal Entries (Immutable Double-Entry Vouchers)
export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    voucherNumber: varchar("voucher_number", { length: 50 }).notNull(),
    entryDate: date("entry_date").notNull(),
    postingDate: date("posting_date").notNull(),
    status: journalStatusEnum("status").default("draft").notNull(),
    sourceModule: varchar("source_module", { length: 50 }).default("payroll").notNull(),
    sourceReferenceId: uuid("source_reference_id"),
    totalDebit: numeric("total_debit", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalCredit: numeric("total_credit", { precision: 15, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    description: text("description").notNull(),
    postedByUserId: uuid("posted_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("journal_entries_tenant_id_idx").on(table.tenantId),
    index("journal_entries_org_id_idx").on(table.organizationId),
    uniqueIndex("journal_entries_org_voucher_idx").on(table.organizationId, table.voucherNumber),
  ]
);

// 4. Journal Lines (Individual Debit and Credit legs with Cost Center allocations)
export const journalLines = pgTable(
  "journal_lines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    journalEntryId: uuid("journal_entry_id")
      .references(() => journalEntries.id, { onDelete: "cascade" })
      .notNull(),
    accountId: uuid("account_id")
      .references(() => chartOfAccounts.id, { onDelete: "restrict" })
      .notNull(),
    costCenterId: uuid("cost_center_id").references(() => costCenters.id, {
      onDelete: "set null",
    }),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    debitAmount: numeric("debit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
    creditAmount: numeric("credit_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("journal_lines_tenant_id_idx").on(table.tenantId),
    index("journal_lines_entry_id_idx").on(table.journalEntryId),
    index("journal_lines_account_id_idx").on(table.accountId),
  ]
);

// 5. ERP Integrations (SAP, ERPNext, QuickBooks, Xero, NetSuite, etc.)
export const erpIntegrations = pgTable(
  "erp_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    systemName: varchar("system_name", { length: 50 }).notNull(), // 'sap', 'erpnext', 'quickbooks', 'xero', 'netsuite'
    displayName: varchar("display_name", { length: 100 }).notNull(),
    endpointUrl: text("endpoint_url").notNull(),
    companyCodeOrId: varchar("company_code_or_id", { length: 100 }),
    authConfig: jsonb("auth_config").notNull(),
    isAutoSyncEnabled: boolean("is_auto_sync_enabled").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("erp_integrations_tenant_id_idx").on(table.tenantId),
    index("erp_integrations_org_id_idx").on(table.organizationId),
  ]
);

// 6. ERP Sync Logs
export const erpSyncLogs = pgTable(
  "erp_sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    erpIntegrationId: uuid("erp_integration_id")
      .references(() => erpIntegrations.id, { onDelete: "cascade" })
      .notNull(),
    journalEntryId: uuid("journal_entry_id")
      .references(() => journalEntries.id, { onDelete: "cascade" })
      .notNull(),
    syncStatus: syncStatusEnum("sync_status").notNull(),
    externalDocumentId: varchar("external_document_id", { length: 100 }),
    requestPayload: jsonb("request_payload"),
    responsePayload: jsonb("response_payload"),
    errorMessage: text("error_message"),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("erp_sync_logs_tenant_id_idx").on(table.tenantId),
    index("erp_sync_logs_entry_id_idx").on(table.journalEntryId),
    index("erp_sync_logs_status_idx").on(table.syncStatus),
  ]
);
