/**
 * =========================================================================================
 * UNIVERSAL ENTERPRISE INTEGRATION MESH, EVENT OUTBOX & ERP CONNECTORS
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enterprise organizations operate a heterogeneous tech ecosystem (SAP, NetSuite, Dynamics 365,
 * ERPNext, Workday, Salesforce, Custom APIs). Zuri HRMS provides a resilient, event-driven integration mesh:
 * 
 * 1. Transactional Event Outbox (`events_outbox`):
 *    - Guarantees at-least-once delivery for every lifecycle event (Employee Hired, Shift Clock-In,
 *      Claim Approved, Travel Advance Disbursed, Payroll Run Completed).
 *    - Dispatches to WebSockets/SSE real-time streams, outbound webhooks, and ERP sync pipelines.
 * 
 * 2. Universal ERP Connector Framework (`erp_connectors`):
 *    - Modular connector profiles supporting:
 *      * SAP S/4HANA & ECC (BAPI / RFC / OData)
 *      * Oracle NetSuite (REST Web Services & SuiteTalk)
 *      * Microsoft Dynamics 365 Business Central / Finance & Operations (OData v4)
 *      * ERPNext (REST API v2)
 *      * QuickBooks Online & Xero Accounting
 *      * Custom REST / GraphQL / EventStream
 * 
 * 3. Dynamic ERP Field Mapping & Data Transformation (`erp_field_mappings`):
 *    - Maps Zuri Chart of Accounts, Cost Centers, and Subsidiaries to external ERP accounts
 *      without requiring custom code or vendor consultants.
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

// State Machine Invariants
export const outboxEventStatusEnum = pgEnum("outbox_event_status", [
  "pending",
  "processing",
  "delivered",
  "failed",
  "dead_letter",
]);

export const syncJobStatusEnum = pgEnum("sync_job_status", [
  "queued",
  "running",
  "completed",
  "partially_failed",
  "failed",
]);

// 1. Transactional Event Outbox (At-Least-Once Delivery Event Mesh)
export const eventsOutbox = pgTable(
  "events_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    
    aggregateType: varchar("aggregate_type", { length: 50 }).notNull(), // 'payroll', 'employee', 'attendance', 'claim', 'travel', 'leave', 'training'
    aggregateId: uuid("aggregate_id").notNull(), // ID of the entity that changed
    
    eventType: varchar("event_type", { length: 100 }).notNull(), // e.g. 'payroll.finalized', 'employee.hired', 'claim.approved', 'travel.advance_disbursed'
    eventPayload: jsonb("event_payload").notNull(), // Snapshot of the event payload
    
    status: outboxEventStatusEnum("status").default("pending").notNull(),
    retryCount: integer("retry_count").default(0).notNull(),
    maxRetries: integer("max_retries").default(5).notNull(),
    lastError: text("last_error"),
    
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("outbox_tenant_id_idx").on(table.tenantId),
    index("outbox_status_created_idx").on(table.status, table.createdAt),
    index("outbox_aggregate_idx").on(table.aggregateType, table.aggregateId),
  ]
);

// 2. Universal ERP Connectors (SAP, NetSuite, Dynamics 365, ERPNext, Custom)
export const erpConnectors = pgTable(
  "erp_connectors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
    
    name: varchar("name", { length: 150 }).notNull(), // e.g. "Primary Corporate SAP S/4HANA", "East Africa NetSuite OneWorld"
    systemType: varchar("system_type", { length: 50 }).notNull(), // 'sap_s4hana_bapi', 'oracle_netsuite_rest', 'microsoft_dynamics_365', 'erpnext_rest', 'quickbooks_online', 'xero', 'custom_rest'
    
    baseUrl: text("base_url").notNull(),
    authType: varchar("auth_type", { length: 50 }).default("oauth2").notNull(), // 'oauth2', 'api_key', 'basic_auth', 'mtls_certificate'
    connectionConfig: jsonb("connection_config").default({}).notNull(), // Company code, client ID, sap system number, warehouse codes
    
    syncDirection: varchar("sync_direction", { length: 50 }).default("outbound_to_erp").notNull(), // 'outbound_to_erp', 'inbound_from_erp', 'bi_directional'
    syncFrequency: varchar("sync_frequency", { length: 50 }).default("on_event").notNull(), // 'on_event', 'hourly', 'daily_scheduled'
    
    isActive: boolean("is_active").default(true).notNull(),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("erp_conn_tenant_id_idx").on(table.tenantId),
    index("erp_conn_org_id_idx").on(table.organizationId),
  ]
);

// 3. Dynamic ERP Field Mappings (Code-Free Chart of Accounts & Segment Matching)
export const erpFieldMappings = pgTable(
  "erp_field_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectorId: uuid("connector_id")
      .references(() => erpConnectors.id, { onDelete: "cascade" })
      .notNull(),
    
    entityType: varchar("entity_type", { length: 50 }).notNull(), // 'gl_account', 'cost_center', 'department', 'subsidiary_company_code'
    internalCode: varchar("internal_code", { length: 100 }).notNull(), // Zuri code e.g. "60100" (Salaries Expense), "CC-KE-ENG"
    externalErpCode: varchar("external_erp_code", { length: 100 }).notNull(), // SAP/NetSuite code e.g. "0000400100", "DEPT-501"
    externalErpName: varchar("external_erp_name", { length: 200 }),
    
    transformationRules: jsonb("transformation_rules").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("erp_map_connector_idx").on(table.connectorId),
    uniqueIndex("erp_map_conn_entity_code_idx").on(table.connectorId, table.entityType, table.internalCode),
  ]
);

// 4. Integration Sync Audit Logs (Real-time Sync Verification)
export const integrationSyncJobs = pgTable(
  "integration_sync_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectorId: uuid("connector_id")
      .references(() => erpConnectors.id, { onDelete: "cascade" })
      .notNull(),
    
    jobType: varchar("job_type", { length: 100 }).notNull(), // 'payroll_journal_voucher_post', 'claims_payable_batch_sync', 'headcount_sync'
    status: syncJobStatusEnum("status").default("queued").notNull(),
    
    recordsProcessed: integer("records_processed").default(0).notNull(),
    recordsFailed: integer("records_failed").default(0).notNull(),
    
    requestPayloadSummary: text("request_payload_summary"),
    responsePayloadSummary: text("response_payload_summary"),
    errorMessage: text("error_message"),
    
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("sync_jobs_connector_idx").on(table.connectorId),
    index("sync_jobs_status_idx").on(table.status),
  ]
);
