import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { tenants, organizations, users } from "./auth-tenancy";

// Open TypeScript Types
export type StandardAnnouncementPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"
  | (string & {});

export type StandardAnnouncementTarget =
  | "all_company"
  | "specific_organization"
  | "specific_department"
  | "specific_branch"
  | "specific_cost_center"
  | (string & {});

// Re-export comprehensive enterprise Public Holidays from global-calendars module
export { publicHolidays } from "./global-calendars";

// 2. Company Events
export const companyEvents = pgTable(
  "company_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    startDateTime: timestamp("start_date_time", { withTimezone: true }).notNull(),
    endDateTime: timestamp("end_date_time", { withTimezone: true }).notNull(),
    location: text("location"),
    meetingUrl: text("meeting_url"),
    isAllDay: boolean("is_all_day").default(false).notNull(),
    colorCode: varchar("color_code", { length: 20 }).default("#6366f1").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("events_tenant_id_idx").on(table.tenantId),
    index("events_dates_idx").on(table.startDateTime, table.endDateTime),
  ]
);

// 3. Announcements
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    priority: varchar("priority", { length: 50 }).default("normal").notNull(),
    targetScope: varchar("target_scope", { length: 50 }).default("all_company").notNull(),
    targetScopeId: uuid("target_scope_id"),
    authorUserId: uuid("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isPinned: boolean("is_pinned").default(false).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("announcements_tenant_id_idx").on(table.tenantId),
    index("announcements_published_idx").on(table.publishedAt),
  ]
);

// 4. Announcement Read Receipts
export const announcementReads = pgTable(
  "announcement_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    announcementId: uuid("announcement_id")
      .references(() => announcements.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("ann_reads_tenant_id_idx").on(table.tenantId),
    index("ann_reads_user_idx").on(table.announcementId, table.userId),
  ]
);
