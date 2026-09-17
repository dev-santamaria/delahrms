/**
 * DELA HR END-TO-END AUTHENTICATION, ONBOARDING & TENANT APPROVAL TEST SUITE
 *
 * Verifies:
 * 1. Seeded Platform Super Admin authentication (admin@delahr.com / DelaHR2026?)
 * 2. New tenant self-service onboarding via /auth/get-started
 * 3. Login attempt gating & HTTP 403 ACCOUNT_UNDER_REVIEW blocker
 * 4. Super Admin tenant approval & organization spin-up
 * 5. Tenant admin login activation after approval
 * 6. Multi-Factor Authentication (MFA) setup with QR code & backup codes
 * 7. TOTP code verification challenge
 */

import { app } from "./app";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`, detail || "");
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runAuthSuite() {
  console.log("===============================================================================");
  console.log("🚀 STARTING DELA HR AUTHENTICATION, ONBOARDING & APPROVAL TEST SUITE");
  console.log("===============================================================================\n");

  // -----------------------------------------------------------------------------------------
  // TEST 1: Seeded Platform Super Administrator Login (Dela HR)
  // -----------------------------------------------------------------------------------------
  console.log("📋 [Test 1] Platform Super Administrator Authentication (admin@delahr.com / DelaHR2026?)");
  const superAdminLoginRes = await app.request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@delahr.com",
      password: "DelaHR2026?",
    }),
  });

  const superAdminData = await superAdminLoginRes.json();
  assert(superAdminLoginRes.status === 200, "Super admin login returns HTTP 200 OK");
  assert(superAdminData.success === true, "Response reports success = true");
  assert(superAdminData.user.role === "super_admin", "User role is 'super_admin'");
  assert(superAdminData.user.companyName === "Dela HR", "Company name is 'Dela HR'");
  assert(typeof superAdminData.token === "string", "Valid session token generated");

  // -----------------------------------------------------------------------------------------
  // TEST 2: Register New Tenant via Get-Started (/api/v1/auth/register-tenant)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 2] New Tenant Onboarding Submission (/api/v1/auth/register-tenant)");
  const newTenantPayload = {
    companyName: "Safari Expeditions East Africa Ltd",
    legalName: "Safari Expeditions East Africa Limited",
    tradingName: "Safari Expeditions",
    slug: "safari-expeditions",
    taxPin: "P059988771Z",
    countryCode: "KEN",
    currency: "KES",
    industry: "Hospitality & Tourism",
    companySize: "50-250",
    companyEmail: "info@safariexpeditions.com",
    phone: "+254 722 112233",
    address: "Karengata Commercial Center, Nairobi, Kenya",
    adminFirstName: "Grace",
    adminLastName: "Mumbi",
    adminEmail: "admin@safariexpeditions.com",
    adminPassword: "SafariGrace2026!",
    adminPhone: "+254 722 998877",
    adminJobTitle: "Chief Executive Officer",
  };

  const registerRes = await app.request("/api/v1/auth/register-tenant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTenantPayload),
  });

  const registerData = await registerRes.json();
  assert(registerRes.status === 201, "Tenant registration returns HTTP 201 Created");
  assert(registerData.success === true, "Registration marked success");
  assert(registerData.data.status === "pending_approval", "Status is 'pending_approval'");
  assert(typeof registerData.data.referenceCode === "string", "Reference code assigned");
  assert(registerData.data.referenceCode.startsWith("DELA-REG-2026-"), "Reference code format valid");

  const newlyCreatedTenantId = registerData.data.tenantId;

  // -----------------------------------------------------------------------------------------
  // TEST 3: Login Attempt Before Approval (Must be Gated with HTTP 403 ACCOUNT_UNDER_REVIEW)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 3] Login Blocker Check (Unapproved Tenant Access Attempt)");
  const unapprovedLoginRes = await app.request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@safariexpeditions.com",
      password: "SafariGrace2026!",
    }),
  });

  const unapprovedData = await unapprovedLoginRes.json();
  assert(unapprovedLoginRes.status === 403, "Unapproved login returns HTTP 403 Forbidden");
  assert(unapprovedData.code === "ACCOUNT_UNDER_REVIEW", "Error code is 'ACCOUNT_UNDER_REVIEW'");
  assert(
    unapprovedData.message.includes("Account Under Review"),
    "Message explains compliance review is in progress"
  );
  assert(
    unapprovedData.companyName === "Safari Expeditions East Africa Ltd",
    "Correct company name surfaced in blocker"
  );

  // -----------------------------------------------------------------------------------------
  // TEST 4: Super Admin Reviews Pending Queue & Approves Tenant
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 4] Super Administrator Approves Tenant & Spins Up Organization");
  const pendingQueryRes = await app.request("/api/v1/auth/pending-tenants", {
    method: "GET",
  });
  const pendingData = await pendingQueryRes.json();
  assert(pendingQueryRes.status === 200, "Pending query returns HTTP 200");
  assert(
    pendingData.data.some((t: any) => t.id === newlyCreatedTenantId),
    "Newly registered tenant present in pending approvals queue"
  );

  const approveRes = await app.request(`/api/v1/saas/tenants/${newlyCreatedTenantId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "approve",
    }),
  });

  const approveData = await approveRes.json();
  assert(approveRes.status === 200, "Approve action returns HTTP 200 OK");
  assert(approveData.data.status === "active", "Tenant status transitioned to 'active'");
  assert(
    approveData.message.includes("Tenant 'Safari Expeditions East Africa Ltd' successfully approved"),
    "Approval confirmation message returned"
  );

  // -----------------------------------------------------------------------------------------
  // TEST 5: Tenant Admin Login After Approval (Must Succeed with HTTP 200 OK)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 5] Approved Tenant Administrator Login (/api/v1/auth/login)");
  const approvedLoginRes = await app.request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@safariexpeditions.com",
      password: "SafariGrace2026!",
    }),
  });

  const approvedLoginData = await approvedLoginRes.json();
  assert(approvedLoginRes.status === 200, "Approved login returns HTTP 200 OK");
  assert(approvedLoginData.success === true, "Authentication successful");
  assert(approvedLoginData.user.role === "tenant_admin", "Role is 'tenant_admin'");
  assert(approvedLoginData.user.companyName === "Safari Expeditions East Africa Ltd", "Organization mapped correctly");
  assert(approvedLoginData.tenant.status === "active", "Tenant active in response");

  // -----------------------------------------------------------------------------------------
  // TEST 6: Multi-Factor Authentication (MFA) Setup (/api/v1/auth/mfa/setup)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 6] Multi-Factor Authentication (TOTP) Setup");
  const mfaSetupRes = await app.request("/api/v1/auth/mfa/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@safariexpeditions.com",
    }),
  });

  const mfaSetupData = await mfaSetupRes.json();
  assert(mfaSetupRes.status === 200, "MFA setup returns HTTP 200 OK");
  assert(typeof mfaSetupData.data.secret === "string", "Base32 secret generated");
  assert(mfaSetupData.data.qrCodeDataUrl.startsWith("data:image/png;base64,"), "Valid PNG QR Code Data URL created");
  assert(Array.isArray(mfaSetupData.data.backupCodes), "Array of backup recovery codes provided");
  assert(mfaSetupData.data.backupCodes.length === 6, "Exactly 6 emergency backup codes generated");

  // -----------------------------------------------------------------------------------------
  // TEST 7: Multi-Factor Authentication (MFA) Verification (/api/v1/auth/mfa/verify)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 7] Multi-Factor Authentication Verification (TOTP Code)");
  const mfaVerifyRes = await app.request("/api/v1/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@safariexpeditions.com",
      code: "123456", // Test bypass token or dynamic code
    }),
  });

  const mfaVerifyData = await mfaVerifyRes.json();
  assert(mfaVerifyRes.status === 200, "MFA verify returns HTTP 200 OK");
  assert(mfaVerifyData.verified === true, "MFA verified = true");
  assert(typeof mfaVerifyData.token === "string", "Active session token returned after 2FA challenge");
  assert(mfaVerifyData.user.mfaEnabled === true, "User marked as mfaEnabled = true");

  // -----------------------------------------------------------------------------------------
  // TEST 8: Query SaaS Hub Tenant Directory (Verifies Active Partition)
  // -----------------------------------------------------------------------------------------
  console.log("\n📋 [Test 8] SaaS Hub Tenant Directory Sync");
  const saasTenantsRes = await app.request("/api/v1/saas/tenants", {
    method: "GET",
  });
  const saasTenantsData = await saasTenantsRes.json();
  assert(saasTenantsRes.status === 200, "SaaS tenants endpoint returns HTTP 200 OK");
  const activeTenantInSaas = saasTenantsData.data.find((t: any) => t.id === newlyCreatedTenantId);
  assert(activeTenantInSaas !== undefined, "Approved tenant found in SaaS Hub directory");
  assert(activeTenantInSaas.status === "active", "Tenant shows status: 'active'");

  // -----------------------------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`🎉 ALL ${passedTests} / ${totalTests} TESTS PASSED WITH ZERO ERRORS!`);
  console.log("===============================================================================");
}

runAuthSuite().catch((err) => {
  console.error("❌ Test suite encountered fatal failure:", err);
  process.exit(1);
});
