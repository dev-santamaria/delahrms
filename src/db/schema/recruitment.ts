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

// Invariant Pipeline State Machines
export const jobPostingStatusEnum = pgEnum("job_posting_status", [
  "draft",
  "published",
  "on_hold",
  "closed",
]);

export const candidateApplicationStatusEnum = pgEnum("candidate_app_status", [
  "active",
  "hired",
  "rejected",
  "withdrawn",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
]);

// Open TypeScript Types
export type StandardWorkplaceType =
  | "on_site"
  | "hybrid"
  | "remote"
  | "field_based"
  | (string & {});

export type StandardPipelineStageType =
  | "sourced"
  | "applied"
  | "phone_screen"
  | "technical_assessment"
  | "panel_interview"
  | "executive_review"
  | "background_check"
  | "offer"
  | "hired"
  | "rejected"
  | (string & {});

// 1. Job Openings / Requisitions
export const jobOpenings = pgTable(
  "job_openings",
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
    description: text("description").notNull(),
    requirements: text("requirements"),
    benefits: text("benefits"),
    workplaceType: varchar("workplace_type", { length: 50 }).default("hybrid").notNull(),
    employmentType: varchar("employment_type", { length: 50 }).default("full_time").notNull(),
    openingsCount: integer("openings_count").default(1).notNull(),
    minSalary: numeric("min_salary", { precision: 15, scale: 2 }),
    maxSalary: numeric("max_salary", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }),
    status: jobPostingStatusEnum("status").default("draft").notNull(),
    customFields: jsonb("custom_fields").default({}).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closingDate: date("closing_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("job_openings_tenant_id_idx").on(table.tenantId),
    index("job_openings_org_id_idx").on(table.organizationId),
  ]
);

// 2. Recruitment Pipeline Stages
export const pipelineStages = pgTable(
  "pipeline_stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    jobOpeningId: uuid("job_opening_id").references(() => jobOpenings.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    stageType: varchar("stage_type", { length: 50 }).notNull(), // standard or custom stage type
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("pipeline_stages_tenant_id_idx").on(table.tenantId),
    index("pipeline_stages_job_id_idx").on(table.jobOpeningId),
  ]
);

// 3. Candidates Registry
export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 50 }),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    resumeUrl: text("resume_url"),
    aiParsedData: jsonb("ai_parsed_data"),
    aiSummary: text("ai_summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("candidates_tenant_id_idx").on(table.tenantId),
    index("candidates_email_idx").on(table.email),
  ]
);

// 4. Candidate Applications
export const candidateApplications = pgTable(
  "candidate_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    jobOpeningId: uuid("job_opening_id")
      .references(() => jobOpenings.id, { onDelete: "cascade" })
      .notNull(),
    candidateId: uuid("candidate_id")
      .references(() => candidates.id, { onDelete: "cascade" })
      .notNull(),
    stageId: uuid("stage_id")
      .references(() => pipelineStages.id, { onDelete: "restrict" })
      .notNull(),
    aiMatchScore: numeric("ai_match_score", { precision: 5, scale: 2 }),
    aiEvaluationNotes: text("ai_evaluation_notes"),
    source: varchar("source", { length: 100 }).default("career_page"),
    status: candidateApplicationStatusEnum("status").default("active").notNull(),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("candidate_apps_tenant_id_idx").on(table.tenantId),
    index("candidate_apps_job_id_idx").on(table.jobOpeningId),
    index("candidate_apps_candidate_id_idx").on(table.candidateId),
  ]
);

// 5. Interview Schedules
export const interviewSchedules = pgTable(
  "interview_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    applicationId: uuid("application_id")
      .references(() => candidateApplications.id, { onDelete: "cascade" })
      .notNull(),
    interviewerUserId: uuid("interviewer_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").default(45).notNull(),
    meetingUrl: text("meeting_url"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("interviews_tenant_id_idx").on(table.tenantId),
    index("interviews_app_id_idx").on(table.applicationId),
  ]
);

// 6. Interview Evaluations & Scorecards
export const interviewEvaluations = pgTable(
  "interview_evaluations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    interviewScheduleId: uuid("interview_schedule_id")
      .references(() => interviewSchedules.id, { onDelete: "cascade" })
      .notNull(),
    applicationId: uuid("application_id")
      .references(() => candidateApplications.id, { onDelete: "cascade" })
      .notNull(),
    interviewerUserId: uuid("interviewer_user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    overallRating: integer("overall_rating").notNull(),
    competencyRatings: jsonb("competency_ratings").notNull(),
    strengths: text("strengths"),
    weaknesses: text("weaknesses"),
    recommendation: varchar("recommendation", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("evaluations_tenant_id_idx").on(table.tenantId),
    index("evaluations_app_id_idx").on(table.applicationId),
  ]
);

// 7. Job Offers
export const jobOffers = pgTable(
  "job_offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    applicationId: uuid("application_id")
      .references(() => candidateApplications.id, { onDelete: "cascade" })
      .notNull(),
    candidateId: uuid("candidate_id")
      .references(() => candidates.id, { onDelete: "cascade" })
      .notNull(),
    offerNumber: varchar("offer_number", { length: 50 }).notNull(),
    baseSalary: numeric("base_salary", { precision: 15, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    startDate: date("start_date").notNull(),
    expirationDate: date("expiration_date").notNull(),
    offerLetterUrl: text("offer_letter_url"),
    status: offerStatusEnum("status").default("draft").notNull(),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("job_offers_tenant_id_idx").on(table.tenantId),
    index("job_offers_app_id_idx").on(table.applicationId),
    uniqueIndex("job_offers_org_number_idx").on(table.organizationId, table.offerNumber),
  ]
);
