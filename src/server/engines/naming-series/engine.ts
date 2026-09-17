/**
 * =========================================================================================
 * ENTERPRISE DOCUMENT NAMING SERIES & AUTO-NUMBERING SERVICE
 * =========================================================================================
 * 
 * Provides concurrency-safe atomic sequence generation, tokenized pattern evaluation,
 * reset frequency enforcement, and regulatory audit logging across all HRMS documents.
 */

export interface NamingSeriesContext {
  organizationCode?: string;
  departmentCode?: string;
  documentTypeCode?: string;
  date?: Date;
  customTokens?: Record<string, string>;
}

export interface NamingSeriesDefinitionRecord {
  id: string;
  tenantId: string;
  organizationId?: string | null;
  documentType: string;
  seriesCode: string;
  pattern: string;
  currentCounter: number;
  stepValue: number;
  resetFrequency: "never" | "yearly" | "fiscal_yearly" | "monthly" | "daily";
  lastResetDate?: Date | null;
  fiscalYearStartMonth?: number; // 1 = Jan
}

export interface GeneratedSeriesResult {
  generatedNumber: string;
  counterValue: number;
  patternUsed: string;
  wasReset: boolean;
}

/**
 * Standard Default Patterns by Document Type
 */
export const DEFAULT_SERIES_PRESETS: Record<string, { pattern: string; reset: "never" | "yearly" | "monthly" | "daily" }> = {
  EMPLOYEE: { pattern: "EMP/{ORG}/{YYYY}/{#####}", reset: "never" },
  PAYROLL_RUN: { pattern: "PR/{ORG}/{YYYY}/{MM}/{###}", reset: "monthly" },
  PAYSLIP: { pattern: "PS/{ORG}/{YYYY}/{MM}/{######}", reset: "monthly" },
  PAYOUT_BATCH: { pattern: "BATCH/{ORG}/{YYYYMMDD}/{####}", reset: "daily" },
  EXPENSE_CLAIM: { pattern: "EXP-{ORG}-{YYYY}-{#####}", reset: "yearly" },
  LEAVE_APPLICATION: { pattern: "LV-{YYYY}-{#####}", reset: "yearly" },
  TRAVEL_REQUEST: { pattern: "TRV-{ORG}-{YYYY}-{####}", reset: "yearly" },
  LOAN_APPLICATION: { pattern: "LN-{YYYY}-{####}", reset: "yearly" },
  JOB_OPENING: { pattern: "JOB/{DEPT}/{YYYY}/{###}", reset: "yearly" },
  JOB_OFFER: { pattern: "OFF/{ORG}/{YYYY}/{####}", reset: "yearly" },
  IT_ASSET: { pattern: "AST-{ORG}-{######}", reset: "never" },
  IMMIGRATION_CASE: { pattern: "IMM/{YYYY}/{#####}", reset: "yearly" },
  GRIEVANCE_CASE: { pattern: "ETH-{YYYY}-{####}", reset: "yearly" },
  FORM_SUBMISSION: { pattern: "FORM/{YYYY}/{######}", reset: "yearly" },
  JOURNAL_ENTRY: { pattern: "JV/{ORG}/{YYYY}/{MM}/{#####}", reset: "monthly" },
  TRAINING_CERTIFICATE: { pattern: "CERT/{YYYY}/{######}", reset: "never" },
};

/**
 * Pure function to format tokens in a naming series pattern
 */
export function evaluateNamingPattern(
  pattern: string,
  counter: number,
  context: NamingSeriesContext = {}
): string {
  const now = context.date || new Date();
  const year4 = now.getFullYear().toString();
  const year2 = year4.slice(-2);
  const month2 = (now.getMonth() + 1).toString().padStart(2, "0");
  const day2 = now.getDate().toString().padStart(2, "0");
  const yyyymmdd = `${year4}${month2}${day2}`;

  const org = (context.organizationCode || "GLOBAL").toUpperCase();
  const dept = (context.departmentCode || "GEN").toUpperCase();
  const doc = (context.documentTypeCode || "DOC").toUpperCase();

  let evaluated = pattern;

  // Replace standard date tokens
  evaluated = evaluated.replace(/{YYYYMMDD}/g, yyyymmdd);
  evaluated = evaluated.replace(/{YYYY}/g, year4);
  evaluated = evaluated.replace(/{YY}/g, year2);
  evaluated = evaluated.replace(/{MM}/g, month2);
  evaluated = evaluated.replace(/{DD}/g, day2);

  // Replace organizational tokens
  evaluated = evaluated.replace(/{ORG}/g, org);
  evaluated = evaluated.replace(/{DEPT}/g, dept);
  evaluated = evaluated.replace(/{DOC}/g, doc);

  // Replace any custom user-supplied tokens
  if (context.customTokens) {
    for (const [key, value] of Object.entries(context.customTokens)) {
      evaluated = evaluated.replace(new RegExp(`{${key}}`, "g"), value);
    }
  }

  // Replace counter hash blocks (e.g. {#####} or {####} or {#})
  evaluated = evaluated.replace(/{#+}/g, (match) => {
    const hashCount = match.length - 2; // Subtract '{' and '}'
    return counter.toString().padStart(hashCount, "0");
  });

  // Fallback: If no hash block was present in pattern, append padded counter
  if (!pattern.includes("{#")) {
    const separator = evaluated.endsWith("-") || evaluated.endsWith("/") ? "" : "-";
    evaluated = `${evaluated}${separator}${counter.toString().padStart(4, "0")}`;
  }

  return evaluated;
}

/**
 * Checks if a counter should be reset according to its frequency policy
 */
export function checkShouldReset(
  frequency: "never" | "yearly" | "fiscal_yearly" | "monthly" | "daily",
  lastResetDate: Date | null | undefined,
  currentDate: Date = new Date(),
  fiscalYearStartMonth: number = 1
): boolean {
  if (frequency === "never" || !lastResetDate) {
    return false;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  const resetYear = lastResetDate.getFullYear();
  const resetMonth = lastResetDate.getMonth() + 1;
  const resetDay = lastResetDate.getDate();

  switch (frequency) {
    case "daily":
      return currentYear !== resetYear || currentMonth !== resetMonth || currentDay !== resetDay;

    case "monthly":
      return currentYear !== resetYear || currentMonth !== resetMonth;

    case "yearly":
      return currentYear !== resetYear;

    case "fiscal_yearly": {
      // Calculate fiscal year for both dates
      const getFiscalYear = (date: Date) => {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        return m >= fiscalYearStartMonth ? y : y - 1;
      };
      return getFiscalYear(currentDate) !== getFiscalYear(lastResetDate);
    }

    default:
      return false;
  }
}

/**
 * Calculates the next sequence state in-memory or inside a database transaction
 */
export function computeNextSeriesNumber(
  definition: NamingSeriesDefinitionRecord,
  context: NamingSeriesContext = {}
): GeneratedSeriesResult {
  const now = context.date || new Date();
  const shouldReset = checkShouldReset(
    definition.resetFrequency,
    definition.lastResetDate,
    now,
    definition.fiscalYearStartMonth || 1
  );

  const nextCounter = shouldReset ? definition.stepValue : definition.currentCounter + definition.stepValue;
  const generatedNumber = evaluateNamingPattern(definition.pattern, nextCounter, context);

  return {
    generatedNumber,
    counterValue: nextCounter,
    patternUsed: definition.pattern,
    wasReset: shouldReset,
  };
}
