/**
 * =========================================================================================
 * MULTI-LINGUAL LOCALIZATION & ENTITY TRANSLATIONS MODULE (i18n / l10n)
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Global enterprises operate across linguistically diverse workforces (e.g. English, French,
 * Spanish, Arabic, Swahili, Portuguese, German).
 * 
 * CAPABILITIES:
 * 1. Polymorphic Entity Translation Dictionary:
 *    - Stores localized string translations for any entity in the platform:
 *      * Company Policies (`company_policies` -> `title`, `content`)
 *      * Benefit Plan descriptions (`benefit_plans` -> `name`, `description`)
 *      * Survey Questions (`survey_questions` -> `question_text`)
 *      * Notification Templates (`notification_templates` -> `body_markdown`, `subject`)
 *      * Job Postings (`job_openings` -> `title`, `description`, `requirements`)
 * 2. Fallback Mechanism:
 *    - Queries fall back to tenant primary language if specific localized string is missing.
 * =========================================================================================
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./auth-tenancy";

/**
 * 1. Entity Translations
 * Universal multilingual translation table.
 */
export const entityTranslations = pgTable(
  "entity_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),

    entityType: varchar("entity_type", { length: 50 }).notNull(), // 'company_policy', 'benefit_plan', 'survey_question', 'notification_template', 'job_opening'
    entityId: varchar("entity_id", { length: 100 }).notNull(), // UUID or target row identifier
    fieldKey: varchar("field_key", { length: 50 }).notNull(), // e.g. 'title', 'description', 'content', 'question_text'

    locale: varchar("locale", { length: 10 }).notNull(), // BCP 47 language tag: 'en-US', 'fr-FR', 'sw-KE', 'es-ES', 'ar-SA', 'de-DE'
    translatedValue: text("translated_value").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("entity_trans_tenant_idx").on(table.tenantId),
    index("entity_trans_lookup_idx").on(table.entityType, table.entityId, table.locale),
    uniqueIndex("entity_trans_unique_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId,
      table.fieldKey,
      table.locale
    ),
  ]
);
