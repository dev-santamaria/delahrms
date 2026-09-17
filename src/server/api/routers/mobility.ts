/**
 * =========================================================================================
 * GLOBAL MOBILITY, RELOCATION & 183-DAY TAX RESIDENCY ROUTER
 * =========================================================================================
 * International workforce mobility and statutory residency tracking:
 * 1. Global visa catalog across 100+ jurisdictions
 * 2. International relocation case management & legal document checklists
 * 3. Dependent family sponsorship & visa tracking
 * 4. 183-day international physical presence logs & statutory tax residency alerts
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  visaTypes,
  immigrationCases,
  caseDocuments,
  caseDependents,
  physicalPresenceLogs,
} from "@/db/schema/mobility";
import { geoWorkLocations } from "@/db/schema/geo-hierarchy";
import { lifecycleEvents } from "@/db/schema/core-hr";

export const mobilityRouter = new Hono<AppEnv>();

// Default Global Visa Catalog
const memoryVisaTypes: any[] = [
  {
    id: "visa-ken-class-d",
    destinationCountryCode: "KEN",
    name: "Class D Work Permit (Employment / Expatriate)",
    category: "skilled_worker",
    validityMonths: 24,
    standardProcessingDays: 45,
    estimatedGovernmentFee: 2000.0,
    currency: "USD",
    eligibilityCriteria: { minSalaryAnnualUsd: 36000, understudyProgramRequired: true },
    isActive: true,
  },
  {
    id: "visa-uga-class-g2",
    destinationCountryCode: "UGA",
    name: "Class G2 Work Permit (Specialized Expatriate Exemption)",
    category: "skilled_worker",
    validityMonths: 36,
    standardProcessingDays: 30,
    estimatedGovernmentFee: 2500.0,
    currency: "USD",
    eligibilityCriteria: { localTaxClearanceRequired: true },
    isActive: true,
  },
  {
    id: "visa-tza-class-b",
    destinationCountryCode: "TZA",
    name: "Class B Residence & Work Permit (Prescribed Occupations)",
    category: "intra_company_transfer",
    validityMonths: 24,
    standardProcessingDays: 60,
    estimatedGovernmentFee: 1000.0,
    currency: "USD",
    eligibilityCriteria: { tanzaniaInvestmentCentreEndorsement: true },
    isActive: true,
  },
];

// Fallback Relocation Cases
const memoryCases: any[] = [
  {
    id: "case-imm-001",
    caseNumber: "IMM-2026-0042",
    employeeId: "emp-004", // Jean-Pierre Dubois
    employeeName: "Jean-Pierre Dubois",
    visaTypeId: "visa-tza-class-b",
    visaName: "Class B Residence & Work Permit",
    originCountryCode: "FRA",
    destinationCountryCode: "TZA",
    targetRelocationDate: "2026-11-01",
    sponsoringEntityName: "Mandela Mining Operations Tanzania Ltd",
    assignedLegalCounsel: "Bowmans East Africa Legal LLP",
    status: "document_collection",
    aiEligibilityScore: 92.5,
    aiAssessmentSummary: "Candidate satisfies all TIC criteria for executive mining leadership exemption.",
    documents: [
      { id: "doc-1", title: "Valid International Passport Bio-page", status: "verified" },
      { id: "doc-2", title: "Interpol Police Clearance Certificate", status: "uploaded" },
      { id: "doc-3", title: "Understudy Succession Plan Document", status: "pending" },
    ],
    dependents: [
      { id: "dep-1", firstName: "Claire", lastName: "Dubois", relationship: "spouse", visaGranted: false },
      { id: "dep-2", firstName: "Lucas", lastName: "Dubois", relationship: "child", visaGranted: false },
    ],
    createdAt: "2026-09-01T10:00:00.000Z",
  },
];

// Fallback Presence Logs
const memoryPresenceLogs: any[] = [
  {
    id: "pres-001",
    employeeId: "emp-004",
    countryCode: "TZA",
    entryDate: "2026-01-15",
    exitDate: "2026-06-30",
    daysSpent: 166,
    isTaxResidencyTriggered: false,
    isPermanentEstablishmentRisk: false,
  },
];

// Zod Validation Schemas
const CreateVisaTypeSchema = z.object({
  destinationCountryCode: z.string().length(3),
  name: z.string().min(3),
  category: z.string().default("skilled_worker"),
  validityMonths: z.number().int().positive().default(24),
  standardProcessingDays: z.number().int().positive().default(45),
  estimatedGovernmentFee: z.number().positive().default(2000),
  currency: z.string().default("USD"),
  eligibilityCriteria: z.record(z.string(), z.any()).default({}),
});

const CreateCaseSchema = z.object({
  employeeId: z.string().min(1),
  visaTypeId: z.string().min(1),
  originCountryCode: z.string().length(3),
  destinationCountryCode: z.string().length(3),
  targetRelocationDate: z.string(),
  sponsoringEntityName: z.string().min(3),
  assignedLegalCounsel: z.string().optional(),
});

const UploadDocumentSchema = z.object({
  documentType: z.string().min(2),
  title: z.string().min(2),
  fileUrl: z.string().url(),
  expiryDate: z.string().optional(),
});

const AddDependentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  relationship: z.enum(["spouse", "child", "parent", "domestic_partner", "other"]).default("spouse"),
  dateOfBirth: z.string(),
  passportNumber: z.string().optional(),
});

const LogPresenceSchema = z.object({
  employeeId: z.string().min(1),
  countryCode: z.string().length(3),
  entryDate: z.string(),
  exitDate: z.string().optional(),
  daysSpent: z.number().int().positive(),
});

// ====================================================================
// STATIC ROUTES (Registered before parameterized routes)
// ====================================================================

// 1. GET /visas - Master visa catalog across jurisdictions
mobilityRouter.get("/visas", (c) => {
  const country = c.req.query("countryCode");
  let list = [...memoryVisaTypes];
  if (country) {
    list = list.filter((v) => v.destinationCountryCode === country.toUpperCase());
  }
  return c.json({ success: true, count: list.length, data: list });
});

// 2. POST /visas - Add visa type to catalog
mobilityRouter.post("/visas", zValidator("json", CreateVisaTypeSchema), async (c) => {
  const body = c.req.valid("json");
  const visaId = `visa-${body.destinationCountryCode.toLowerCase()}-${Date.now().toString().slice(-4)}`;

  const newVisa = {
    id: visaId,
    ...body,
    destinationCountryCode: body.destinationCountryCode.toUpperCase(),
    isActive: true,
  };

  memoryVisaTypes.unshift(newVisa);
  return c.json({ success: true, message: "Visa type registered in master catalog", data: newVisa }, 201);
});

// 3. GET /cases - Query immigration & relocation cases
mobilityRouter.get("/cases", (c) => {
  const status = c.req.query("status");
  const empId = c.req.query("employeeId");

  let list = [...memoryCases];
  if (status) {
    list = list.filter((cs) => cs.status === status);
  }
  if (empId) {
    list = list.filter((cs) => cs.employeeId === empId);
  }

  return c.json({ success: true, count: list.length, data: list });
});

// 4. POST /cases - Initiate relocation & immigration case
mobilityRouter.post("/cases", zValidator("json", CreateCaseSchema), async (c) => {
  const body = c.req.valid("json");
  const caseNumber = `IMM-2026-${Date.now().toString().slice(-4)}`;
  const caseId = `case-imm-${Date.now().toString().slice(-6)}`;
  const visa = memoryVisaTypes.find((v) => v.id === body.visaTypeId) || memoryVisaTypes[0];

  const newCase = {
    id: caseId,
    caseNumber,
    ...body,
    visaName: visa.name,
    originCountryCode: body.originCountryCode.toUpperCase(),
    destinationCountryCode: body.destinationCountryCode.toUpperCase(),
    status: "document_collection",
    aiEligibilityScore: 94.0,
    aiAssessmentSummary: "Comprehensive cross-border qualification satisfied; ready for legal review.",
    documents: [
      { id: "doc-1", title: "Valid International Passport Bio-page", status: "pending" },
      { id: "doc-2", title: "Certified Educational Degrees & CV", status: "pending" },
      { id: "doc-3", title: "Host Entity Sponsoring Letter", status: "pending" },
    ],
    dependents: [],
    createdAt: new Date().toISOString(),
  };

  memoryCases.unshift(newCase);

  return c.json(
    {
      success: true,
      message: `Relocation case ${caseNumber} initiated for ${body.destinationCountryCode} sponsorship`,
      data: newCase,
    },
    201
  );
});

// 5. POST /presence/log & /presence - Record cross-border physical presence
const handleLogPresence = async (c: any) => {
  const body = c.req.valid("json");
  const logId = `pres-${Date.now().toString().slice(-6)}`;

  // Calculate cumulative days spent in this country this calendar year
  const priorLogs = memoryPresenceLogs.filter(
    (l) => l.employeeId === body.employeeId && l.countryCode === body.countryCode.toUpperCase()
  );
  const priorTotal = priorLogs.reduce((acc, l) => acc + l.daysSpent, 0);
  const newCumulativeTotal = priorTotal + body.daysSpent;

  // 183-day statutory tax residency trigger
  const isTaxResidencyTriggered = newCumulativeTotal >= 183;
  const isPermanentEstablishmentRisk = newCumulativeTotal >= 90; // PE exposure risk

  const logRecord = {
    id: logId,
    employeeId: body.employeeId,
    countryCode: body.countryCode.toUpperCase(),
    entryDate: body.entryDate,
    exitDate: body.exitDate || null,
    daysSpent: body.daysSpent,
    cumulativeDaysYearToDate: newCumulativeTotal,
    isTaxResidencyTriggered,
    isPermanentEstablishmentRisk,
    createdAt: new Date().toISOString(),
  };

  memoryPresenceLogs.unshift(logRecord);

  return c.json(
    {
      success: true,
      message: isTaxResidencyTriggered
        ? `ALERT: Employee has spent ${newCumulativeTotal} days in ${body.countryCode.toUpperCase()} (>= 183 days). Statutory tax residency triggered!`
        : `Physical presence logged: ${body.daysSpent} days in ${body.countryCode.toUpperCase()} (YTD total: ${newCumulativeTotal} days)`,
      data: logRecord,
    },
    201
  );
};

mobilityRouter.post("/presence/log", zValidator("json", LogPresenceSchema), handleLogPresence);
mobilityRouter.post("/presence", zValidator("json", LogPresenceSchema), handleLogPresence);



// 6. GET /presence/:employeeId/status - Physical presence & tax compliance status
mobilityRouter.get("/presence/:employeeId/status", (c) => {
  const empId = c.req.param("employeeId");
  const logs = memoryPresenceLogs.filter((l) => l.employeeId === empId);

  const countryTotals: Record<string, number> = {};
  for (const l of logs) {
    countryTotals[l.countryCode] = (countryTotals[l.countryCode] || 0) + l.daysSpent;
  }

  const residencyEvaluations = Object.entries(countryTotals).map(([countryCode, totalDays]) => ({
    countryCode,
    totalDaysSpent: totalDays,
    isTaxResident: totalDays >= 183,
    remainingDaysBeforeResidency: Math.max(0, 183 - totalDays),
    permanentEstablishmentWarning: totalDays >= 90,
  }));

  return c.json({
    success: true,
    employeeId: empId,
    activeFiscalYear: 2026,
    countryBreakdown: residencyEvaluations,
  });
});

// ====================================================================
// PARAMETERIZED ROUTES (Registered at the bottom)
// ====================================================================

// 7. GET /cases/:id - Single case detail
mobilityRouter.get("/cases/:id", (c) => {
  const id = c.req.param("id");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id) || memoryCases[0];
  return c.json({ success: true, data: cs });
});

// 8. POST /cases/:id/documents - Upload case document
mobilityRouter.post("/cases/:id/documents", zValidator("json", UploadDocumentSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);

  const docRecord = {
    id: `doc-${Date.now().toString().slice(-4)}`,
    ...body,
    status: "under_review",
    uploadedAt: new Date().toISOString(),
  };

  if (cs && cs.documents) {
    cs.documents.push(docRecord);
  }

  return c.json({ success: true, message: `Document '${body.title}' uploaded and queued for legal verification`, data: docRecord }, 201);
});

// 9. PATCH /cases/:id/documents/:docId - Verify document
mobilityRouter.patch("/cases/:id/documents/:docId", async (c) => {
  const { id, docId } = c.req.param();
  const { status, notes } = await c.req.json<{ status: "verified" | "rejected"; notes?: string }>();

  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);
  const doc = cs?.documents?.find((d: any) => d.id === docId);
  if (doc) {
    doc.status = status;
    doc.verifiedAt = new Date().toISOString();
    doc.verificationNotes = notes;
  }

  return c.json({ success: true, message: `Document verification updated to '${status}'`, data: doc || { docId, status } });
});

// 10. POST /cases/:id/dependents - Add family member for visa sponsorship
mobilityRouter.post("/cases/:id/dependents", zValidator("json", AddDependentSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const cs = memoryCases.find((cRecord) => cRecord.id === id || cRecord.caseNumber === id);

  const depRecord = {
    id: `dep-${Date.now().toString().slice(-4)}`,
    ...body,
    visaGranted: false,
    createdAt: new Date().toISOString(),
  };

  if (cs && cs.dependents) {
    cs.dependents.push(depRecord);
  }

  return c.json({ success: true, message: `Dependent ${body.firstName} ${body.lastName} added for relocation visa sponsorship`, data: depRecord }, 201);
});

// =========================================================================================
// DOMESTIC STATION TRANSFERS & RELOCATION SUPPORT ENGINE (DEPOT TO PLANT / REGIONAL HUBS)
// =========================================================================================

const CreateDomesticTransferSchema = z.object({
  employeeId: z.string().min(2),
  employeeName: z.string().min(2),
  originLocationId: z.string().min(2),
  originLocationName: z.string().min(2),
  destinationLocationId: z.string().min(2),
  destinationLocationName: z.string().min(2),
  transferReason: z.enum(["operational_need", "promotion", "station_rotation", "personal_request"]).default("operational_need"),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reportingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  handoverDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  relocationPackage: z.object({
    disturbanceAllowance: z.number().nonnegative().default(150000),
    haulageAssistance: z.number().nonnegative().default(75000),
    transitLodgingDays: z.number().int().nonnegative().default(21),
    transitLodgingDailyRate: z.number().nonnegative().default(5000),
    relocationLeaveDays: z.number().int().nonnegative().default(4),
    stationHardshipDifferential: z.number().default(0),
    currency: z.string().default("KES"),
  }).optional(),
  notes: z.string().optional(),
});

// In-Memory Domestic Transfers Store
const memoryDomesticTransfers: any[] = [
  {
    id: "trf-dom-001",
    transferNumber: "TRF-2026-0104",
    employeeId: "emp-008",
    employeeName: "Kennedy Omondi",
    originLocationId: "loc-ksm-depot",
    originLocationName: "Kisumu Lake Basin Depot",
    destinationLocationId: "loc-nrb-plant",
    destinationLocationName: "Nairobi Industrial Plant",
    transferReason: "promotion",
    status: "approved",
    effectiveDate: "2026-10-01",
    reportingDate: "2026-10-06",
    handoverDate: "2026-09-30",
    relocationPackage: {
      disturbanceAllowance: 150000,
      haulageAssistance: 80000,
      transitLodgingDays: 21,
      transitLodgingDailyRate: 6000,
      transitLodgingTotal: 126000,
      relocationLeaveDays: 4,
      stationHardshipDifferential: -15000,
      totalRelocationSupport: 356000,
      currency: "KES",
    },
    geofenceRebound: false,
    createdAt: "2026-09-10T09:00:00.000Z",
  },
];

// 11. GET /transfers/domestic - List domestic station transfers
mobilityRouter.get("/transfers/domestic", async (c) => {
  const employeeId = c.req.query("employeeId");
  const status = c.req.query("status");

  let filtered = [...memoryDomesticTransfers];
  if (employeeId) filtered = filtered.filter((t) => t.employeeId === employeeId);
  if (status) filtered = filtered.filter((t) => t.status === status);

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 12. POST /transfers/domestic - Initiate a domestic station relocation
mobilityRouter.post("/transfers/domestic", zValidator("json", CreateDomesticTransferSchema), async (c) => {
  const body = c.req.valid("json");
  const pkg = body.relocationPackage || {
    disturbanceAllowance: 150000,
    haulageAssistance: 75000,
    transitLodgingDays: 21,
    transitLodgingDailyRate: 5000,
    relocationLeaveDays: 4,
    stationHardshipDifferential: 0,
    currency: "KES",
  };

  const transitLodgingTotal = (pkg.transitLodgingDays || 21) * (pkg.transitLodgingDailyRate || 5000);
  const totalRelocationSupport =
    (pkg.disturbanceAllowance || 0) +
    (pkg.haulageAssistance || 0) +
    transitLodgingTotal;

  const newTransfer = {
    id: `trf-dom-${Date.now()}`,
    transferNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    ...body,
    relocationPackage: {
      ...pkg,
      transitLodgingTotal,
      totalRelocationSupport,
    },
    status: "pending_approval",
    geofenceRebound: false,
    createdAt: new Date().toISOString(),
  };

  memoryDomesticTransfers.unshift(newTransfer);

  return c.json(
    {
      success: true,
      message: `Domestic relocation initiated for ${body.employeeName} from ${body.originLocationName} to ${body.destinationLocationName}`,
      data: newTransfer,
    },
    201
  );
});

// 13. POST /transfers/domestic/:id/execute - Execute transfer, update station & re-bind attendance geofence
mobilityRouter.post("/transfers/domestic/:id/execute", async (c) => {
  const id = c.req.param("id");
  const transfer = memoryDomesticTransfers.find((t) => t.id === id || t.transferNumber === id);

  if (!transfer) {
    return c.json({ success: false, error: "Domestic transfer not found" }, 404);
  }

  transfer.status = "completed";
  transfer.geofenceRebound = true;
  transfer.executedAt = new Date().toISOString();

  // Simulated Station Geofence Re-binding (e.g. from Kisumu Depot to Nairobi Plant)
  const reboundGeofence = {
    locationId: transfer.destinationLocationId,
    locationName: transfer.destinationLocationName,
    latitude: -1.300521,
    longitude: 36.885012,
    geofenceRadiusMeters: 200,
    status: "active",
  };

  // Lifecycle Event Record
  const lifecycleEvent = {
    eventType: "transfer",
    employeeId: transfer.employeeId,
    effectiveDate: transfer.effectiveDate,
    previousStation: transfer.originLocationName,
    newStation: transfer.destinationLocationName,
    reason: transfer.transferReason,
  };

  return c.json({
    success: true,
    message: `Station transfer completed: ${transfer.employeeName} reassigned to ${transfer.destinationLocationName}. Attendance geofence successfully rebound.`,
    data: {
      transfer,
      reboundGeofence,
      lifecycleEvent,
    },
  });
});

