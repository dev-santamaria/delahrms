/**
 * =========================================================================================
 * GEOGRAPHIC ADMINISTRATIVE HIERARCHY & WORK LOCATIONS (DEPOTS, PLANTS & HUBS) ROUTER
 * =========================================================================================
 * Manages recursive spatial administrative hierarchy across countries, regions, counties/states,
 * districts, and wards, along with physical enterprise facilities (plants, depots, mines)
 * and GPS geofences for attendance enforcement.
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import { geoAdministrativeUnits, geoWorkLocations } from "@/db/schema/geo-hierarchy";
import { eq } from "drizzle-orm";

export const geoHierarchyRouter = new Hono<AppEnv>();

// Zod Validation Schemas
const CreateAdminUnitSchema = z.object({
  countryCode: z.string().length(3).default("KEN"),
  parentId: z.string().uuid().optional(),
  level: z.number().int().min(1).max(5),
  divisionType: z.enum([
    "country",
    "region",
    "province",
    "state",
    "county",
    "district",
    "sub_county",
    "sector",
    "ward",
    "municipality",
  ]),
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(50),
  postalAbbreviation: z.string().max(20).optional(),
  defaultCurrency: z.string().length(3).default("KES"),
  defaultTimezone: z.string().default("Africa/Nairobi"),
  minimumWageHourlyRate: z.number().nonnegative().optional(),
  minimumWageMonthlyRate: z.number().nonnegative().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const CreateWorkLocationSchema = z.object({
  administrativeUnitId: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(50),
  locationType: z.enum([
    "office",
    "warehouse",
    "plant",
    "depot",
    "mine_site",
    "remote_hub",
    "retail_store",
  ]).default("office"),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  cityOrTown: z.string().min(2),
  postalCode: z.string().optional(),
  countryCode: z.string().length(3).default("KEN"),
  latitude: z.number(),
  longitude: z.number(),
  geofenceRadiusMeters: z.number().int().positive().default(150),
  primaryContactName: z.string().optional(),
  primaryContactPhone: z.string().optional(),
  primaryContactEmail: z.string().email().optional(),
});

// Seed Administrative Hierarchy (Kenya, Uganda, Tanzania examples)
const memoryAdminUnits: any[] = [
  {
    id: "geo-ken-root",
    countryCode: "KEN",
    parentId: null,
    level: 1,
    divisionType: "country",
    name: "Republic of Kenya",
    code: "KEN",
    defaultCurrency: "KES",
    defaultTimezone: "Africa/Nairobi",
    minimumWageMonthlyRate: 15201.65,
    isActive: true,
  },
  {
    id: "geo-ken-county-nrb",
    countryCode: "KEN",
    parentId: "geo-ken-root",
    level: 2,
    divisionType: "county",
    name: "Nairobi City County",
    code: "KE-47",
    postalAbbreviation: "NRB",
    defaultCurrency: "KES",
    defaultTimezone: "Africa/Nairobi",
    minimumWageMonthlyRate: 21300.0,
    isActive: true,
  },
  {
    id: "geo-ken-county-ksm",
    countryCode: "KEN",
    parentId: "geo-ken-root",
    level: 2,
    divisionType: "county",
    name: "Kisumu County",
    code: "KE-42",
    postalAbbreviation: "KSM",
    defaultCurrency: "KES",
    defaultTimezone: "Africa/Nairobi",
    minimumWageMonthlyRate: 18500.0,
    isActive: true,
  },
  {
    id: "geo-ken-county-msa",
    countryCode: "KEN",
    parentId: "geo-ken-root",
    level: 2,
    divisionType: "county",
    name: "Mombasa County",
    code: "KE-01",
    postalAbbreviation: "MSA",
    defaultCurrency: "KES",
    defaultTimezone: "Africa/Nairobi",
    minimumWageMonthlyRate: 21300.0,
    isActive: true,
  },
];

// Seed Work Locations (Physical Stations, Depots & Plants)
const memoryWorkLocations: any[] = [
  {
    id: "loc-nrb-hq",
    administrativeUnitId: "geo-ken-county-nrb",
    administrativeUnitName: "Nairobi City County",
    name: "Mandela HQ Tower (Upper Hill)",
    code: "NRB-HQ-01",
    locationType: "office",
    addressLine1: "4th Ngong Avenue, Upper Hill",
    cityOrTown: "Nairobi",
    countryCode: "KEN",
    latitude: -1.298812,
    longitude: 36.814912,
    geofenceRadiusMeters: 150,
    primaryContactName: "Sarah Wanjiku",
    primaryContactEmail: "swanjiku@mandela.co.ke",
    isActive: true,
  },
  {
    id: "loc-nrb-plant",
    administrativeUnitId: "geo-ken-county-nrb",
    administrativeUnitName: "Nairobi City County",
    name: "Nairobi Industrial Plant",
    code: "PLT-NRB-02",
    locationType: "plant",
    addressLine1: "Commercial Street, Industrial Area",
    cityOrTown: "Nairobi",
    countryCode: "KEN",
    latitude: -1.300521,
    longitude: 36.885012,
    geofenceRadiusMeters: 200,
    primaryContactName: "Engineer David Mutua",
    primaryContactEmail: "dmutua@mandela.co.ke",
    isActive: true,
  },
  {
    id: "loc-ksm-depot",
    administrativeUnitId: "geo-ken-county-ksm",
    administrativeUnitName: "Kisumu County",
    name: "Kisumu Lake Basin Depot",
    code: "DEP-KSM-01",
    locationType: "depot",
    addressLine1: "Kondele Industrial Zone, Off Busia Road",
    cityOrTown: "Kisumu",
    countryCode: "KEN",
    latitude: -0.091702,
    longitude: 34.767956,
    geofenceRadiusMeters: 250,
    primaryContactName: "Kennedy Omondi",
    primaryContactEmail: "komondi@mandela.co.ke",
    isActive: true,
  },
  {
    id: "loc-msa-terminal",
    administrativeUnitId: "geo-ken-county-msa",
    administrativeUnitName: "Mombasa County",
    name: "Mombasa Port Logistics Terminal",
    code: "TRM-MSA-01",
    locationType: "warehouse",
    addressLine1: "Kilindini Harbour Access Road, Shimanzi",
    cityOrTown: "Mombasa",
    countryCode: "KEN",
    latitude: -4.053421,
    longitude: 39.658219,
    geofenceRadiusMeters: 300,
    primaryContactName: "Omar Hassan",
    primaryContactEmail: "ohassan@mandela.co.ke",
    isActive: true,
  },
];

// 1. GET /units - Query administrative units
geoHierarchyRouter.get("/units", async (c) => {
  const countryCode = c.req.query("countryCode");
  const level = c.req.query("level");
  const parentId = c.req.query("parentId");

  let filtered = [...memoryAdminUnits];
  if (countryCode) filtered = filtered.filter((u) => u.countryCode === countryCode);
  if (level) filtered = filtered.filter((u) => u.level === Number(level));
  if (parentId !== undefined) filtered = filtered.filter((u) => u.parentId === (parentId || null));

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 2. GET /units/tree - Hierarchical spatial tree
geoHierarchyRouter.get("/units/tree", async (c) => {
  const countryCode = c.req.query("countryCode") || "KEN";
  const units = memoryAdminUnits.filter((u) => u.countryCode === countryCode);

  const buildTree = (parentId: string | null = null): any[] => {
    return units
      .filter((u) => u.parentId === parentId)
      .map((u) => ({
        ...u,
        children: buildTree(u.id),
      }));
  };

  const tree = buildTree(null);

  return c.json({
    success: true,
    countryCode,
    tree,
  });
});

// 3. POST /units - Register new administrative unit (e.g. County/District)
geoHierarchyRouter.post("/units", zValidator("json", CreateAdminUnitSchema), async (c) => {
  const body = c.req.valid("json");

  const newUnit = {
    id: `geo-${body.countryCode.toLowerCase()}-${body.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    ...body,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  memoryAdminUnits.push(newUnit);

  return c.json(
    {
      success: true,
      message: `Administrative unit '${body.name}' (${body.code}) registered successfully`,
      data: newUnit,
    },
    201
  );
});

// 4. GET /work-locations - Query work locations, depots, plants, and stations
geoHierarchyRouter.get("/work-locations", async (c) => {
  const locationType = c.req.query("locationType");
  const countryCode = c.req.query("countryCode");
  const search = c.req.query("search");

  let filtered = [...memoryWorkLocations];
  if (locationType) filtered = filtered.filter((l) => l.locationType === locationType);
  if (countryCode) filtered = filtered.filter((l) => l.countryCode === countryCode);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
  }

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// 5. POST /work-locations - Register a physical station / facility with GPS geofence
geoHierarchyRouter.post("/work-locations", zValidator("json", CreateWorkLocationSchema), async (c) => {
  const body = c.req.valid("json");

  const adminUnit = body.administrativeUnitId
    ? memoryAdminUnits.find((u) => u.id === body.administrativeUnitId)
    : null;

  const newLoc = {
    id: `loc-${body.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    ...body,
    administrativeUnitName: adminUnit?.name || null,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  memoryWorkLocations.push(newLoc);

  return c.json(
    {
      success: true,
      message: `Work location '${body.name}' (${body.code}) registered with ${body.geofenceRadiusMeters}m geofence`,
      data: newLoc,
    },
    201
  );
});

// 6. GET /work-locations/:id - Detailed work location profile
geoHierarchyRouter.get("/work-locations/:id", async (c) => {
  const id = c.req.param("id");
  const loc = memoryWorkLocations.find((l) => l.id === id || l.code === id);

  if (!loc) {
    return c.json({ success: false, error: "Work location not found" }, 404);
  }

  return c.json({
    success: true,
    data: loc,
  });
});
