/**
 * =========================================================================================
 * UNIVERSAL DYNAMIC GEOGRAPHIC ADMINISTRATIVE HIERARCHY MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Global enterprise HRMS platforms (e.g. Workday, SAP SuccessFactors) do not hardcode regional
 * structures. Instead, they provide a recursive spatial hierarchy of administrative divisions:
 * 
 * Multi-Level Hierarchy Examples:
 * - Kenya: Country (KEN) -> Region/Province -> County (47) -> Sub-County -> Ward
 * - Uganda: Country (UGA) -> Region -> District -> County -> Sub-County/Town Council
 * - Tanzania: Country (TZA) -> Region -> District -> Ward
 * - Rwanda: Country (RWA) -> Province -> District -> Sector
 * - Nigeria: Country (NGA) -> Geopolitical Zone -> State (36) -> Local Government Area (LGA)
 * - South Africa: Country (ZAF) -> Province -> District/Metropolitan Municipality -> Local Municipality
 * - United States: Country (USA) -> State (50) -> County -> City / Township
 * - United Kingdom: Country (GBR) -> Nation (England/Scotland/Wales/NI) -> County/Borough -> Ward
 * 
 * CAPABILITIES:
 * - Recursive parent-child tree (`parent_id`) allowing unlimited nesting depth.
 * - Dynamic assignment of statutory labor rules, minimum wages, and localized public holiday calendars.
 * - Multi-subsidiary scoping (tenant/subsidiary level overrides or global defaults).
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
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants, organizations } from "./auth-tenancy";

// 1. Geographic Administrative Units (Recursive Spatial Hierarchy)
export const geoAdministrativeUnits = pgTable(
  "geo_administrative_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global default catalog
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    
    countryCode: varchar("country_code", { length: 3 }).notNull(), // ISO 3166-1 alpha-3 (e.g. "KEN", "UGA", "TZA", "RWA", "USA", "GBR")
    parentId: uuid("parent_id"), // Self-referencing link to parent administrative unit
    
    level: integer("level").notNull(), // 1 = Primary (State/County/Region), 2 = Secondary (District/LGA/Sub-county), 3 = Tertiary (Ward/Town/Sector)
    divisionType: varchar("division_type", { length: 50 }).notNull(), // 'county', 'district', 'region', 'province', 'state', 'sector', 'ward', 'municipality'
    
    name: varchar("name", { length: 150 }).notNull(), // e.g. "Nairobi County", "Wakiso District", "Arusha Region", "Kigali Province"
    code: varchar("code", { length: 50 }).notNull(), // e.g. "KE-47", "UG-113", "TZ-01", "RW-01"
    postalAbbreviation: varchar("postal_abbreviation", { length: 20 }),
    
    // Regional Economic & Statutory Parameters
    defaultCurrency: varchar("default_currency", { length: 3 }), // Inherited by branches if unassigned
    defaultTimezone: varchar("default_timezone", { length: 100 }).default("UTC").notNull(),
    minimumWageHourlyRate: numeric("minimum_wage_hourly_rate", { precision: 12, scale: 2 }),
    minimumWageMonthlyRate: numeric("minimum_wage_monthly_rate", { precision: 12, scale: 2 }),
    
    // Extensible Metadata (Per diem rate tier, labor inspectorate office, taxation zone)
    metadata: jsonb("metadata").default({}).notNull(),
    
    isActive: boolean("is_active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("geo_admin_tenant_id_idx").on(table.tenantId),
    index("geo_admin_country_idx").on(table.countryCode),
    index("geo_admin_parent_id_idx").on(table.parentId),
    index("geo_admin_level_idx").on(table.level),
    uniqueIndex("geo_admin_country_code_uniq_idx").on(table.countryCode, table.code),
  ]
);

// 2. Work Locations (Physical Facilities, Campuses, Mines, & Remote Hubs)
export const geoWorkLocations = pgTable(
  "geo_work_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    
    administrativeUnitId: uuid("administrative_unit_id")
      .references(() => geoAdministrativeUnits.id, { onDelete: "restrict" }),
    
    name: varchar("name", { length: 200 }).notNull(), // e.g. "Upper Hill Headquarters", "Kigali Tech Park", "Geita Mining Complex"
    code: varchar("code", { length: 50 }).notNull(),
    locationType: varchar("location_type", { length: 50 }).default("office").notNull(), // 'office', 'warehouse', 'mine_site', 'remote_hub', 'retail_store'
    
    addressLine1: varchar("address_line1", { length: 255 }).notNull(),
    addressLine2: varchar("address_line2", { length: 255 }),
    cityOrTown: varchar("city_or_town", { length: 100 }).notNull(),
    postalCode: varchar("postal_code", { length: 20 }),
    countryCode: varchar("country_code", { length: 3 }).notNull(),
    
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    geofenceRadiusMeters: integer("geofence_radius_meters").default(150),
    
    primaryContactName: varchar("primary_contact_name", { length: 150 }),
    primaryContactPhone: varchar("primary_contact_phone", { length: 50 }),
    primaryContactEmail: varchar("primary_contact_email", { length: 150 }),
    
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("geo_work_loc_tenant_id_idx").on(table.tenantId),
    index("geo_work_loc_org_id_idx").on(table.organizationId),
    index("geo_work_loc_admin_idx").on(table.administrativeUnitId),
    uniqueIndex("geo_work_loc_org_code_idx").on(table.organizationId, table.code),
  ]
);
