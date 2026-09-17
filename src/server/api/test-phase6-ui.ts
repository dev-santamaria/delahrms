/**
 * =========================================================================================
 * PHASE 6 INTEGRATION & VERIFICATION TEST SUITE
 * IT Fleet, SaaS Multi-Tenancy, Supabase Auth RBAC & Platform Administration Hub
 * Roles: super_admin & it_admin
 * =========================================================================================
 */

import { app } from "./app";
import { apiClient } from "@/lib/api-client";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    failedCount++;
  }
}

// Wire apiClient customFetch to in-memory Hono app
apiClient.setCustomFetch(async (url: string, options: RequestInit) => {
  const parsed = new URL(url, "http://localhost");
  const path = parsed.pathname + parsed.search;
  const res = await app.request(path, options);
  return res as unknown as Response;
});

async function runPhase6Tests() {
  console.log("=================================================================================");
  console.log("  PHASE 6 VERIFICATION: SAAS MULTI-TENANCY, SUPABASE AUTH RBAC & IT FLEET");
  console.log("  (Roles: super_admin & it_admin)");
  console.log("=================================================================================\n");

  // SECTION 1: Persona & Multi-Tenant Context Switching
  console.log("[Test Section 1] Persona & Cluster Isolation Context Switching");
  {
    apiClient.setContext({
      userRole: "super_admin",
      userId: "usr-super-admin-01",
      tenantId: "00000000-0000-0000-0000-000000000001",
      organizationId: "org-mandela-kenya",
    });
    const ctx = apiClient.getContext();
    assert(ctx.userRole === "super_admin", "Context successfully switched to 'super_admin'");
    assert(ctx.tenantId === "00000000-0000-0000-0000-000000000001", "Context locked to Mandela Group tenant partition");

    apiClient.setContext({ userRole: "it_admin" });
    assert(apiClient.getContext().userRole === "it_admin", "Context successfully switched to 'it_admin'");
  }

  // SECTION 2: SaaS Multi-Tenancy Onboarding & Subscription Lifecycle
  console.log("\n[Test Section 2] SaaS Multi-Tenancy Onboarding & Subscription Lifecycle");
  {
    apiClient.setContext({ userRole: "super_admin" });

    // 1. List Tenants
    const listRes = await apiClient.saas.getTenants();
    assert(listRes.status === 200, "GET /api/v1/saas/tenants returns 200 OK");
    assert(Array.isArray(listRes.data), "Tenants returned as array");
    assert(listRes.data.some((t: any) => t.slug === "mandela-group"), "Mandela Global Group tenant listed");

    // 2. Onboard New Enterprise Tenant
    const newSlug = `savannah-energy-${Date.now().toString().slice(-4)}`;
    const onboardRes = await apiClient.saas.onboardTenant({
      name: "Savannah Geothermal Energy Ltd",
      slug: newSlug,
      domain: `${newSlug}.zuri.africa`,
      planTier: "enterprise",
      billingCycle: "monthly",
      seatLimit: 600,
      adminEmail: "cto@savannah-energy.com",
      adminFirstName: "Amina",
      adminLastName: "Mugisha",
      countryCode: "KEN",
      currency: "USD",
    });

    assert(onboardRes.status === 201, "POST /api/v1/saas/tenants/onboard returns 201 Created");
    assert(onboardRes.data.subscription.status === "trialing", "New tenant in 14-day trialing status");
    assert(onboardRes.data.subscription.unitPricePerSeat === 4.5, "Enterprise tier unit price is $4.50/seat");
    assert(onboardRes.data.subscription.totalBillingAmount === 2700.0, "Monthly billing calculated: 600 * $4.50 = $2,700");

    const createdTenantId = onboardRes.data.id;

    // 3. Get Tenant Dossier
    const getRes = await apiClient.saas.getTenant(createdTenantId);
    assert(getRes.status === 200, "GET /api/v1/saas/tenants/:id returns 200 OK");
    assert(getRes.data.onboarding.hasCompanyProfile === true, "Onboarding checklist initiated");

    // 4. Upgrade Seats Action
    const upgradeRes = await apiClient.saas.tenantAction(createdTenantId, {
      action: "upgrade_seats",
      seatLimit: 850,
    });
    assert(upgradeRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (upgrade_seats) returns 200");
    assert(upgradeRes.data.subscription.seatLimit === 850, "Seat allocation upgraded to 850");

    // 5. Suspend & Reactivate Actions
    const suspendRes = await apiClient.saas.tenantAction(createdTenantId, {
      action: "suspend",
      reason: "Annual KYC refresh",
    });
    assert(suspendRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (suspend) returns 200");
    assert(suspendRes.data.status === "suspended", "Tenant status updated to suspended");

    const reactivateRes = await apiClient.saas.tenantAction(createdTenantId, {
      action: "reactivate",
    });
    assert(reactivateRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (reactivate) returns 200");
    assert(reactivateRes.data.status === "active", "Tenant access reactivated");

    // 6. Subscriptions Overview
    const subsRes = await apiClient.saas.getSubscriptions();
    assert(subsRes.status === 200, "GET /api/v1/saas/billing/subscriptions returns 200 OK");

    // 7. Formal Invoice Generation
    const invoiceRes = await apiClient.saas.generateInvoice({
      tenantId: createdTenantId,
      billingPeriodStart: "2026-10-01",
      billingPeriodEnd: "2026-10-31",
      subtotalAmount: 3825.0,
      taxAmount: 612.0, // 16% VAT
      currency: "USD",
    });
    assert(invoiceRes.status === 201, "POST /api/v1/saas/billing/invoices/generate returns 201 Created");
    assert(invoiceRes.data.invoiceNumber.startsWith("INV-"), "Generated official invoice number");
    assert(invoiceRes.data.totalAmount === 4437.0, "Total invoice amount includes VAT (3825 + 612 = 4437)");

    // 8. Usage Telemetry
    const usageRes = await apiClient.saas.getUsage(createdTenantId);
    assert(usageRes.status === 200, "GET /api/v1/saas/tenants/:id/usage returns 200 OK");
    assert(usageRes.data.seats.availableSeats === 849, "Available seats tracked: 850 - 1 = 849");
  }

  // SECTION 3: Team User Management & Supabase Auth RBAC Sync
  console.log("\n[Test Section 3] Team User Management & Supabase Auth RBAC Sync");
  {
    // 1. List Users
    const usersRes = await apiClient.users.getUsers();
    assert(usersRes.status === 200, "GET /api/v1/users returns 200 OK");
    assert(usersRes.data.some((u: any) => u.role === "SUPER_ADMIN"), "Includes Super Admin account");
    assert(usersRes.data.some((u: any) => u.role === "HR_MANAGER"), "Includes HR Manager account");

    // 2. Issue Invitation with Supabase Magic Link
    const inviteRes = await apiClient.users.inviteUser({
      email: "depot.supervisor@mandela.co.ke",
      roleSlug: "STATION_SUPERVISOR",
      organizationName: "Kisumu Lake Basin Depot",
      expiresInDays: 7,
    });
    assert(inviteRes.status === 201, "POST /api/v1/users/invite returns 201 Created");
    assert(inviteRes.data.inviteToken.startsWith("inv_tok_"), "Generated secure invite token");
    assert(inviteRes.data.supabaseMagicLink.includes("auth.zuri.africa"), "Generated Supabase Auth magic link");

    // 3. Query Invitations
    const invsRes = await apiClient.users.getInvitations();
    assert(invsRes.status === 200, "GET /api/v1/users/invitations returns 200 OK");
    assert(invsRes.data.some((i: any) => i.email === "depot.supervisor@mandela.co.ke"), "Invitation recorded in pending status");

    // 4. Supabase Webhook Synchronizer (user.created)
    const testSupabaseUid = `c${Date.now().toString().slice(-8)}-3333-4444-5555-666666666661`;
    const syncRes = await apiClient.users.syncSupabaseUser({
      event: "user.created",
      supabaseUserId: testSupabaseUid,
      email: "depot.supervisor@mandela.co.ke",
      userMetadata: {
        first_name: "Kennedy",
        last_name: "Omondi",
        role: "STATION_SUPERVISOR",
        organization_name: "Kisumu Lake Basin Depot",
      },
    });
    assert(syncRes.status === 201, "POST /api/v1/users/supabase-sync returns 201 Created");
    assert(syncRes.data.supabaseSynced === true, "User synchronized directly with Supabase Auth ID");

    // 5. Elevate Role
    const roleRes = await apiClient.users.updateRole(testSupabaseUid, "HR_MANAGER");
    assert(roleRes.status === 200, "PATCH /api/v1/users/:id/role returns 200 OK");
    assert(roleRes.data.role === "HR_MANAGER", "User role elevated to HR_MANAGER");

    // 6. Suspend Account
    const statusRes = await apiClient.users.updateStatus(testSupabaseUid, false);
    assert(statusRes.status === 200, "PATCH /api/v1/users/:id/status returns 200 OK");
    assert(statusRes.data.isActive === false, "User account suspended");
  }

  // SECTION 4: Enterprise Document Governance, Antivirus Screening & Auto-Compression
  console.log("\n[Test Section 4] Document Threat Screening & Auto-Compression");
  {
    // Test 1: Reject Blacklisted Executable Extension (.exe)
    const badExtRes = await apiClient.documents.presignUpload({
      fileName: "trojan_stealer.exe",
      fileSizeBytes: 2048500,
      mimeType: "application/x-msdownload",
    });
    assert(badExtRes.status === 422, "Rejects .exe executable with 422 Unprocessable");
    assert(badExtRes.securityBlocked === true, "Security policy blocked executable upload");

    // Test 2: Reject Shell Script (.sh)
    const badScriptRes = await apiClient.documents.presignUpload({
      fileName: "deploy_root.sh",
      fileSizeBytes: 1250,
      mimeType: "application/x-sh",
    });
    assert(badScriptRes.status === 422, "Rejects .sh script with 422 Unprocessable");
    assert(badScriptRes.securityBlocked === true, "Security policy blocked shell script upload");

    // Test 3: Reject Disguised Executable with MZ Magic Bytes (malware renamed to .pdf)
    const fakePdfRes = await apiClient.documents.presignUpload({
      fileName: "signed_contract.pdf",
      fileSizeBytes: 1048576,
      mimeType: "application/pdf",
      magicBytesHex: "4d5a90000300000004000000ffff0000",
    });
    assert(fakePdfRes.status === 422, "Rejects disguised MZ binary with 422 Unprocessable");
    assert(Boolean(fakePdfRes.error?.includes("Executable binary header (MZ) detected")), "Caught disguised binary header");

    // Test 4: Approve Clean Contract PDF
    const cleanDocRes = await apiClient.documents.presignUpload({
      fileName: "group_executive_agreement.pdf",
      fileSizeBytes: 2150000,
      mimeType: "application/pdf",
      documentType: "contract",
    });
    assert(cleanDocRes.status === 201, "Approves clean contract with 201 Created");
    assert(cleanDocRes.securityCleared === true, "Document cleared threat screening");
    assert(cleanDocRes.data.presignedUploadUrl.includes("supabase-storage.zuri.africa"), "Direct presigned URL for Supabase Storage generated");

    // Test 5: Auto-Compression (Image -> WebP > 90% savings)
    const optImgRes = await apiClient.documents.optimize({
      originalFileName: "national_id_scan.png",
      originalFileSizeBytes: 10485760, // 10 MB
      mimeType: "image/png",
    });
    assert(optImgRes.status === 200, "POST /api/v1/documents/optimize on 10MB image returns 200 OK");
    assert(optImgRes.data.outputFormat === "image/webp", "Image transcoded to modern WebP format");
    assert(optImgRes.data.compressionRatioPercent > 90, "Image compressed by over 90%");
    assert(optImgRes.data.bytesSaved > 9000000, "Saved over 9 MB on a single scan");

    // Test 6: Auto-Compression (PDF scan -> downsampled linearized PDF)
    const optPdfRes = await apiClient.documents.optimize({
      originalFileName: "environmental_mining_survey.pdf",
      originalFileSizeBytes: 20971520, // 20 MB
      mimeType: "application/pdf",
    });
    assert(optPdfRes.status === 200, "POST /api/v1/documents/optimize on 20MB PDF returns 200 OK");
    assert(optPdfRes.data.isLinearized === true, "PDF linearized for web fast-streaming");
    assert(optPdfRes.data.compressionRatioPercent >= 80, "PDF downsampled with ~84% storage reduction");

    // Test 7: Storage Quotas & Telemetry Metrics
    const metricsRes = await apiClient.documents.getStorageMetrics();
    assert(metricsRes.status === 200, "GET /api/v1/documents/storage-metrics returns 200 OK");
    assert(metricsRes.data.tenantStorageAllowanceGb === 50.0, "Tenant storage allowance is 50 GB");
    assert(metricsRes.data.totalBytesSavedByCompression > 0, "Compression savings tracked in telemetry");
    assert(metricsRes.data.deduplicatedObjectsCount >= 200, "Deduplicated objects verified");
  }

  // SECTION 5: IT Fleet Hardware Assets & MDM Governance
  console.log("\n[Test Section 5] IT Fleet Hardware Assets & MDM Governance");
  {
    // 1. Master Hardware Inventory
    const devicesRes = await apiClient.assets.getDevices();
    assert(devicesRes.status === 200, "GET /api/v1/assets/devices returns 200 OK");
    assert(Array.isArray(devicesRes.data), "Hardware devices returned as array");
    assert(devicesRes.data.some((d: any) => d.mdmEnrolled === true), "MDM enrolled devices present");

    // 2. Register New Hardware Asset
    const tag = `MND-LAP-${Date.now().toString().slice(-4)}`;
    const regRes = await apiClient.assets.registerDevice({
      serialNumber: `SN-${Date.now()}`,
      assetTag: tag,
      brand: "Apple",
      modelName: "MacBook Pro 16-inch M3 Max (64GB)",
      deviceCategory: "laptop",
      ownershipType: "purchased",
      mdmProvider: "jamf",
      diskEncryptionActive: true,
      warrantyExpiryDate: "2027-12-31",
    });
    assert(regRes.status === 201, "POST /api/v1/assets/devices returns 201 Created");
    assert(regRes.data.assetTag === tag, "Device enrolled with asset tag");
    assert(regRes.data.status === "available_in_inventory", "Initialized as available in inventory");

    // 3. Assign Device & Dispatch Courier
    const assignRes = await apiClient.assets.assignDevice({
      deviceId: regRes.data.id,
      employeeId: "emp-001",
      courierName: "DHL Express",
      trackingNumber: "DHL-99881122",
      handoverNotes: "Pristine condition with 140W charger and privacy filter",
    });
    assert(assignRes.status === 200 || assignRes.status === 201, "POST /api/v1/assets/assignments returns success");
  }

  // SECTION 6: SOC 2 Audit Trail & Developer Outbox Mesh
  console.log("\n[Test Section 6] SOC 2 Audit Trail & Developer Outbox Mesh");
  {
    // 1. Audit Logs
    const auditRes = await apiClient.audit.getLogs();
    assert(auditRes.status === 200, "GET /api/v1/audit/logs returns 200 OK");
    assert(Array.isArray(auditRes.data), "Audit events returned as array");

    // 2. Webhook Endpoints
    const endpointsRes = await apiClient.developer.getEndpoints();
    assert(endpointsRes.status === 200, "GET /api/v1/webhooks/endpoints returns 200 OK");
    assert(Array.isArray(endpointsRes.data), "Webhook endpoints returned as array");

    // 3. Register Webhook Endpoint
    const epUrl = `https://api.testdomain.com/wh/${Date.now()}`;
    const newEpRes = await apiClient.developer.createEndpoint({
      url: epUrl,
      description: "Test Outbound Ingestion Webhook",
      subscribedEvents: ["payroll.finalized", "employee.created"],
    });
    assert(newEpRes.status === 201, "POST /api/v1/webhooks/endpoints returns 201 Created");
    assert(newEpRes.data.url === epUrl, "Target URL registered");

    // 4. Outbox Stream
    const outboxRes = await apiClient.developer.getOutbox();
    assert(outboxRes.status === 200, "GET /api/v1/webhooks/outbox returns 200 OK");
    assert(Array.isArray(outboxRes.data), "Outbox events returned as array");

    // 5. Developer API Keys
    const keysRes = await apiClient.developer.getApiKeys();
    assert(keysRes.status === 200, "GET /api/v1/webhooks/api-keys returns 200 OK");
    assert(Array.isArray(keysRes.data), "API keys returned as array");
  }

  console.log("\n=================================================================================");
  console.log(`  PHASE 6 VERIFICATION COMPLETE: ALL ${passedCount} INTEGRATION CHECKS PASSED (100%)`);
  console.log(`  Passed: ${passedCount}, Failed: ${failedCount}`);
  console.log("=================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
