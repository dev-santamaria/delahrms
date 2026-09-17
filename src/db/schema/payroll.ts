import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
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

// Pure Invariant State Machines (Fixed transactional logic)
export const payrollRunStatusEnum = pgEnum("payroll_run_status", [
  "draft",
  "calculating",
  "review_pending",
  "approved",
  "processing_payout",
  "completed",
  "cancelled",
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "reconciled",
]);

// Open TypeScript Union Types for flexible business taxonomies
export type StandardPayFrequency =
  | "monthly"
  | "bi_weekly"
  | "weekly"
  | "daily"
  | (string & {});

export type StandardComponentType =
  | "earning"
  | "deduction"
  | "employer_contribution"
  | "statutory_deduction"
  | (string & {});

export type StandardCalculationType =
  | "fixed_amount"
  | "percentage_of_basic"
  | "percentage_of_gross"
  | "formula"
  | "statutory_rule"
  | (string & {});

export type StandardPayoutMethod =
  | "bank_transfer"
  | "mpesa_b2c"
  | "airtel_money"
  | "mtn_momo"
  | "wise"
  | "stripe"
  | "cash"
  | "cheque"
  | (string & {});

export type StandardStatutoryRuleType =
  | "progressive_bracket"
  | "flat_percentage"
  | "tiered_slab"
  | "custom_formula"
  | (string & {});

