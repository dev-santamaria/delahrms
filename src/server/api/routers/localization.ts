/**
 * =========================================================================================
 * MULTI-CURRENCY FX RATES & PAN-AFRICAN LOCALIZATION ROUTER
 * =========================================================================================
 * 1. ISO currencies catalog (KES, UGX, TZS, RWF, ZAR, ZMW, NGN, USD, EUR, GBP)
 * 2. Daily spot & historical exchange rates with central bank sources (CBK, BoU, SARB)
 * 3. Dynamic multilingual entity translations (Kiswahili, French, Arabic, Portuguese)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import { currencies, currencyExchangeRates } from "@/db/schema/currencies-and-fx";
import { entityTranslations } from "@/db/schema/localization";
import { eq } from "drizzle-orm";

export const localizationRouter = new Hono<AppEnv>();

// Zod Schemas
const RegisterCurrencySchema = z.object({
  code: z.string().length(3),
  name: z.string().min(2),
  symbol: z.string().min(1).max(10),
  decimalPlaces: z.number().int().min(0).max(4).default(2),
  isBaseCurrency: z.boolean().default(false),
});

const RecordFxRateSchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  rate: z.number().positive(),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rateSource: z.enum(["central_bank", "commercial_bank", "manual_spot", "ecb"]).default("central_bank"),
});

const ConvertFxSchema = z.object({
  amount: z.number().positive(),
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
});

const UpsertTranslationSchema = z.object({
  entityType: z.string().min(2),
  entityId: z.string().min(2),
  fieldName: z.string().min(2),
  languageCode: z.enum(["sw", "fr", "ar", "pt", "en", "es"]),
  translation: z.string().min(1),
});

// Seed Supported Currencies
const memoryCurrencies: any[] = [
  { id: "curr-kes", code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimalPlaces: 2, isBaseCurrency: true, isActive: true },
  { id: "curr-usd", code: "USD", name: "United States Dollar", symbol: "$", decimalPlaces: 2, isBaseCurrency: false, isActive: true },
  { id: "curr-ugx", code: "UGX", name: "Ugandan Shilling", symbol: "USh", decimalPlaces: 0, isBaseCurrency: false, isActive: true },
  { id: "curr-tzs", code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", decimalPlaces: 0, isBaseCurrency: false, isActive: true },
  { id: "curr-zar", code: "ZAR", name: "South African Rand", symbol: "R", decimalPlaces: 2, isBaseCurrency: false, isActive: true },
  { id: "curr-rwf", code: "RWF", name: "Rwandan Franc", symbol: "FRw", decimalPlaces: 0, isBaseCurrency: false, isActive: true },
];

// Seed Daily Spot FX Rates (Base: USD / KES)
const memoryFxRates: any[] = [
  { id: "fx-usd-kes", fromCurrency: "USD", toCurrency: "KES", rate: 129.50, effectiveDate: "2026-09-17", rateSource: "central_bank" },
  { id: "fx-kes-usd", fromCurrency: "KES", toCurrency: "USD", rate: 0.007722, effectiveDate: "2026-09-17", rateSource: "central_bank" },
  { id: "fx-usd-ugx", fromCurrency: "USD", toCurrency: "UGX", rate: 3720.0, effectiveDate: "2026-09-17", rateSource: "central_bank" },
  { id: "fx-usd-tzs", fromCurrency: "USD", toCurrency: "TZS", rate: 2610.0, effectiveDate: "2026-09-17", rateSource: "central_bank" },
  { id: "fx-usd-zar", fromCurrency: "USD", toCurrency: "ZAR", rate: 17.85, effectiveDate: "2026-09-17", rateSource: "central_bank" },
];

// Seed Multilingual Entity Translations
const memoryTranslations: any[] = [
  {
    id: "trans-sw-01",
    entityType: "leave_type",
    entityId: "lt-annual",
    fieldName: "name",
    languageCode: "sw",
    translation: "Likizo ya Mwaka",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "trans-sw-02",
    entityType: "job_title",
    entityId: "desig-plant-mgr",
    fieldName: "title",
    languageCode: "sw",
    translation: "Meneja wa Kiwanda",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "trans-fr-01",
    entityType: "policy_document",
    entityId: "pol-code-of-conduct",
    fieldName: "title",
    languageCode: "fr",
    translation: "Code de Conduite et Éthique des Affaires",
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

// 1. GET /currencies - List supported currencies
localizationRouter.get("/currencies", async (c) => {
  return c.json({
    success: true,
    count: memoryCurrencies.length,
    data: memoryCurrencies,
  });
});

// 2. POST /currencies - Register currency
localizationRouter.post("/currencies", zValidator("json", RegisterCurrencySchema), async (c) => {
  const body = c.req.valid("json");
  const newCurr = {
    id: `curr-${body.code.toLowerCase()}`,
    ...body,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  memoryCurrencies.push(newCurr);

  return c.json({ success: true, message: `Currency ${body.code} registered`, data: newCurr }, 201);
});

// 3. GET /fx-rates - Current exchange rates
localizationRouter.get("/fx-rates", async (c) => {
  const from = c.req.query("fromCurrency");
  const to = c.req.query("toCurrency");

  let filtered = [...memoryFxRates];
  if (from) filtered = filtered.filter((r) => r.fromCurrency === from);
  if (to) filtered = filtered.filter((r) => r.toCurrency === to);

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 4. POST /fx-rates - Record exchange rate
localizationRouter.post("/fx-rates", zValidator("json", RecordFxRateSchema), async (c) => {
  const body = c.req.valid("json");
  const newRate = {
    id: `fx-${body.fromCurrency.toLowerCase()}-${body.toCurrency.toLowerCase()}-${Date.now().toString().slice(-4)}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  memoryFxRates.unshift(newRate);

  return c.json({ success: true, message: `FX rate recorded: 1 ${body.fromCurrency} = ${body.rate} ${body.toCurrency}`, data: newRate }, 201);
});

// 5. POST /fx-rates/convert - Spot conversion calculation
localizationRouter.post("/fx-rates/convert", zValidator("json", ConvertFxSchema), async (c) => {
  const { amount, fromCurrency, toCurrency } = c.req.valid("json");

  if (fromCurrency === toCurrency) {
    return c.json({
      success: true,
      convertedAmount: amount,
      rate: 1.0,
      fromCurrency,
      toCurrency,
    });
  }

  // Find direct rate
  let directRate = memoryFxRates.find((r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency);
  let rate = directRate?.rate;

  if (!rate) {
    // Check inverse rate
    const invRate = memoryFxRates.find((r) => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency);
    if (invRate) {
      rate = 1 / invRate.rate;
    } else {
      // Triangulate via USD
      const fromUsd = memoryFxRates.find((r) => r.fromCurrency === "USD" && r.toCurrency === fromCurrency)?.rate;
      const toUsd = memoryFxRates.find((r) => r.fromCurrency === "USD" && r.toCurrency === toCurrency)?.rate;
      if (fromUsd && toUsd) {
        rate = toUsd / fromUsd;
      }
    }
  }

  if (!rate) {
    return c.json({ success: false, error: `No exchange rate available from ${fromCurrency} to ${toCurrency}` }, 400);
  }

  const convertedAmount = Number((amount * rate).toFixed(2));

  return c.json({
    success: true,
    amount,
    fromCurrency,
    toCurrency,
    rate: Number(rate.toFixed(6)),
    convertedAmount,
  });
});

// Alias: POST /convert - Direct spot conversion calculation
localizationRouter.post("/convert", zValidator("json", ConvertFxSchema), async (c) => {
  const { amount, fromCurrency, toCurrency } = c.req.valid("json");

  if (fromCurrency === toCurrency) {
    return c.json({
      success: true,
      convertedAmount: amount,
      rate: 1.0,
      fromCurrency,
      toCurrency,
    });
  }

  let directRate = memoryFxRates.find((r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency);
  let rate = directRate?.rate;

  if (!rate) {
    const invRate = memoryFxRates.find((r) => r.fromCurrency === toCurrency && r.toCurrency === fromCurrency);
    if (invRate) {
      rate = 1 / invRate.rate;
    } else {
      const fromUsd = memoryFxRates.find((r) => r.fromCurrency === "USD" && r.toCurrency === fromCurrency)?.rate;
      const toUsd = memoryFxRates.find((r) => r.fromCurrency === "USD" && r.toCurrency === toCurrency)?.rate;
      if (fromUsd && toUsd) {
        rate = toUsd / fromUsd;
      }
    }
  }

  if (!rate) {
    return c.json({ success: false, error: `No exchange rate available from ${fromCurrency} to ${toCurrency}` }, 400);
  }

  const convertedAmount = Number((amount * rate).toFixed(2));

  return c.json({
    success: true,
    amount,
    fromCurrency,
    toCurrency,
    rate: Number(rate.toFixed(6)),
    convertedAmount,
  });
});

// 6. GET /translations - Query entity translations
localizationRouter.get("/translations", async (c) => {
  const languageCode = c.req.query("languageCode");
  const entityType = c.req.query("entityType");
  const entityId = c.req.query("entityId");

  let filtered = [...memoryTranslations];
  if (languageCode) filtered = filtered.filter((t) => t.languageCode === languageCode);
  if (entityType) filtered = filtered.filter((t) => t.entityType === entityType);
  if (entityId) filtered = filtered.filter((t) => t.entityId === entityId);

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 7. POST /translations - Upsert localized translation
localizationRouter.post("/translations", zValidator("json", UpsertTranslationSchema), async (c) => {
  const body = c.req.valid("json");

  const existing = memoryTranslations.find(
    (t) =>
      t.entityType === body.entityType &&
      t.entityId === body.entityId &&
      t.fieldName === body.fieldName &&
      t.languageCode === body.languageCode
  );

  if (existing) {
    existing.translation = body.translation;
    existing.updatedAt = new Date().toISOString();
    return c.json({ success: true, message: "Translation updated", data: existing });
  }

  const newTrans = {
    id: `trans-${body.languageCode}-${Date.now().toString().slice(-4)}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  memoryTranslations.push(newTrans);

  return c.json({ success: true, message: `Translation added for '${body.languageCode}'`, data: newTrans }, 201);
});
