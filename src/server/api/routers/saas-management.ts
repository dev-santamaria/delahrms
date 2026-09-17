/**
 * =========================================================================================
 * SAAS MANAGEMENT, TENANT ONBOARDING & SUBSCRIPTION BILLING ROUTER
 * =========================================================================================
 * Manages enterprise client organizations, onboarding lifecycle, tiered subscriptions,
 * seat headcount limits, automated invoice generation, and storage telemetry.
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import { db } from "@/db";
import {
  tenantSubscriptions,
  tenantInvoices,
  tenantOnboardingChecklists,
  tenantStorageQuotas,
} from "@/db/schema/saas-and-tenancy";
import { tenants, organizations, users, roles } from "@/db/schema/auth-tenancy";
import { eq } from "drizzle-orm";
import { authStore } from "../auth-store";

export const saasManagementRouter = new Hono<AppEnv>();

// Zod Validation Schemas
const OnboardTenantSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().optional(),
  planTier: z.enum(["starter", "growth", "enterprise"]).default("enterprise"),
  billingCycle: z.enum(["monthly", "annually"]).default("monthly"),
  seatLimit: z.number().int().positive().default(250),
  adminEmail: z.string().email(),
  adminFirstName: z.string().min(2),
  adminLastName: z.string().min(2),
  countryCode: z.string().length(3).default("KEN"),
  currency: z.string().length(3).default("USD"),
});

const TenantActionSchema = z.object({
  action: z.enum(["suspend", "reactivate", "change_tier", "upgrade_seats", "archive", "approve", "reject"]),
  planTier: z.enum(["starter", "growth", "enterprise"]).optional(),
  seatLimit: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

const GenerateInvoiceSchema = z.object({
  tenantId: z.string(),
  billingPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  billingPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subtotalAmount: z.number().positive(),
  taxAmount: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
});

// Seed Tenants & Subscriptions
const memoryTenants: any[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Dela HR",
    slug: "delahr",
    domain: "delahr.com",
    status: "active",
    tier: "enterprise",
    subscription: {
      planTier: "enterprise",
      billingCycle: "annually",
      status: "active",
      seatLimit: 5000,
      currentHeadcount: 1420,
      currency: "KES",
      unitPricePerSeat: 4.5,
      totalBillingAmount: 22500.0,
      currentPeriodStartsAt: "2026-01-01T00:00:00.000Z",
      currentPeriodEndsAt: "2026-12-31T23:59:59.000Z",
      paymentMethod: "bank_wire",
    },
    onboarding: {
      hasCompanyProfile: true,
      hasTaxRegistrySetup: true,
      hasPayGroupsDefined: true,
      hasImportedEmployees: true,
      hasConfiguredWorkflows: true,
      isCompleted: true,
    },
    storage: {
      storageLimitBytes: 536870912000, // 500 GB
      usedStorageBytes: 68719476736, // 64 GB
      uncompressedOriginalBytes: 257698037760, // 240 GB
      totalSavedBytes: 188978561024, // 176 GB saved
      compressionRatio: 73.3,
      deduplicatedObjectsCount: 412,
    },
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Mandela Global Group Holding",
    slug: "mandela-group",
    domain: "mandela.co.ke",
    status: "active",
    tier: "enterprise",
    subscription: {
      planTier: "enterprise",
      billingCycle: "annually",
      status: "active",
      seatLimit: 2500,
      currentHeadcount: 2048,
      currency: "USD",
      unitPricePerSeat: 4.5,
      totalBillingAmount: 11250.0,
      currentPeriodStartsAt: "2026-01-01T00:00:00.000Z",
      currentPeriodEndsAt: "2026-12-31T23:59:59.000Z",
      paymentMethod: "bank_wire",
    },
    onboarding: {
      hasCompanyProfile: true,
      hasTaxRegistrySetup: true,
      hasPayGroupsDefined: true,
      hasImportedEmployees: true,
      hasConfiguredWorkflows: true,
      isCompleted: true,
    },
    storage: {
      storageLimitBytes: 536870912000,
      usedStorageBytes: 68719476736,
      uncompressedOriginalBytes: 257698037760,
      totalSavedBytes: 188978561024,
      compressionRatio: 73.3,
      deduplicatedObjectsCount: 412,
    },
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Kilima Safari Logistics Ltd",
    slug: "kilima-safaris",
    domain: "kilimasafari.com",
    status: "trial",
    tier: "growth",
    subscription: {
      planTier: "growth",
      billingCycle: "monthly",
      status: "trialing",
      seatLimit: 150,
      currentHeadcount: 84,
      currency: "USD",
      unitPricePerSeat: 6.0,
      totalBillingAmount: 900.0,
      trialEndsAt: "2026-10-01T23:59:59.000Z",
      currentPeriodStartsAt: "2026-09-17T00:00:00.000Z",
      currentPeriodEndsAt: "2026-10-17T23:59:59.000Z",
      paymentMethod: "mpesa_b2b",
    },
    onboarding: {
      hasCompanyProfile: true,
      hasTaxRegistrySetup: true,
      hasPayGroupsDefined: true,
      hasImportedEmployees: false,
      hasConfiguredWorkflows: false,
      isCompleted: false,
    },
    storage: {
      storageLimitBytes: 107374182400, // 100 GB
      usedStorageBytes: 5368709120, // 5 GB
      uncompressedOriginalBytes: 16106127360, // 15 GB
      totalSavedBytes: 10737418240, // 10 GB saved
      compressionRatio: 66.7,
      deduplicatedObjectsCount: 58,
    },
    createdAt: "2026-09-17T08:00:00.000Z",
  },
];

// Seed Invoices
const memoryInvoices: any[] = [
  {
    id: "inv-2026-0089",
    tenantId: "00000000-0000-0000-0000-000000000001",
    tenantName: "Mandela Global Group Holding",
    invoiceNumber: "INV-2026-0089",
    billingPeriodStart: "2026-01-01T00:00:00.000Z",
    billingPeriodEnd: "2026-12-31T23:59:59.000Z",
    subtotalAmount: 112500.0,
    taxAmount: 18000.0,
    totalAmount: 130500.0,
    currency: "USD",
    status: "paid",
    pdfDownloadUrl: "https://storage.mandela.co.ke/invoices/INV-2026-0089.pdf",
    paidAt: "2026-01-05T14:30:00.000Z",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
];

// 1. POST /tenants/onboard - Complete automated SaaS onboarding
saasManagementRouter.post("/tenants/onboard", zValidator("json", OnboardTenantSchema), async (c) => {
  const body = c.req.valid("json");

  const existingSlug = memoryTenants.find((t) => t.slug === body.slug);
  if (existingSlug) {
    return c.json({ success: false, error: `Tenant slug '${body.slug}' is already taken` }, 409);
  }

  const tenantId = `tenant-${Date.now().toString().slice(-6)}`;
  const unitPrice = body.planTier === "starter" ? 8.0 : body.planTier === "growth" ? 6.0 : 4.5;
  const totalAmount = body.seatLimit * unitPrice;

  const newTenant = {
    id: tenantId,
    name: body.name,
    slug: body.slug,
    domain: body.domain || `${body.slug}.zuri.africa`,
    status: "trial",
    tier: body.planTier,
    adminUser: {
      email: body.adminEmail,
      name: `${body.adminFirstName} ${body.adminLastName}`,
      role: "SUPER_ADMIN",
    },
    subscription: {
      planTier: body.planTier,
      billingCycle: body.billingCycle,
      status: "trialing",
      seatLimit: body.seatLimit,
      currentHeadcount: 1, // Admin user initialized
      currency: body.currency,
      unitPricePerSeat: unitPrice,
      totalBillingAmount: totalAmount,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day free trial
      currentPeriodStartsAt: new Date().toISOString(),
      currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: "bank_wire",
    },
    onboarding: {
      hasCompanyProfile: true,
      hasTaxRegistrySetup: false,
      hasPayGroupsDefined: false,
      hasImportedEmployees: false,
      hasConfiguredWorkflows: false,
      isCompleted: false,
    },
    storage: {
      storageLimitBytes: body.planTier === "enterprise" ? 536870912000 : 53687091200,
      usedStorageBytes: 0,
      uncompressedOriginalBytes: 0,
      totalSavedBytes: 0,
      compressionRatio: 0.0,
      deduplicatedObjectsCount: 0,
    },
    createdAt: new Date().toISOString(),
  };

  memoryTenants.unshift(newTenant);

  return c.json(
    {
      success: true,
      message: `Tenant '${body.name}' successfully onboarded with 14-day ${body.planTier.toUpperCase()} trial`,
      data: newTenant,
    },
    201
  );
});

// 2. GET /tenants - Query all SaaS tenant client accounts
saasManagementRouter.get("/tenants", async (c) => {
  const status = c.req.query("status");
  const tier = c.req.query("tier");
  const search = c.req.query("search");

  // Synchronize staged tenants from authStore into memoryTenants
  authStore.getAllTenants().forEach((staged) => {
    const exists = memoryTenants.find((m) => m.id === staged.id || m.slug === staged.slug);
    if (!exists) {
      memoryTenants.push({
        id: staged.id,
        name: staged.name,
        slug: staged.slug,
        domain: staged.domain,
        status: staged.status,
        tier: "growth",
        adminUser: {
          email: staged.companyEmail,
          name: staged.name,
          role: "TENANT_ADMIN",
        },
        subscription: {
          planTier: "growth",
          billingCycle: "monthly",
          status: staged.status === "active" ? "active" : "pending_approval",
          seatLimit: 150,
          currentHeadcount: 1,
          currency: staged.currency,
          unitPricePerSeat: 6.0,
          totalBillingAmount: 900.0,
          currentPeriodStartsAt: staged.submittedAt,
          currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          paymentMethod: "bank_wire",
        },
        onboarding: {
          hasCompanyProfile: true,
          hasTaxRegistrySetup: true,
          hasPayGroupsDefined: false,
          hasImportedEmployees: false,
          hasConfiguredWorkflows: false,
          isCompleted: false,
        },
        storage: {
          storageLimitBytes: 107374182400,
          usedStorageBytes: 0,
          uncompressedOriginalBytes: 0,
          totalSavedBytes: 0,
          compressionRatio: 0,
          deduplicatedObjectsCount: 0,
        },
        createdAt: staged.submittedAt,
        referenceCode: staged.referenceCode,
        taxPin: staged.taxPin,
        countryCode: staged.countryCode,
      });
    } else {
      exists.status = staged.status;
    }
  });

  let filtered = [...memoryTenants];
  if (status && status !== "all") filtered = filtered.filter((t) => t.status === status);
  if (tier && tier !== "all") filtered = filtered.filter((t) => t.tier === tier);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q));
  }

  return c.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// Helper: Find tenant in memoryTenants or synchronize from authStore
function findOrSyncTenant(id: string) {
  let tenant = memoryTenants.find((t) => t.id === id || t.slug === id);
  if (!tenant) {
    const staged = authStore.findTenantById(id);
    if (staged) {
      tenant = {
        id: staged.id,
        name: staged.name,
        slug: staged.slug,
        domain: staged.domain,
        status: staged.status,
        tier: "growth",
        adminUser: {
          email: staged.companyEmail,
          name: staged.name,
          role: "TENANT_ADMIN",
        },
        subscription: {
          planTier: "growth",
          billingCycle: "monthly",
          status: staged.status === "active" ? "active" : "pending_approval",
          seatLimit: 150,
          currentHeadcount: 1,
          currency: staged.currency,
          unitPricePerSeat: 6.0,
          totalBillingAmount: 900.0,
          currentPeriodStartsAt: staged.submittedAt,
          currentPeriodEndsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          paymentMethod: "bank_wire",
        },
        onboarding: {
          hasCompanyProfile: true,
          hasTaxRegistrySetup: true,
          hasPayGroupsDefined: false,
          hasImportedEmployees: false,
          hasConfiguredWorkflows: false,
          isCompleted: false,
        },
        storage: {
          storageLimitBytes: 107374182400,
          usedStorageBytes: 0,
          uncompressedOriginalBytes: 0,
          totalSavedBytes: 0,
          compressionRatio: 0,
          deduplicatedObjectsCount: 0,
        },
        createdAt: staged.submittedAt,
        referenceCode: staged.referenceCode,
        taxPin: staged.taxPin,
        countryCode: staged.countryCode,
      };
      memoryTenants.push(tenant);
    }
  }
  return tenant;
}

// 3. GET /tenants/:id - Detailed tenant dossier & onboarding telemetry
saasManagementRouter.get("/tenants/:id", async (c) => {
  const id = c.req.param("id");
  const tenant = findOrSyncTenant(id);

  if (!tenant) {
    return c.json({ success: false, error: "Tenant not found" }, 404);
  }

  return c.json({
    success: true,
    data: tenant,
  });
});

// 4. POST /tenants/:id/actions - Execute administrative lifecycle actions
saasManagementRouter.post("/tenants/:id/actions", zValidator("json", TenantActionSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const tenant = findOrSyncTenant(id);

  if (!tenant) {
    return c.json({ success: false, error: "Tenant not found" }, 404);
  }

  switch (body.action) {
    case "approve":
      await authStore.approveTenant(tenant.id);
      tenant.status = "active";
      if (tenant.subscription) {
        tenant.subscription.status = "active";
      }
      break;
    case "reject":
      authStore.rejectTenant(tenant.id, body.reason);
      tenant.status = "suspended";
      if (tenant.subscription) {
        tenant.subscription.status = "suspended";
      }
      break;
    case "suspend":
      tenant.status = "suspended";
      tenant.subscription.status = "suspended";
      break;
    case "reactivate":
      tenant.status = "active";
      tenant.subscription.status = "active";
      break;
    case "change_tier":
      if (body.planTier) {
        tenant.tier = body.planTier;
        tenant.subscription.planTier = body.planTier;
      }
      break;
    case "upgrade_seats":
      if (body.seatLimit) {
        tenant.subscription.seatLimit = body.seatLimit;
        tenant.subscription.totalBillingAmount = body.seatLimit * tenant.subscription.unitPricePerSeat;
      }
      break;
    case "archive":
      tenant.status = "cancelled";
      tenant.subscription.status = "cancelled";
      break;
  }

  return c.json({
    success: true,
    message: body.action === "approve"
      ? `Tenant '${tenant.name}' successfully approved. Enterprise organization spun up and tenant administrator account activated.`
      : `Tenant action '${body.action}' successfully applied to ${tenant.name}`,
    data: tenant,
  });
});

// 5. GET /billing/subscriptions - Query subscriptions overview
saasManagementRouter.get("/billing/subscriptions", async (c) => {
  const subs = memoryTenants.map((t) => ({
    tenantId: t.id,
    tenantName: t.name,
    planTier: t.subscription.planTier,
    status: t.subscription.status,
    seatLimit: t.subscription.seatLimit,
    currentHeadcount: t.subscription.currentHeadcount,
    utilizationPercent: Number(((t.subscription.currentHeadcount / t.subscription.seatLimit) * 100).toFixed(1)),
    totalBillingAmount: t.subscription.totalBillingAmount,
    currency: t.subscription.currency,
    renewalDate: t.subscription.currentPeriodEndsAt,
  }));

  return c.json({
    success: true,
    count: subs.length,
    data: subs,
  });
});

// 6. POST /billing/invoices/generate - Generate subscription invoice
saasManagementRouter.post("/billing/invoices/generate", zValidator("json", GenerateInvoiceSchema), async (c) => {
  const body = c.req.valid("json");
  const tenant = memoryTenants.find((t) => t.id === body.tenantId);

  const totalAmount = body.subtotalAmount + body.taxAmount;
  const newInvoice = {
    id: `inv-${Date.now().toString().slice(-6)}`,
    tenantId: body.tenantId,
    tenantName: tenant?.name || "Client Enterprise",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    billingPeriodStart: `${body.billingPeriodStart}T00:00:00.000Z`,
    billingPeriodEnd: `${body.billingPeriodEnd}T23:59:59.000Z`,
    subtotalAmount: body.subtotalAmount,
    taxAmount: body.taxAmount,
    totalAmount,
    currency: body.currency,
    status: "issued",
    pdfDownloadUrl: `https://storage.zuri.africa/invoices/${body.tenantId}/inv-${Date.now()}.pdf`,
    paidAt: null,
    createdAt: new Date().toISOString(),
  };

  memoryInvoices.unshift(newInvoice);

  return c.json(
    {
      success: true,
      message: `Invoice ${newInvoice.invoiceNumber} issued for ${tenant?.name || body.tenantId}`,
      data: newInvoice,
    },
    201
  );
});

// 7. GET /tenants/:id/usage - Real-time seat and storage quota metrics
saasManagementRouter.get("/tenants/:id/usage", async (c) => {
  const id = c.req.param("id");
  const tenant = memoryTenants.find((t) => t.id === id || t.slug === id);

  if (!tenant) {
    return c.json({ success: false, error: "Tenant not found" }, 404);
  }

  const sub = tenant.subscription;
  const storage = tenant.storage;

  return c.json({
    success: true,
    data: {
      tenantId: tenant.id,
      tenantName: tenant.name,
      seats: {
        currentHeadcount: sub.currentHeadcount,
        seatLimit: sub.seatLimit,
        availableSeats: Math.max(0, sub.seatLimit - sub.currentHeadcount),
        utilizationPercentage: Number(((sub.currentHeadcount / sub.seatLimit) * 100).toFixed(1)),
        isOverQuota: sub.currentHeadcount > sub.seatLimit,
      },
      storage: {
        usedStorageBytes: storage.usedStorageBytes,
        usedStorageMb: Number((storage.usedStorageBytes / (1024 * 1024)).toFixed(2)),
        storageLimitBytes: storage.storageLimitBytes,
        storageLimitMb: Number((storage.storageLimitBytes / (1024 * 1024)).toFixed(2)),
        utilizationPercentage: Number(((storage.usedStorageBytes / storage.storageLimitBytes) * 100).toFixed(2)),
        totalSavedBytes: storage.totalSavedBytes,
        totalSavedMb: Number((storage.totalSavedBytes / (1024 * 1024)).toFixed(2)),
        compressionRatio: storage.compressionRatio,
        deduplicatedObjectsCount: storage.deduplicatedObjectsCount,
      },
    },
  });
});
