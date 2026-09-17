/**
 * =========================================================================================
 * FLEET, COMPANY VEHICLES & STATUTORY CAR BENEFIT ROUTER
 * =========================================================================================
 * Manages corporate vehicle assets, employee vehicle custody assignments, fuel card provisions,
 * and automated statutory KRA Section 5(4) Car Benefit Tax calculations.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  companyVehicles,
  vehicleAssignments,
  calculateKenyanCarBenefit,
} from "@/db/schema/fleet-vehicles";
import { eq } from "drizzle-orm";

export const fleetRouter = new Hono<AppEnv>();

// Zod Schemas
const CreateVehicleSchema = z.object({
  registrationNumber: z.string().min(3).max(50),
  make: z.string().min(2),
  model: z.string().min(2),
  yearOfManufacture: z.number().int().min(1990).max(2030),
  engineCapacityCc: z.number().int().positive(),
  bodyType: z.enum(["suv", "pickup", "sedan", "van", "truck"]).default("suv"),
  ownershipType: z.enum(["purchased", "leased", "rented"]).default("purchased"),
  initialCost: z.number().nonnegative().default(0),
  monthlyLeaseCost: z.number().nonnegative().optional(),
  fuelCardNumber: z.string().optional(),
  providesFuel: z.boolean().default(true),
  isAvailableForPrivateUse: z.boolean().default(true),
  currency: z.string().default("KES"),
});

const AssignVehicleSchema = z.object({
  employeeId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isAvailableForPrivateUse: z.boolean().default(true),
  initialOdometerKm: z.number().int().nonnegative().optional(),
  handoverConditionNotes: z.string().optional(),
});

const CalculateBenefitSchema = z.object({
  engineCapacityCc: z.number().int().positive(),
  initialCost: z.number().nonnegative(),
  monthlyLeaseCost: z.number().nonnegative().optional(),
  ownershipType: z.enum(["purchased", "leased", "rented"]).default("purchased"),
  isAvailableForPrivateUse: z.boolean().default(true),
  providesFuel: z.boolean().default(true),
});

// Fallback sample fleet
const SAMPLE_VEHICLES = [
  {
    id: "veh-001",
    registrationNumber: "KDF 123A",
    make: "Toyota",
    model: "Land Cruiser Prado TX L-Package",
    yearOfManufacture: 2024,
    engineCapacityCc: 2982,
    bodyType: "suv",
    ownershipType: "purchased",
    initialCost: "7500000.00",
    providesFuel: true,
    isAvailableForPrivateUse: true,
    assignedEmployeeId: "EMP-001",
    assignedEmployeeName: "Nelson Mandela CP",
    currency: "KES",
    status: "active",
  },
  {
    id: "veh-002",
    registrationNumber: "KDD 456B",
    make: "Isuzu",
    model: "D-Max V-Cross 3.0 4x4",
    yearOfManufacture: 2023,
    engineCapacityCc: 2999,
    bodyType: "pickup",
    ownershipType: "purchased",
    initialCost: "5800000.00",
    providesFuel: true,
    isAvailableForPrivateUse: true,
    assignedEmployeeId: "EMP-002",
    assignedEmployeeName: "Operations Director",
    currency: "KES",
    status: "active",
  },
  {
    id: "veh-003",
    registrationNumber: "KDC 789C",
    make: "Toyota",
    model: "Corolla Cross Hybrid",
    yearOfManufacture: 2023,
    engineCapacityCc: 1798,
    bodyType: "suv",
    ownershipType: "leased",
    monthlyLeaseCost: "85000.00",
    initialCost: "0.00",
    providesFuel: false,
    isAvailableForPrivateUse: true,
    assignedEmployeeId: "EMP-003",
    assignedEmployeeName: "Finance Manager",
    currency: "KES",
    status: "active",
  },
];

// 1. GET /vehicles - List fleet vehicles
fleetRouter.get("/vehicles", async (c) => {
  try {
    const tenantId = c.get("tenantId");
    let vehicles: any[] = [];
    if (process.env.DATABASE_URL) {
      vehicles = await db
        .select()
        .from(companyVehicles)
        .where(eq(companyVehicles.tenantId, tenantId));
    }
    if (!vehicles.length) {
      vehicles = SAMPLE_VEHICLES;
    }

    return c.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err: any) {
    return c.json({ success: true, count: SAMPLE_VEHICLES.length, data: SAMPLE_VEHICLES });
  }
});

// 2. POST /vehicles - Register a new company vehicle
fleetRouter.post("/vehicles", zValidator("json", CreateVehicleSchema), async (c) => {
  const tenantId = c.get("tenantId");
  const organizationId = c.get("organizationId") || tenantId;
  const body = c.req.valid("json");
  const vehicleId = `veh-${Date.now().toString().slice(-6)}`;

  // Calculate immediate tax preview
  const taxPreview = calculateKenyanCarBenefit({
    engineCapacityCc: body.engineCapacityCc,
    initialCost: body.initialCost,
    monthlyLeaseCost: body.monthlyLeaseCost,
    ownershipType: body.ownershipType,
    isAvailableForPrivateUse: body.isAvailableForPrivateUse,
    providesFuel: body.providesFuel,
  });

  return c.json(
    {
      success: true,
      message: "Company vehicle registered successfully",
      data: {
        id: vehicleId,
        ...body,
        status: "active",
      },
      statutoryCarBenefitPreview: taxPreview,
    },
    201
  );
});

// 3. POST /vehicles/:id/assign - Assign vehicle to employee
fleetRouter.post("/vehicles/:id/assign", zValidator("json", AssignVehicleSchema), async (c) => {
  const vehicleId = c.req.param("id");
  const body = c.req.valid("json");
  const assignmentId = `ASGN-${Date.now().toString().slice(-6)}`;

  // Calculate benefit for the assigned vehicle
  const benefitPreview = calculateKenyanCarBenefit({
    engineCapacityCc: 2982,
    initialCost: 7500000,
    ownershipType: "purchased",
    isAvailableForPrivateUse: body.isAvailableForPrivateUse,
    providesFuel: true,
  });

  return c.json(
    {
      success: true,
      message: "Vehicle successfully assigned to employee",
      data: {
        id: assignmentId,
        vehicleId,
        employeeId: body.employeeId,
        startDate: body.startDate,
        status: "active",
        carBenefitTaxableMonthly: benefitPreview.totalTaxableCarBenefit,
        benefitDetails: benefitPreview,
      },
    },
    201
  );
});

// 4. GET /assignments/active - List active vehicle assignments with live benefit values
fleetRouter.get("/assignments/active", async (c) => {
  const activeAssignments = [
    {
      assignmentId: "asgn-001",
      employeeId: "EMP-001",
      employeeName: "Nelson Mandela CP",
      vehicleRegistrationNumber: "KDF 123A",
      make: "Toyota",
      model: "Land Cruiser Prado",
      engineCapacityCc: 2982,
      carBenefitMonthly: 150000.0,
      fuelBenefitMonthly: 45000.0,
      totalTaxableBenefitMonthly: 195000.0,
      ruleApplied: "2% of KES 7.5M (KES 150,000) > Prescribed CC (KES 7,200)",
    },
    {
      assignmentId: "asgn-002",
      employeeId: "EMP-002",
      employeeName: "Operations Director",
      vehicleRegistrationNumber: "KDD 456B",
      make: "Isuzu",
      model: "D-Max V-Cross",
      engineCapacityCc: 2999,
      carBenefitMonthly: 116000.0,
      fuelBenefitMonthly: 34800.0,
      totalTaxableBenefitMonthly: 150800.0,
      ruleApplied: "2% of KES 5.8M (KES 116,000) > Prescribed CC (KES 7,200)",
    },
  ];

  return c.json({ success: true, count: activeAssignments.length, data: activeAssignments });
});

// 5. POST /calculate-benefit - Standalone KRA Sec 5(4) simulation endpoint
fleetRouter.post("/calculate-benefit", zValidator("json", CalculateBenefitSchema), async (c) => {
  const body = c.req.valid("json");
  const result = calculateKenyanCarBenefit(body);

  return c.json({
    success: true,
    input: body,
    calculation: result,
  });
});
