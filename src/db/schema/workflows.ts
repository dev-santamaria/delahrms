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
import { tenants, organizations, roles, users } from "./auth-tenancy";

// State Machine Invariants
export const workflowInstanceStatusEnum = pgEnum("workflow_instance_status", [
  "in_progress",
  "approved",
  "rejected",
  "cancelled",
]);

export const stepStatusEnum = pgEnum("step_status", [
  "pending",
  "approved",
  "rejected",
  "skipped",
]);

// Open TypeScript Types
export type StandardWorkflowTrigger =
  | "leave_application"
  | "payroll_approval"
  | "expense_claim"
  | "overtime_request"
  | "salary_revision"
  | "job_requisition"
  | "resignation"
  | "hardware_procurement"
  | "visa_application"
  | "benefit_enrollment"
  | (string & {});

export type StandardStepApproverType =
  | "direct_manager"
  | "department_head"
  | "specific_role"
  | "specific_user"
  | "cost_center_owner"
  | "custom_condition"
  | (string & {});

// 1. Workflow Definitions
export const workflowDefinitions = pgTable(
  "workflow_definitions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    triggerType: varchar("trigger_type", { length: 50 }).notNull(), // dynamic trigger string
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("wf_defs_tenant_id_idx").on(table.tenantId),
    index("wf_defs_trigger_idx").on(table.triggerType),
  ]
);

// 2. Workflow Steps
export const workflowSteps = pgTable(
  "workflow_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    stepNumber: integer("step_number").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    approverType: varchar("approver_type", { length: 50 }).notNull(), // dynamic approver lookup
    specificRoleId: uuid("specific_role_id").references(() => roles.id, {
      onDelete: "set null",
    }),
    specificUserId: uuid("specific_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    conditionRules: jsonb("condition_rules"),
    autoApproveTimeoutHours: integer("auto_approve_timeout_hours"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("wf_steps_tenant_id_idx").on(table.tenantId),
    index("wf_steps_def_id_idx").on(table.workflowDefinitionId),
  ]
);

// 3. Workflow Instances
export const workflowInstances = pgTable(
  "workflow_instances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    requesterUserId: uuid("requester_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    currentStepNumber: integer("current_step_number").default(1).notNull(),
    status: workflowInstanceStatusEnum("status").default("in_progress").notNull(),
    initiatedAt: timestamp("initiated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("wf_instances_tenant_id_idx").on(table.tenantId),
    index("wf_instances_entity_idx").on(table.entityType, table.entityId),
    index("wf_instances_status_idx").on(table.status),
  ]
);

// 4. Workflow Actions
export const workflowActions = pgTable(
  "workflow_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    instanceId: uuid("instance_id")
      .references(() => workflowInstances.id, { onDelete: "cascade" })
      .notNull(),
    stepId: uuid("step_id")
      .references(() => workflowSteps.id, { onDelete: "cascade" })
      .notNull(),
    actorUserId: uuid("actor_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    action: varchar("action", { length: 50 }).notNull(), // 'approved', 'rejected', 'delegated'
    comments: text("comments"),
    actedAt: timestamp("acted_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("wf_actions_tenant_id_idx").on(table.tenantId),
    index("wf_actions_instance_id_idx").on(table.instanceId),
  ]
);