// 1. Pay Groups (Grouping employees by pay schedule and currency)
export const payGroups = pgTable(
  "pay_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    frequency: varchar("frequency", { length: 50 }).default("monthly").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    cutoffDay: integer("cutoff_day").default(25).notNull(),
    payDay: integer("pay_day").default(28).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pay_groups_tenant_id_idx").on(table.tenantId),
    index("pay_groups_org_id_idx").on(table.organizationId),
    uniqueIndex("pay_groups_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Salary Components (Earnings, Deductions, Employer Contributions)
export const salaryComponents = pgTable(
  "salary_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    code: varchar("code", { length: 50 }).notNull(), // BASIC, HOUSE_ALLOWANCE, OVERTIME, SACCO, LOAN
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 'earning', 'deduction', 'employer_contribution'
    calculationType: varchar("calculation_type", { length: 50 }).default("fixed_amount").notNull(),
    defaultAmount: numeric("default_amount", { precision: 15, scale: 2 }).default("0.00"),
    defaultPercentage: numeric("default_percentage", { precision: 5, scale: 2 }),
    formulaExpression: text("formula_expression"),
    isTaxable: boolean("is_taxable").default(true).notNull(),
    isPensionable: boolean("is_pensionable").default(true).notNull(),
    isReliefEligible: boolean("is_relief_eligible").default(false).notNull(),
    glAccountId: uuid("gl_account_id"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("salary_components_tenant_id_idx").on(table.tenantId),
    index("salary_components_org_id_idx").on(table.organizationId),
    uniqueIndex("salary_components_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 3. Declarative Statutory Rules (Universal: Kenya, Nigeria, South Africa, UK, US, etc.)
export const statutoryRules = pgTable(
  "statutory_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    countryCode: varchar("country_code", { length: 3 }).notNull(),
    jurisdictionName: varchar("jurisdiction_name", { length: 100 }).notNull(), // "KE_PAYE", "KE_SHIF", "KE_NSSF", "KE_HOUSING_LEVY"
    name: varchar("name", { length: 255 }).notNull(),
    ruleType: varchar("rule_type", { length: 50 }).notNull(), // 'progressive_bracket', 'flat_percentage', 'tiered_slab'
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    configuration: jsonb("configuration").notNull(),
    appliesTo: varchar("applies_to", { length: 50 }).default("gross_taxable").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("statutory_rules_country_idx").on(table.countryCode, table.jurisdictionName),
  ]
);

// 4. Employee Salary Structures
export const employeeSalaryStructures = pgTable(
  "employee_salary_structures",
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
    payGroupId: uuid("pay_group_id")
      .references(() => payGroups.id, { onDelete: "restrict" })
      .notNull(),
    baseSalary: numeric("base_salary", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    isCurrent: boolean("is_current").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("salary_structures_tenant_id_idx").on(table.tenantId),
    index("salary_structures_employee_id_idx").on(table.employeeId),
  ]
);

// 5. Employee Custom Salary Components
export const employeeSalaryComponents = pgTable(
  "employee_salary_components",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    componentId: uuid("component_id")
      .references(() => salaryComponents.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }),
    percentage: numeric("percentage", { precision: 5, scale: 2 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emp_salary_components_tenant_id_idx").on(table.tenantId),
    index("emp_salary_components_employee_id_idx").on(table.employeeId),
  ]
);

// 6. Payroll Cycles
export const payrollCycles = pgTable(
  "payroll_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payGroupId: uuid("pay_group_id")
      .references(() => payGroups.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    cycleYear: integer("cycle_year").notNull(),
    cycleMonth: integer("cycle_month").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    disbursalDate: date("disbursal_date").notNull(),
    isClosed: boolean("is_closed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payroll_cycles_tenant_id_idx").on(table.tenantId),
    index("payroll_cycles_org_id_idx").on(table.organizationId),
  ]
);

// 7. Payroll Runs
export const payrollRuns = pgTable(
  "payroll_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payrollCycleId: uuid("payroll_cycle_id")
      .references(() => payrollCycles.id, { onDelete: "cascade" })
      .notNull(),
    runNumber: varchar("run_number", { length: 50 }).notNull(),
    status: payrollRunStatusEnum("status").default("draft").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    totalGrossPay: numeric("total_gross_pay", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalNetPay: numeric("total_net_pay", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalTaxWithheld: numeric("total_tax_withheld", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalEmployeeDeductions: numeric("total_employee_deductions", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalEmployerContributions: numeric("total_employer_contributions", { precision: 15, scale: 2 }).default("0.00").notNull(),
    totalCostToCompany: numeric("total_cost_to_company", { precision: 15, scale: 2 }).default("0.00").notNull(),
    employeeCount: integer("employee_count").default(0).notNull(),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    journalVoucherId: uuid("journal_voucher_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payroll_runs_tenant_id_idx").on(table.tenantId),
    index("payroll_runs_org_id_idx").on(table.organizationId),
    uniqueIndex("payroll_runs_org_number_idx").on(table.organizationId, table.runNumber),
  ]
);

// 8. Payslips
export const payslips = pgTable(
  "payslips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payrollRunId: uuid("payroll_run_id")
      .references(() => payrollRuns.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    payslipNumber: varchar("payslip_number", { length: 50 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    basicSalary: numeric("basic_salary", { precision: 15, scale: 2 }).notNull(),
    grossPay: numeric("gross_pay", { precision: 15, scale: 2 }).notNull(),
    taxablePay: numeric("taxable_pay", { precision: 15, scale: 2 }).notNull(),
    taxWithheld: numeric("tax_withheld", { precision: 15, scale: 2 }).notNull(),
    totalDeductions: numeric("total_deductions", { precision: 15, scale: 2 }).notNull(),
    netPay: numeric("net_pay", { precision: 15, scale: 2 }).notNull(),
    employerContributions: numeric("employer_contributions", { precision: 15, scale: 2 }).default("0.00").notNull(),
    payoutStatus: payoutStatusEnum("payout_status").default("pending").notNull(),
    payoutMethod: varchar("payout_method", { length: 50 }).default("bank_transfer").notNull(),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payslips_tenant_id_idx").on(table.tenantId),
    index("payslips_run_id_idx").on(table.payrollRunId),
    index("payslips_employee_id_idx").on(table.employeeId),
    uniqueIndex("payslips_run_employee_idx").on(table.payrollRunId, table.employeeId),
  ]
);

// 9. Payslip Line Items
export const payslipItems = pgTable(
  "payslip_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    payslipId: uuid("payslip_id")
      .references(() => payslips.id, { onDelete: "cascade" })
      .notNull(),
    componentId: uuid("component_id").references(() => salaryComponents.id, {
      onDelete: "set null",
    }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 'earning', 'deduction', 'employer_contribution'
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    isTaxable: boolean("is_taxable").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payslip_items_tenant_id_idx").on(table.tenantId),
    index("payslip_items_payslip_id_idx").on(table.payslipId),
  ]
);

// 10. Payout Batches
export const payoutBatches = pgTable(
  "payout_batches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    payrollRunId: uuid("payroll_run_id")
      .references(() => payrollRuns.id, { onDelete: "cascade" })
      .notNull(),
    batchReference: varchar("batch_reference", { length: 100 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: payoutStatusEnum("status").default("pending").notNull(),
    disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
    externalBatchId: varchar("external_batch_id", { length: 255 }),
    responsePayload: jsonb("response_payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payout_batches_tenant_id_idx").on(table.tenantId),
    index("payout_batches_payroll_run_idx").on(table.payrollRunId),
  ]
);

// 11. Payout Transactions
export const payoutTransactions = pgTable(
  "payout_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    payoutBatchId: uuid("payout_batch_id")
      .references(() => payoutBatches.id, { onDelete: "cascade" })
      .notNull(),
    payslipId: uuid("payslip_id")
      .references(() => payslips.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    destinationAccount: varchar("destination_account", { length: 100 }).notNull(),
    status: payoutStatusEnum("status").default("pending").notNull(),
    providerReference: varchar("provider_reference", { length: 255 }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("payout_tx_tenant_id_idx").on(table.tenantId),
    index("payout_tx_batch_id_idx").on(table.payoutBatchId),
    index("payout_tx_payslip_id_idx").on(table.payslipId),
  ]
);
