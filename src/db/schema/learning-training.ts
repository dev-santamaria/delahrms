/**
 * =========================================================================================
 * WORKFORCE LEARNING, TRAINING & COMPLIANCE RE-CERTIFICATION MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * This module manages organizational training, mandatory compliance certifications,
 * onboarding orientations, departmental knowledge sharing (e.g. Product Management, Marketing,
 * Engineering, Legal), and automated retraining compliance tracking.
 * 
 * CORE ENTITIES & HIERARCHY:
 * 1. training_courses:
 *    - The master catalog of all learning and training programs available within an organization.
 *    - Supports multi-tenant scoping (Group-wide vs Subsidiary-specific vs Departmental).
 *    - Categorization: Onboarding/Orientation, Mandatory Compliance, IT/Security, Customer Service,
 *      Product Enablement, Leadership, Safety/OSHA.
 *    - Configurable validity periods (e.g., 12 months for annual AML/GDPR refresher) which trigger
 *      automated retraining audit matrices for HR.
 * 
 * 2. training_assignments:
 *    - Individual employee allocations, completion progress, quiz scores, and certificates.
 *    - Tracks expiration timestamps (expires_at) to power "Who needs retraining" dashboards.
 *    - State machine: assigned -> in_progress -> completed -> overdue / expired.
 * 
 * 3. training_retraining_policies:
 *    - Automated recurrence rules that auto-assign refresher courses 30/60 days prior to expiry
 *      or immediately upon new hire onboarding.
 * 
 * MULTI-TENANT & RLS RULES:
 * - Every table has `tenant_id` and `organization_id` foreign keys with cascade deletion.
 * - Non-sensitive catalog courses can be browsed by all employees.
 * - Assignment updates and scores are strictly guarded by Row-Level Security (RLS).
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
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations, departments, users } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants (Fixed Decision Branches)
export const assignmentStatusEnum = pgEnum("training_assignment_status", [
  "assigned",
  "in_progress",
  "completed",
  "overdue",
  "waived",
  "expired",
]);

export const targetAudienceScopeEnum = pgEnum("training_target_scope", [
  "all_company",
  "department_specific",
  "role_specific",
  "individual_assigned",
]);

// Dynamic course categories are managed via reference_lookups (category = 'course_category')
// allowing employers to create unlimited custom categories at runtime with zero code changes.

/**
 * 1. TRAINING COURSES
 * Master catalog of organizational courses and compliance programs.
 */
export const trainingCourses = pgTable(
  "training_courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Workplace Cybersecurity & Phishing Defense"
    code: varchar("code", { length: 50 }).notNull(), // e.g. "SEC-101", "SVC-201"
    description: text("description"),
    
    // Dynamic taxonomy: orientation, compliance, product, customer service
    category: varchar("category", { length: 100 }).default("compliance_mandatory").notNull(),
    
    // Department that authored/published the course (e.g., Product Management, HR, IT, Marketing)
    publishingDepartmentId: uuid("publishing_department_id")
      .references(() => departments.id, { onDelete: "set null" }),
    
    // Scoping & Eligibility
    targetScope: targetAudienceScopeEnum("target_scope").default("all_company").notNull(),
    isMandatory: boolean("is_mandatory").default(true).notNull(),
    
    // Recurrence & Re-Certification Rules (Powers "Who needs to be retrained")
    validityPeriodMonths: integer("validity_period_months"), // e.g., 12 = annual re-training required
    passingScorePercentage: integer("passing_score_percentage").default(80).notNull(), // 80% pass mark
    estimatedDurationMinutes: integer("estimated_duration_minutes").default(60).notNull(),
    
    // Delivery Assets
    contentUrl: text("content_url"), // Video, SCORM, LMS slide deck, or document link
    thumbnailUrl: text("thumbnail_url"),
    
    // Extensibility
    customFields: jsonb("custom_fields").default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("courses_tenant_idx").on(table.tenantId),
    index("courses_org_idx").on(table.organizationId),
    uniqueIndex("courses_org_code_idx").on(table.organizationId, table.code),
  ]
);

/**
 * 2. TRAINING ASSIGNMENTS
 * Individual workforce course allocations, completion logs, and retraining deadlines.
 */
export const trainingAssignments = pgTable(
  "training_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => trainingCourses.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "cascade" })
      .notNull(),
    
    // Assignment Metadata
    assignedByUserId: uuid("assigned_by_user_id")
      .references(() => users.id, { onDelete: "set null" }),
    assignedDate: date("assigned_date").notNull(),
    dueDate: date("due_date").notNull(),
    
    // Execution Status
    status: assignmentStatusEnum("status").default("assigned").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    
    // Score & Certification
    scorePercentage: integer("score_percentage"),
    isPassed: boolean("is_passed").default(false).notNull(),
    certificateUrl: text("certificate_url"),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    
    // Expiration & Retraining Logic
    expiresAt: date("expires_at"), // Completion date + Course validityPeriodMonths
    needsRetraining: boolean("needs_retraining").default(false).notNull(),
    
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("t_assign_tenant_idx").on(table.tenantId),
    index("t_assign_emp_idx").on(table.employeeId),
    index("t_assign_course_idx").on(table.courseId),
    uniqueIndex("t_assign_emp_course_idx").on(table.employeeId, table.courseId),
  ]
);

/**
 * 3. TRAINING RETRAINING POLICIES
 * Automated recurrence triggers (e.g. auto-assign on onboarding, auto-refresh annually).
 */
export const trainingRetrainingPolicies = pgTable(
  "training_retraining_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => trainingCourses.id, { onDelete: "cascade" })
      .notNull(),
    
    policyName: varchar("policy_name", { length: 255 }).notNull(),
    triggerCondition: varchar("trigger_condition", { length: 50 }).notNull(), // 'on_hire', 'before_expiration'
    daysThreshold: integer("days_threshold").default(30).notNull(), // e.g., 30 days before expiration
    autoAssign: boolean("auto_assign").default(true).notNull(),
    sendNotificationReminder: boolean("send_notification_reminder").default(true).notNull(),
    
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("retrain_policy_tenant_idx").on(table.tenantId),
    index("retrain_policy_course_idx").on(table.courseId),
  ]
);
