/**
 * =========================================================================================
 * DELA HR UNIVERSAL AUTHENTICATION & MULTI-TENANT ONBOARDING ROUTER
 * =========================================================================================
 * 1. Self-service company onboarding entry point (/auth/get-started)
 * 2. Enterprise credential authentication & compliance vetting gatekeeper
 * 3. TOTP Multi-Factor Authentication (MFA) Setup & Challenge Verification
 * 4. Super Admin approval state gating (Account Under Review HTTP 403)
 * =========================================================================================
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AppEnv } from "../types";
import {
  authStore,
  verifyPassword,
  StagedUser,
  StagedTenant,
} from "../auth-store";

export const authRouter = new Hono<AppEnv>();

// -------------------------------------------------------------
// Validation Schemas
// -------------------------------------------------------------

const RegisterTenantSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(255),
  legalName: z.string().optional(),
  tradingName: z.string().optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  taxPin: z.string().min(4, "Tax Identification PIN is required").max(50),
  countryCode: z.string().length(3).default("KEN"),
  currency: z.string().length(3).default("KES"),
  industry: z.string().min(2).default("General Enterprise"),
  companySize: z.string().default("10-50"),
  companyEmail: z.string().email("Valid company corporate email is required"),
  phone: z.string().min(6, "Valid company phone number is required"),
  address: z.string().optional(),
  // Tenant Administrator Details
  adminFirstName: z.string().min(2, "First name is required"),
  adminLastName: z.string().min(2, "Last name is required"),
  adminEmail: z.string().email("Valid admin work email is required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters"),
  adminPhone: z.string().optional(),
  adminJobTitle: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("Valid work email is required"),
  password: z.string().min(1, "Password is required"),
});

const MfaSetupSchema = z.object({
  email: z.string().email(),
});

const MfaVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(12),
  isBackupCode: z.boolean().optional().default(false),
  tempToken: z.string().optional(),
});

// -------------------------------------------------------------
// Endpoints
// -------------------------------------------------------------

// 1. POST /register-tenant - Company self-service onboarding entry point
authRouter.post("/register-tenant", zValidator("json", RegisterTenantSchema), async (c) => {
  const body = c.req.valid("json");

  try {
    const result = await authStore.registerTenant({
      companyName: body.companyName,
      legalName: body.legalName,
      tradingName: body.tradingName,
      slug: body.slug,
      taxPin: body.taxPin,
      countryCode: body.countryCode,
      currency: body.currency,
      industry: body.industry,
      companySize: body.companySize,
      companyEmail: body.companyEmail,
      phone: body.phone,
      address: body.address,
      adminFirstName: body.adminFirstName,
      adminLastName: body.adminLastName,
      adminEmail: body.adminEmail,
      adminPassword: body.adminPassword,
      adminPhone: body.adminPhone,
      adminJobTitle: body.adminJobTitle,
    });

    return c.json(
      {
        success: true,
        message:
          "Registration successfully submitted. Your company account is currently under compliance review by the Platform Super Administrator.",
        data: {
          tenantId: result.tenant.id,
          companyName: result.tenant.name,
          slug: result.tenant.slug,
          referenceCode: result.referenceCode,
          status: result.tenant.status,
          adminEmail: result.user.email,
          submittedAt: result.tenant.submittedAt,
        },
      },
      201
    );
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to register tenant",
      },
      400
    );
  }
});

// 2. POST /login - Authenticate credentials & enforce approval gating
authRouter.post("/login", zValidator("json", LoginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  // Check user in auth registry
  const user = authStore.findUserByEmail(email);

  if (!user) {
    return c.json(
      {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      },
      401
    );
  }

  // Verify password hash
  const isValidPassword = verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return c.json(
      {
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      },
      401
    );
  }

  // Find associated tenant
  const tenant = authStore.findTenantById(user.tenantId);

  // =========================================================================
  // APPROVAL GATE: Enforce Account Under Review Blocker
  // =========================================================================
  const isPendingApproval =
    user.status === "pending_approval" ||
    user.status === "under_review" ||
    tenant?.status === "pending_approval" ||
    tenant?.status === "under_review" ||
    !user.isActive;

  // Platform Super Administrator is always active and bypasses gating
  if (user.role !== "super_admin" && isPendingApproval) {
    return c.json(
      {
        success: false,
        code: "ACCOUNT_UNDER_REVIEW",
        message:
          "Account Under Review: Your company registration is currently undergoing compliance vetting by the Platform Super Administrator. You will gain access immediately upon approval.",
        companyName: user.companyName,
        referenceCode: user.referenceCode || "DELA-REG-PENDING",
        submittedAt: user.createdAt,
        supportEmail: "info@delahr.com",
      },
      403
    );
  }

  // If MFA is enabled for this user, trigger challenge flow
  if (user.mfaEnabled) {
    const challengeId = `chal-${Date.now().toString().slice(-6)}`;
    return c.json({
      success: true,
      requiresMfa: true,
      challengeId,
      email: user.email,
      userId: user.id,
      message: "Two-factor authentication required. Please enter your 6-digit TOTP code.",
    });
  }

  // Authentication Succeeded - Generate Session
  const token = `dela_jwt_${Buffer.from(`${user.id}:${Date.now()}`).toString("base64")}`;

  return c.json({
    success: true,
    message: `Welcome back, ${user.firstName}!`,
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roleName: user.roleName,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      companyName: user.companyName,
      isTenantOwner: user.isTenantOwner,
      mfaEnabled: user.mfaEnabled,
    },
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          currency: tenant.currency,
          countryCode: tenant.countryCode,
        }
      : undefined,
  });
});

// 3. POST /mfa/setup - Initialize TOTP setup with QR code and backup codes
authRouter.post("/mfa/setup", zValidator("json", MfaSetupSchema), async (c) => {
  const { email } = c.req.valid("json");

  try {
    const setupData = await authStore.setupMfa(email);
    return c.json({
      success: true,
      message: "Scan the QR code with your authenticator application (Google Authenticator, Authy, 1Password).",
      data: setupData,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Failed to setup MFA",
      },
      400
    );
  }
});

// 4. POST /mfa/verify - Verify TOTP code or backup code
authRouter.post("/mfa/verify", zValidator("json", MfaVerifySchema), async (c) => {
  const { email, code, isBackupCode } = c.req.valid("json");

  try {
    const { verified, user } = authStore.verifyMfa(email, code, isBackupCode);

    if (!verified) {
      return c.json(
        {
          success: false,
          error: isBackupCode
            ? "Invalid or already consumed emergency backup recovery code."
            : "Invalid 6-digit verification code. Please check your authenticator clock synchronization.",
        },
        400
      );
    }

    const token = `dela_jwt_${Buffer.from(`${user.id}:${Date.now()}`).toString("base64")}`;
    const tenant = authStore.findTenantById(user.tenantId);

    return c.json({
      success: true,
      verified: true,
      message: "Two-factor authentication verified successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleName: user.roleName,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        companyName: user.companyName,
        isTenantOwner: user.isTenantOwner,
        mfaEnabled: true,
      },
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
          }
        : undefined,
    });
  } catch (error: any) {
    return c.json(
      {
        success: false,
        error: error.message || "Verification failed",
      },
      400
    );
  }
});

// 5. GET /me - Retrieve active session info
authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization") || "";
  const userId = c.get("userId") || "00000000-0000-0000-0000-000000000099";

  const user = authStore.findUserById(userId) || authStore.findUserByEmail("admin@delahr.com");
  if (!user) {
    return c.json({ success: false, error: "Session expired or invalid" }, 401);
  }

  const tenant = authStore.findTenantById(user.tenantId);

  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roleName: user.roleName,
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      companyName: user.companyName,
      isTenantOwner: user.isTenantOwner,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
    },
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
        }
      : undefined,
  });
});

// 6. GET /pending-tenants - List all registrations awaiting Platform Super Admin approval
authRouter.get("/pending-tenants", async (c) => {
  const pending = authStore.getPendingTenants();
  return c.json({
    success: true,
    count: pending.length,
    data: pending,
  });
});
