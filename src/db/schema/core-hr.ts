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
import {
  tenants,
  organizations,
  branches,
  costCenters,
  departments,
  users,
} from "./auth-tenancy";

// Pure Invariant State Machine (Workflow lifecycle state)
export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "probation",
  "notice_period",
  "suspended",
  "terminated",
  "retired",
]);

// Open TypeScript Union Types for IDE autocomplete, while allowing ANY custom tenant lookup code!
export type StandardEmploymentType =
  | "full_time"
  | "part_time"
  | "contractor"
  | "intern"
  | "consultant"
  | "shift_worker"
  | "eor_employee"
  | "peo_employee"
  | (string & {});

export type StandardGender =
  | "male"
  | "female"
  | "non_binary"
  | "other"
  | "prefer_not_to_say"
  | (string & {});

export type StandardMaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "domestic_partnership"
  | (string & {});

export type StandardLifecycleEventType =
  | "hire"
  | "probation_confirmation"
  | "promotion"
  | "transfer"
  | "salary_revision"
  | "disciplinary"
  | "suspension"
  | "resignation"
  | "termination"
  | "contract_renewal"
  | (string & {});

// 1. Designations / Job Titles
export const designations = pgTable(
  "designations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    gradeLevel: integer("grade_level").default(1).notNull(),
    jobGradeId: uuid("job_grade_id"), // Soft link to job_grades.id
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("designations_tenant_id_idx").on(table.tenantId),
    index("designations_org_id_idx").on(table.organizationId),
    uniqueIndex("designations_org_code_idx").on(table.organizationId, table.code),
  ]
);

// 2. Employees (Workforce Registry)
export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    employeeCode: varchar("employee_code", { length: 50 }).notNull(),
    workEmail: varchar("work_email", { length: 255 }).notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    designationId: uuid("designation_id").references(() => designations.id, {
      onDelete: "set null",
    }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    costCenterId: uuid("cost_center_id").references(() => costCenters.id, {
      onDelete: "set null",
    }),
    managerId: uuid("manager_id"), // Primary direct supervisor
    positionId: uuid("position_id"), // Linked to approved position
    
    // Extensible dynamic taxonomy (backed by reference_lookups category 'employment_type')
    employmentType: varchar("employment_type", { length: 50 }).default("full_time").notNull(),
    
    // Core invariant status
    status: employeeStatusEnum("status").default("probation").notNull(),
    hireDate: date("hire_date").notNull(),
    probationEndDate: date("probation_end_date"),
    confirmationDate: date("confirmation_date"),
    terminationDate: date("termination_date"),

    // Temporal Effective Dating (Point-in-Time History & Retroactive Adjustments)
    effectiveStartDate: date("effective_start_date"),
    effectiveEndDate: date("effective_end_date"),
    isCurrent: boolean("is_current").default(true).notNull(),
    
    // Workday-grade JSONB Custom Fields
    customFields: jsonb("custom_fields").default({}).notNull(),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("employees_tenant_id_idx").on(table.tenantId),
    index("employees_org_id_idx").on(table.organizationId),
    index("employees_manager_id_idx").on(table.managerId),
    uniqueIndex("employees_org_code_idx").on(table.organizationId, table.employeeCode),
    uniqueIndex("employees_org_email_idx").on(table.organizationId, table.workEmail),
  ]
);

