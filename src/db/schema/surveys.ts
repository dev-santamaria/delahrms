/**
 * =========================================================================================
 * WORKFORCE SURVEYS, CULTURE & eNPS PULSE FEEDBACK MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Enables HR, People Operations, and Leadership to author, launch, track, and analyze
 * employee surveys, satisfaction pulses, and culture climate audits (SurveyMonkey / Culture Amp style).
 * 
 * CORE ENTITIES & PRIVACY INVARIANTS:
 * 1. survey_campaigns:
 *    - Survey cycle manager (eNPS pulse, 30/60/90 onboarding, leadership 360, exit interview, benefits satisfaction).
 *    - Strict Anonymity Guard: when `is_anonymous = true`, employee IDs are NEVER persisted on responses,
 *      ensuring complete psychological safety and untamperable privacy for the workforce.
 *    - Aggregates live eNPS scores (-100 to +100), response rates, and average rating scores.
 * 
 * 2. survey_questions:
 *    - Flexible question designer supporting Likert ratings (1-5), eNPS (0-10), single choice,
 *      multi-select, and open qualitative text comments.
 * 
 * 3. survey_responses & survey_answers:
 *    - Stores submitted answer payloads, ratings, and sentiment categorization.
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
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";
import { employees } from "./core-hr";

// State Machine Invariants
export const surveyStatusEnum = pgEnum("survey_campaign_status", [
  "draft",
  "active",
  "closed",
  "archived",
]);

// Open TypeScript Types for dynamic survey taxonomies (reference_lookups: 'survey_type')
export type StandardSurveyType =
  | "enps_pulse"
  | "onboarding_feedback"
  | "engagement_climate"
  | "manager_360"
  | "exit_interview"
  | "benefits_satisfaction"
  | "workplace_safety"
  | "stay_interview"
  | "culture_audit"
  | "diversity_inclusion"
  | (string & {});

export const questionTypeEnum = pgEnum("survey_question_type", [
  "rating_1_to_5",
  "nps_0_to_10",
  "single_choice",
  "multi_choice",
  "open_text",
]);

/**
 * 1. SURVEY CAMPAIGNS
 * Master survey campaigns and engagement pulse initiatives.
 */
export const surveyCampaigns = pgTable(
  "survey_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    
    title: varchar("title", { length: 255 }).notNull(), // e.g. "Q3 2026 Workforce Engagement & eNPS Pulse"
    description: text("description"),
    surveyType: varchar("survey_type", { length: 50 }).default("enps_pulse").notNull(),
    
    // Privacy & Anonymity Guarantee (Essential for honest HR feedback)
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    
    // Audience Targeting
    targetScope: varchar("target_scope", { length: 50 }).default("all_company").notNull(), // 'all_company', 'subsidiary', 'department'
    
    // Timeline
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: surveyStatusEnum("status").default("draft").notNull(),
    
    // Telemetry & Aggregated Metrics
    totalTargetCount: integer("total_target_count").default(0).notNull(),
    responseCount: integer("response_count").default(0).notNull(),
    enpsScore: integer("enps_score"), // Net Promoter Score (-100 to +100)
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("surveys_tenant_idx").on(table.tenantId),
    index("surveys_org_idx").on(table.organizationId),
  ]
);

/**
 * 2. SURVEY QUESTIONS
 * Question definitions linked to a survey campaign.
 */
export const surveyQuestions = pgTable(
  "survey_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    campaignId: uuid("campaign_id")
      .references(() => surveyCampaigns.id, { onDelete: "cascade" })
      .notNull(),
    
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").default("rating_1_to_5").notNull(),
    
    // Array of options for single/multi choice: e.g. ["Strongly Agree", "Agree", "Neutral", "Disagree"]
    options: jsonb("options").default([]).notNull(),
    
    isRequired: boolean("is_required").default(true).notNull(),
    displayOrder: integer("display_order").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sq_campaign_idx").on(table.campaignId),
  ]
);

/**
 * 3. SURVEY RESPONSES
 * Submitted feedback container. Note: employeeId is NULL if isAnonymous = true.
 */
export const surveyResponses = pgTable(
  "survey_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    campaignId: uuid("campaign_id")
      .references(() => surveyCampaigns.id, { onDelete: "cascade" })
      .notNull(),
    
    // Explicitly NULL for anonymous surveys to guarantee workforce privacy
    employeeId: uuid("employee_id")
      .references(() => employees.id, { onDelete: "set null" }),
    
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    sentimentScore: numeric("sentiment_score", { precision: 3, scale: 2 }), // e.g., AI sentiment tag
  },
  (table) => [
    index("sr_campaign_idx").on(table.campaignId),
    index("sr_employee_idx").on(table.employeeId),
  ]
);

/**
 * 4. SURVEY ANSWERS
 * Individual question answers tied to a submission.
 */
export const surveyAnswers = pgTable(
  "survey_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .references(() => surveyResponses.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => surveyQuestions.id, { onDelete: "cascade" })
      .notNull(),
    
    numericValue: integer("numeric_value"), // For 1-5 rating or 0-10 NPS
    textValue: text("text_value"), // For open feedback text
    selectedOptions: jsonb("selected_options"), // For choice arrays
  },
  (table) => [
    index("sa_response_idx").on(table.responseId),
    index("sa_question_idx").on(table.questionId),
  ]
);
