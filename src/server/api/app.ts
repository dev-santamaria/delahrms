/**
 * =========================================================================================
 * ZURI HRMS UNIVERSAL ENTERPRISE API (HONO BACKEND)
 * =========================================================================================
 * Production-ready backend architecture supporting:
 * - Multi-Country Payroll Engine (Kenya, Uganda, Tanzania, South Africa, Zambia, UK, US, Nigeria)
 * - Scalable Cooperatives / SACCOs (Multi-product check-offs & 1/3 net pay rule safeguard)
 * - Zero-Hardcoding Generic Pension Administration (Octagon, ICEA Lion, Zamara, internal trusts)
 * - Fleet Vehicles & KRA Section 5(4) Car Benefit Tax
 * - Job Grades & Health Insurance Benefit Eligibility Matrix
 * - Universal Dynamic Form Builder, Campaigns & Legally Binding SHA-256 E-Signatures
 * - Staff Loans, Advances & Section 12B Fringe Benefit Tax (30% employer liability)
 * - Expatriate Workforce, Work Permits & 183-Day Statutory Tax Residency Rule
 * - Double-Entry Accounting Sub-Ledger & ERP Sync (SAP S/4HANA & ERPNext)
 * =========================================================================================
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AppEnv } from "./types";

// Domain Sub-Routers
import { payrollRouter } from "./routers/payroll";
import { cooperativesRouter } from "./routers/cooperatives";
import { pensionsRouter } from "./routers/pensions";
import { fleetRouter } from "./routers/fleet";
import { jobGradesRouter } from "./routers/job-grades";
import { formsRouter } from "./routers/forms";
import { loansRouter } from "./routers/loans";
import { expatriatesRouter } from "./routers/expatriates";
import { accountingRouter } from "./routers/accounting";
import { employeesRouter } from "./routers/employees";
import { organizationRouter } from "./routers/organization";
import { positionsRouter } from "./routers/positions";
import { attendanceRouter } from "./routers/attendance";
import { leaveRouter } from "./routers/leave";
import { recruitmentRouter } from "./routers/recruitment";
import { performanceRouter } from "./routers/performance";
import { learningRouter } from "./routers/learning";
import { grievancesRouter } from "./routers/grievances";
import { mobilityRouter } from "./routers/mobility";
import { travelRouter } from "./routers/travel";
import { assetsRouter } from "./routers/assets";
import { statutoryRouter } from "./routers/statutory";
import { namingSeriesRouter } from "./routers/naming-series";
import { workflowsRouter } from "./routers/workflows";
import { delegationsRouter } from "./routers/delegations";
import { webhooksRouter } from "./routers/webhooks";
import { notificationsRouter } from "./routers/notifications";
import { auditRouter } from "./routers/audit";
import { documentsRouter } from "./routers/documents";
import { claimsRouter } from "./routers/claims";
import { benefitsRouter } from "./routers/benefits";
import { surveysRouter } from "./routers/surveys";
import { socialRouter } from "./routers/social";
import { geoHierarchyRouter } from "./routers/geo-hierarchy";
import { localizationRouter } from "./routers/localization";
import { calendarsRouter } from "./routers/calendars";
import { integrationsRouter } from "./routers/integrations";
import { saasManagementRouter } from "./routers/saas-management";
import { usersRouter } from "./routers/users";
import { authRouter } from "./routers/auth";

export const app = new Hono<AppEnv>().basePath("/api");

// 1. Global Logging Middleware
app.use("*", logger());

// 2. Global CORS Middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tenant-ID",
      "X-Organization-ID",
      "X-User-ID",
      "X-User-Role",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// 3. Multi-Tenant Context Extraction Middleware
app.use("*", async (c, next) => {
  const tenantId = c.req.header("X-Tenant-ID") || "00000000-0000-0000-0000-000000000001";
  const organizationId = c.req.header("X-Organization-ID");
  const userId = c.req.header("X-User-ID") || "usr-admin-01";
  const userRole = c.req.header("X-User-Role") || "super_admin";

  c.set("tenantId", tenantId);
  if (organizationId) {
    c.set("organizationId", organizationId);
  }
  c.set("userId", userId);
  c.set("userRole", userRole);

  await next();
});

// 4. Root & Health Check Endpoints
app.get("/", (c) => {
  return c.json({
    status: "online",
    name: "Zuri HRMS Universal Enterprise API",
    version: "2.0.0",
    headquarters: "Nairobi, Kenya",
    regionalHubs: ["Kampala (Uganda)", "Dar es Salaam (Tanzania)", "Johannesburg (South Africa)", "Lusaka (Zambia)"],
    documentation: "/api/v1/meta/catalog",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "HRMS Universal Enterprise API",
    version: "2.0.0",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 5. API Catalog & Feature Matrix
app.get("/v1/meta/catalog", (c) => {
  return c.json({
    success: true,
    domains: [
      { prefix: "/api/v1/payroll", description: "Multi-country payroll runs, 1/3 net pay rule, statutory CSV filings" },
      { prefix: "/api/v1/cooperatives", description: "Multi-SACCO onboarding, multi-product catalog & check-off mandates" },
      { prefix: "/api/v1/pensions", description: "Generic retirement schemes (Octagon, ICEA, etc.), AVC & RBA tax caps" },
      { prefix: "/api/v1/fleet", description: "Fleet vehicles, custody assignments & KRA Section 5(4) car benefit tax" },
      { prefix: "/api/v1/job-grades", description: "Job grades (G1-G10) & grade-based health insurance tier matrices" },
      { prefix: "/api/v1/forms", description: "Universal dynamic forms, compliance campaigns & SHA-256 e-signatures" },
      { prefix: "/api/v1/loans", description: "Salary advances, staff loans & Section 12B Fringe Benefit Tax (30%)" },
      { prefix: "/api/v1/expatriates", description: "Foreign nationals, work permits & 183-day statutory tax residency" },
      { prefix: "/api/v1/accounting", description: "Double-entry subledger journal vouchers & SAP/ERPNext integrations" },
      { prefix: "/api/v1/employees", description: "Core HR workforce onboarding, Profile 360, banking rails & lifecycles" },
      { prefix: "/api/v1/organization", description: "Departments, branches with geofencing, designations & org hierarchy" },
      { prefix: "/api/v1/positions", description: "Position management, FTE capacity control & headcount budgets" },
      { prefix: "/api/v1/attendance", description: "Geofenced mobile clock-in/out, timesheets, overtime & 24/7 continuous shifts" },
      { prefix: "/api/v1/leave", description: "Statutory leave accrual, holiday deduction engine, corporate shutdowns & ledger" },
      { prefix: "/api/v1/recruitment", description: "Job requisitions, ATS candidate pipelines, interview scorecards & digital offers" },
      { prefix: "/api/v1/performance", description: "Appraisal cycles, cascading OKRs, Key Results & 360-degree performance reviews" },
      { prefix: "/api/v1/learning", description: "Course catalog, assignments, quiz scoring & automated recertification matrices" },
      { prefix: "/api/v1/grievances", description: "Anonymous whistleblowing vault, severity triaging & confidential investigation threads" },
      { prefix: "/api/v1/mobility", description: "Global mobility, visa catalog, legal document checklists & 183-day tax residency" },
      { prefix: "/api/v1/travel", description: "Pre-trip travel requests, tiered per diem policies, non-payroll advances & reconciliations" },
      { prefix: "/api/v1/assets", description: "IT hardware asset tracking, MDM encryption, custody handovers & SaaS access grants" },
      { prefix: "/api/v1/statutory", description: "Statutory tax filings, KRA PRN e-slips, SHA/NSSF & third-party institutional check-offs" },
      { prefix: "/api/v1/naming-series", description: "Dynamic ERP-style document numbering series, pattern tokenization & counter locks" },
      { prefix: "/api/v1/workflows", description: "Universal multi-tier approval workflow chains, SLA rules & instance lifecycle" },
      { prefix: "/api/v1/delegations", description: "Delegation of authority (DoA), out-of-office manager proxies & financial caps" },
      { prefix: "/api/v1/webhooks", description: "Event-driven outbound webhooks, HMAC-SHA256 signatures, transactional outbox & API keys" },
      { prefix: "/api/v1/notifications", description: "Omni-channel notifications (In-App, Email, SMS, Push), quiet hours & inbox center" },
      { prefix: "/api/v1/audit", description: "SOC 2 / ISO 27001 regulatory audit logs with before/after JSON diffs & custom fields" },
      { prefix: "/api/v1/documents", description: "Employee document vault, expiration alerts & company policy electronic attestations" },
      { prefix: "/api/v1/claims", description: "Non-travel expense claims, itemized receipts & national fiscal regime verification (eTIMS/VFD)" },
      { prefix: "/api/v1/benefits", description: "Flexible health & wellness plans, dependent enrollment & on-demand Earned Wage Access (EWA)" },
      { prefix: "/api/v1/surveys", description: "Workforce culture climate audits, anonymous feedback campaigns & automated eNPS pulse scores" },
      { prefix: "/api/v1/social", description: "In-app team chat channels, universal polymorphic comments & peer recognition kudos wall" },
      { prefix: "/api/v1/geo-hierarchy", description: "Recursive spatial administrative hierarchy (county/district/ward) & physical work locations/depots/plants with GPS geofencing" },
      { prefix: "/api/v1/localization", description: "Multi-currency catalog, central bank spot FX conversion & pan-African multilingual entity translations" },
      { prefix: "/api/v1/calendars", description: "Corporate townhalls & webinars, working calendar week schedules & gazetted national public holidays" },
      { prefix: "/api/v1/integrations", description: "Enterprise ERP connectors (SAP, Dynamics, ERPNext), field mappings, sync jobs & mobile money payment gateways" },
      { prefix: "/api/v1/saas", description: "SaaS multi-tenancy provisioning, client organization onboarding, tiered billing & storage quota telemetry" },
      { prefix: "/api/v1/users", description: "Enterprise team user management, Supabase Auth webhook synchronization & granular RBAC invitations" },
    ],
  });
});

// 6. Mount Domain Sub-Routers
app.route("/v1/payroll", payrollRouter);
app.route("/v1/cooperatives", cooperativesRouter);
app.route("/v1/pensions", pensionsRouter);
app.route("/v1/fleet", fleetRouter);
app.route("/v1/job-grades", jobGradesRouter);
app.route("/v1/forms", formsRouter);
app.route("/v1/loans", loansRouter);
app.route("/v1/expatriates", expatriatesRouter);
app.route("/v1/accounting", accountingRouter);
app.route("/v1/employees", employeesRouter);
app.route("/v1/organization", organizationRouter);
app.route("/v1/positions", positionsRouter);
app.route("/v1/attendance", attendanceRouter);
app.route("/v1/leave", leaveRouter);
app.route("/v1/recruitment", recruitmentRouter);
app.route("/v1/performance", performanceRouter);
app.route("/v1/learning", learningRouter);
app.route("/v1/grievances", grievancesRouter);
app.route("/v1/mobility", mobilityRouter);
app.route("/v1/travel", travelRouter);
app.route("/v1/assets", assetsRouter);
app.route("/v1/statutory", statutoryRouter);
app.route("/v1/naming-series", namingSeriesRouter);
app.route("/v1/workflows", workflowsRouter);
app.route("/v1/delegations", delegationsRouter);
app.route("/v1/webhooks", webhooksRouter);
app.route("/v1/notifications", notificationsRouter);
app.route("/v1/audit", auditRouter);
app.route("/v1/documents", documentsRouter);
app.route("/v1/claims", claimsRouter);
app.route("/v1/benefits", benefitsRouter);
app.route("/v1/surveys", surveysRouter);
app.route("/v1/social", socialRouter);
app.route("/v1/geo-hierarchy", geoHierarchyRouter);
app.route("/v1/localization", localizationRouter);
app.route("/v1/calendars", calendarsRouter);
app.route("/v1/integrations", integrationsRouter);
app.route("/v1/saas", saasManagementRouter);
app.route("/v1/users", usersRouter);
app.route("/v1/auth", authRouter);

// ====================================================================
// AUXILIARY SERVICES (Geo Hierarchy, FX Conversion, Shifts, Travel)
// ====================================================================

// Geographic Hierarchy
app.get("/v1/geo/units", (c) => {
  const units = [
    { id: "geo-1", countryCode: "KEN", countryName: "Kenya", level: 1, divisionType: "county", name: "Nairobi County", code: "KE-47", currency: "KES", timezone: "Africa/Nairobi", minWageMonthly: 18500 },
    { id: "geo-2", countryCode: "KEN", countryName: "Kenya", level: 1, divisionType: "county", name: "Mombasa County", code: "KE-01", currency: "KES", timezone: "Africa/Nairobi", minWageMonthly: 16800 },
    { id: "geo-3", countryCode: "UGA", countryName: "Uganda", level: 1, divisionType: "district", name: "Kampala District", code: "UG-102", currency: "UGX", timezone: "Africa/Kampala", minWageMonthly: 450000 },
    { id: "geo-4", countryCode: "TZA", countryName: "Tanzania", level: 1, divisionType: "region", name: "Dar es Salaam Region", code: "TZ-02", currency: "TZS", timezone: "Africa/Dar_es_Salaam", minWageMonthly: 350000 },
    { id: "geo-5", countryCode: "ZAF", countryName: "South Africa", level: 1, divisionType: "province", name: "Gauteng", code: "ZA-GT", currency: "ZAR", timezone: "Africa/Johannesburg", minWageMonthly: 4500 },
    { id: "geo-6", countryCode: "ZMB", countryName: "Zambia", level: 1, divisionType: "province", name: "Lusaka", code: "ZM-09", currency: "ZMW", timezone: "Africa/Lusaka", minWageMonthly: 2300 },
  ];
  return c.json({ success: true, count: units.length, data: units });
});

// Multi-Currency & FX Triangulation
app.get("/v1/fx/rates", (c) => {
  const rates = [
    { base: "USD", target: "KES", rate: 129.50, effectiveDate: "2026-09-01", source: "Central Bank of Kenya" },
    { base: "USD", target: "UGX", rate: 3720.00, effectiveDate: "2026-09-01", source: "Bank of Uganda" },
    { base: "USD", target: "TZS", rate: 2650.00, effectiveDate: "2026-09-01", source: "Bank of Tanzania" },
    { base: "USD", target: "ZAR", rate: 18.20, effectiveDate: "2026-09-01", source: "South African Reserve Bank" },
    { base: "USD", target: "ZMW", rate: 26.80, effectiveDate: "2026-09-01", source: "Bank of Zambia" },
    { base: "USD", target: "EUR", rate: 0.92, effectiveDate: "2026-09-01", source: "European Central Bank" },
    { base: "USD", target: "GBP", rate: 0.78, effectiveDate: "2026-09-01", source: "Bank of England" },
  ];
  return c.json({ success: true, baseCurrency: "USD", rates });
});

app.post("/v1/fx/convert", async (c) => {
  try {
    const { amount, from, to } = await c.req.json<{ amount: number; from: string; to: string }>();
    const ratesToUSD: Record<string, number> = {
      USD: 1.0,
      KES: 1 / 129.50,
      UGX: 1 / 3720.00,
      TZS: 1 / 2650.00,
      ZAR: 1 / 18.20,
      ZMW: 1 / 26.80,
      EUR: 1 / 0.92,
      GBP: 1 / 0.78,
    };
    const fromRate = ratesToUSD[from.toUpperCase()] || 1.0;
    const toRate = ratesToUSD[to.toUpperCase()] || 1.0;
    const convertedAmount = (amount * fromRate) / toRate;

    return c.json({
      success: true,
      original: { amount, currency: from.toUpperCase() },
      converted: { amount: Math.round(convertedAmount * 100) / 100, currency: to.toUpperCase() },
      triangulationBase: "USD",
    });
  } catch (err: any) {
    return c.json({ error: err.message || "Conversion failed" }, 400);
  }
});

// Continuous Shifts & Mining Roster
app.get("/v1/shifts/patterns", (c) => {
  const patterns = [
    {
      id: "pat-1",
      name: "Continental 24/7 Continuous 3-Shift Pattern",
      code: "SHIFT-CONT-247",
      cycleDays: 28,
      category: "continuous_24_7",
      nightShiftMultiplier: 1.25,
      activeCrewsCount: 4,
    },
    {
      id: "pat-2",
      name: "Mining FIFO 14/14 Continuous Roster",
      code: "SHIFT-FIFO-1414",
      cycleDays: 28,
      category: "mining_fifo",
      hazardAllowanceDailyAmount: 3500,
      activeCrewsCount: 2,
    },
  ];
  return c.json({ success: true, count: patterns.length, data: patterns });
});

// Travel Logistics & Fiscal Receipt Reconcile
app.get("/v1/travel/requests", (c) => {
  const requests = [
    {
      id: "trv-001",
      travelNumber: "TRV-2026-0042",
      employeeName: "Nelson Mandela CP",
      destinationCountry: "Uganda",
      destinationCity: "Kampala",
      departureDate: "2026-10-05",
      returnDate: "2026-10-10",
      totalDays: 5,
      cashAdvanceDisbursed: 1200,
      currency: "USD",
      status: "advance_disbursed",
    },
  ];
  return c.json({ success: true, count: requests.length, data: requests });
});

// Global Error Handler
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal Server Error",
      statusCode: 500,
      path: c.req.path,
    },
    500
  );
});

export default app;
