/**
 * =========================================================================================
 * DELEGATION OF AUTHORITY (DoA) & OUT-OF-OFFICE APPROVAL ROUTING MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Critical for enterprise business continuity:
 * Prevents organizational gridlock when managers, department heads, or executives
 * take leave, travel internationally, or are temporarily incapacitated.
 * 
 * KEY CAPABILITIES:
 * 1. Scope-Limited Delegations:
 *    - Delegate specific workflows (e.g., only 'leave_approvals', or only 'expense_claims'),
 *      or full managerial proxy authority.
 * 2. Financial Approval Threshold Caps:
 *    - Cap maximum monetary approval authority granted to the delegate (e.g. up to $5,000 only).
 * 3. Time-Bounded Invariants:
 *    - Automatic activation and expiration on exact start/end dates.
 * 4. Comprehensive Audit Trail:
 *    - Every approval executed under delegation logs both the delegate actor and delegator principal.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Invariant State Machines
export const delegationStatusEnum = pgEnum("delegation_status", [
  "active",
  "scheduled",
  "expired",
  "revoked",
]);

// Open TypeScript Types for dynamic workflow delegation scopes
export type StandardDelegationScope =
  | "all"
  | "leave_approvals"
  | "expense_claims"
  | "timesheet_approvals"
  | "payroll_runs"
  | "job_requisitions"
  | "travel_requests"
  | "loan_applications"
  | "custom"
  | (string & {});

// 1. Delegation Rules
export const delegationRules = pgTable(
  "delegation_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    
    // Delegator (The Principal who holds the original authority)
    delegatorUserId: uuid("delegator_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    // Delegatee (The Proxy authorized to act on behalf)
    delegateeUserId: uuid("delegatee_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    scope: varchar("scope", { length: 50 }).default("all").notNull(),
    reason: text("reason"), // e.g. "Annual Leave / Safari in Maasai Mara"
    
    // Financial approval cap (delegate cannot approve claims/expenditures exceeding this amount)
    maxMonetaryApprovalLimit: numeric("max_monetary_approval_limit", {
      precision: 15,
      scale: 2,
    }),
    currency: varchar("currency", { length: 3 }),
    
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    
    status: delegationStatusEnum("status").default("scheduled").notNull(),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("delegation_tenant_id_idx").on(table.tenantId),
    index("delegation_delegator_idx").on(table.delegatorUserId, table.status),
    index("delegation_delegatee_idx").on(table.delegateeUserId, table.status),
    index("delegation_dates_idx").on(table.startDate, table.endDate),
  ]
);

// 2. Delegation Execution Logs (Audit of every action performed on behalf of another)
export const delegationAuditLogs = pgTable(
  "delegation_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    delegationRuleId: uuid("delegation_rule_id")
      .references(() => delegationRules.id, { onDelete: "cascade" })
      .notNull(),
    
    actedByUserId: uuid("acted_by_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    onBehalfOfUserId: uuid("on_behalf_of_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    
    entityType: varchar("entity_type", { length: 50 }).notNull(), // 'leave_application', 'expense_claim', etc.
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    actionTaken: varchar("action_taken", { length: 50 }).notNull(), // 'approved', 'rejected'
    notes: text("notes"),
    
    executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("del_audit_tenant_id_idx").on(table.tenantId),
    index("del_audit_rule_idx").on(table.delegationRuleId),
    index("del_audit_entity_idx").on(table.entityType, table.entityId),
  ]
);
