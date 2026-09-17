/**
 * =========================================================================================
 * MULTI-CURRENCY, TREASURY & REAL-TIME FX CONVERSION MODULE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Multinational enterprises routinely operate across diverse currency jurisdictions:
 * - Kenya: KES (Kenyan Shilling)
 * - Uganda: UGX (Ugandan Shilling)
 * - Tanzania: TZS (Tanzanian Shilling)
 * - Rwanda: RWF (Rwandan Franc)
 * - Global Operations: USD (US Dollar), EUR (Euro), GBP (British Pound), ZAR (South African Rand)
 * 
 * CAPABILITIES:
 * 1. currencies:
 *    - Master catalog of all ISO-4217 currencies supported across the enterprise.
 *    - Captures decimal places, symbols, and standard ISO numeric codes.
 * 
 * 2. currency_exchange_rates:
 *    - Historical and forward-looking currency conversion matrix.
 *    - Multiple rate types:
 *      * 'spot': Real-time interbank market rate (for immediate expense payouts).
 *      * 'corporate_monthly': Official month-end accounting rate (used by SAP / NetSuite for payroll booking).
 *      * 'budget_rate': Annual fixed planning rate (used for FY headcount and compensation budgeting).
 *    - Supports triangulation between non-base currencies (e.g., KES -> RWF converted via USD).
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
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { tenants } from "./auth-tenancy";

// 1. Currencies Master Catalog
export const currencies = pgTable(
  "currencies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 3 }).notNull().unique(), // ISO-4217 Alpha-3 (e.g. "KES", "UGX", "TZS", "RWF", "USD", "EUR", "GBP")
    numericCode: varchar("numeric_code", { length: 3 }), // e.g. "404" for KES, "840" for USD
    name: varchar("name", { length: 100 }).notNull(), // "Kenyan Shilling", "Rwandan Franc"
    symbol: varchar("symbol", { length: 10 }).notNull(), // "KSh", "US$", "€", "RWF", "UGX"
    decimalPlaces: integer("decimal_places").default(2).notNull(), // 2 for KES/USD, 0 for RWF/UGX
    isMajorTradingCurrency: boolean("is_major_trading_currency").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("currencies_code_idx").on(table.code),
  ]
);

// 2. Currency Exchange Rates (Point-in-Time FX Matrix)
export const currencyExchangeRates = pgTable(
  "currency_exchange_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // NULL = Global default market feed
    
    baseCurrency: varchar("base_currency", { length: 3 }).notNull(), // e.g. "USD"
    targetCurrency: varchar("target_currency", { length: 3 }).notNull(), // e.g. "KES", "UGX", "TZS", "RWF", "EUR"
    
    rate: numeric("rate", { precision: 16, scale: 6 }).notNull(), // e.g. 1 USD = 129.500000 KES
    inverseRate: numeric("inverse_rate", { precision: 16, scale: 6 }).notNull(), // e.g. 1 KES = 0.007722 USD
    
    rateType: varchar("rate_type", { length: 50 }).default("corporate_monthly").notNull(), // 'spot', 'corporate_monthly', 'budget_rate'
    effectiveDate: date("effective_date").notNull(),
    
    source: varchar("source", { length: 100 }).default("Central Bank").notNull(), // 'Central Bank of Kenya', 'Bank of Uganda', 'OANDA', 'European Central Bank'
    isLocked: boolean("is_locked").default(false).notNull(), // Locked rates for audited payroll periods
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("fx_rates_tenant_id_idx").on(table.tenantId),
    index("fx_rates_pair_date_idx").on(table.baseCurrency, table.targetCurrency, table.effectiveDate),
    uniqueIndex("fx_rates_unique_rate_idx").on(
      table.baseCurrency,
      table.targetCurrency,
      table.rateType,
      table.effectiveDate
    ),
  ]
);