// 3. Employee Profiles (Personal, Banking, Identification & Compliance)
export const employeeProfiles = pgTable(
  "employee_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    middleName: varchar("middle_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    dateOfBirth: date("date_of_birth"),
    
    // Dynamic lookups
    gender: varchar("gender", { length: 50 }).default("prefer_not_to_say").notNull(),
    maritalStatus: varchar("marital_status", { length: 50 }).default("single").notNull(),
    
    personalEmail: varchar("personal_email", { length: 255 }),
    phoneNumber: varchar("phone_number", { length: 50 }),
    
    // Universal Multi-Country Identification Fields
    nationalIdNumber: varchar("national_id_number", { length: 100 }), // National ID or Passport
    taxIdentificationNumber: varchar("tax_identification_number", { length: 100 }), // KRA PIN, TIN, SSN
    socialSecurityNumber: varchar("social_security_number", { length: 100 }), // NSSF, Social Security
    healthInsuranceNumber: varchar("health_insurance_number", { length: 100 }), // SHIF/NHIF, NHS
    
    // Banking & Mobile Money
    bankName: varchar("bank_name", { length: 100 }),
    bankBranch: varchar("bank_branch", { length: 100 }),
    bankAccountNumber: varchar("bank_account_number", { length: 100 }),
    bankAccountName: varchar("bank_account_name", { length: 255 }),
    bankSwiftCode: varchar("bank_swift_code", { length: 50 }),
    mobileMoneyProvider: varchar("mobile_money_provider", { length: 50 }), // 'M-Pesa', 'Airtel Money', 'MTN MoMo'
    mobileMoneyNumber: varchar("mobile_money_number", { length: 50 }),
    
    residentialAddress: jsonb("residential_address").default({}).notNull(),
    emergencyContacts: jsonb("emergency_contacts").default([]).notNull(),
    customFields: jsonb("custom_fields").default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emp_profiles_tenant_id_idx").on(table.tenantId),
    index("emp_profiles_employee_id_idx").on(table.employeeId),
  ]
);

// 4. Employment Contracts
export const employmentContracts = pgTable(
  "employment_contracts",
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
    contractTitle: varchar("contract_title", { length: 255 }).notNull(),
    contractType: varchar("contract_type", { length: 50 }).default("full_time").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    noticePeriodDays: integer("notice_period_days").default(30).notNull(),
    weeklyWorkingHours: numeric("weekly_working_hours", { precision: 5, scale: 2 }).default("40.00").notNull(),
    documentUrl: text("document_url"),
    customFields: jsonb("custom_fields").default({}).notNull(),
    isCurrent: boolean("is_current").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emp_contracts_tenant_id_idx").on(table.tenantId),
    index("emp_contracts_employee_id_idx").on(table.employeeId),
  ]
);

// 5. Lifecycle Events (Promotions, Transfers, Disciplinary, Confirmations)
export const lifecycleEvents = pgTable(
  "lifecycle_events",
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
    eventType: varchar("event_type", { length: 50 }).notNull(), // backed by reference_lookups category 'lifecycle_event_type'
    effectiveDate: date("effective_date").notNull(),
    previousValues: jsonb("previous_values"),
    newValues: jsonb("new_values"),
    reason: text("reason"),
    notes: text("notes"),
    documentUrl: text("document_url"),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("lifecycle_events_tenant_id_idx").on(table.tenantId),
    index("lifecycle_events_employee_id_idx").on(table.employeeId),
    index("lifecycle_events_type_idx").on(table.eventType),
  ]
);

// 6. Matrix & Concurrent Reporting Lines (Dotted-Line, Functional & Project Managers)
export const employeeReportingLines = pgTable(
  "employee_reporting_lines",
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
    managerEmployeeId: uuid("manager_employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    
    // 'primary_direct', 'dotted_line_matrix', 'functional_lead', 'project_lead', 'mentorship'
    reportingType: varchar("reporting_type", { length: 50 }).default("dotted_line_matrix").notNull(),
    allocationPercentage: numeric("allocation_percentage", { precision: 5, scale: 2 }).default("100.00").notNull(),
    
    effectiveStartDate: date("effective_start_date").notNull(),
    effectiveEndDate: date("effective_end_date"),
    isCurrent: boolean("is_current").default(true).notNull(),
    notes: text("notes"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("rep_lines_tenant_idx").on(table.tenantId),
    index("rep_lines_emp_idx").on(table.employeeId),
    index("rep_lines_mgr_idx").on(table.managerEmployeeId),
  ]
);

