/**
 * =========================================================================================
 * SAAS MANAGEMENT, SUPABASE USER AUTH & ENTERPRISE DOCUMENT GOVERNANCE TEST SUITE
 * =========================================================================================
 * Tests:
 * 1. SaaS Tenant Onboarding, Subscription Billing & Lifecycle Actions
 * 2. Supabase Auth Team Management, Magic Link Invitations & Webhook Sync
 * 3. Document Governance: Unwanted File / Executable Magic Bytes Rejection
 * 4. Document Storage Optimization: Direct-to-Storage Presigned Uploads & Auto-Compression
 * =========================================================================================
 */

import { app } from "./app";

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

async function request(path: string, options: RequestInit = {}) {
  const url = `http://localhost${path}`;
  const defaultHeaders: Record<string, string> = {
    "X-Tenant-ID": "00000000-0000-0000-0000-000000000001",
    "X-Organization-ID": "org-mandela-kenya",
    "X-User-ID": "usr-admin-01",
    "X-User-Role": "super_admin",
    "Content-Type": "application/json",
  };

  const mergedHeaders = { ...defaultHeaders, ...(options.headers as Record<string, string>) };
  const res = await app.request(url, { ...options, headers: mergedHeaders });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function runSuite() {
  console.log("\n=================================================================================");
  console.log("  STARTING SAAS MANAGEMENT, SUPABASE USERS & DOCUMENT GOVERNANCE SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: SaaS Multi-Tenancy, Onboarding & Billing
  console.log("[SECTION 1] SaaS Multi-Tenancy Onboarding & Subscription Billing");
  {
    const listRes = await request("/api/v1/saas/tenants");
    assert(listRes.status === 200, "GET /api/v1/saas/tenants returns 200 OK");
    assert(listRes.data.data.some((t: any) => t.slug === "mandela-group"), "Includes Mandela Global Group tenant");

    const onboardRes = await request("/api/v1/saas/tenants/onboard", {
      method: "POST",
      body: JSON.stringify({
        name: "Acme Logistics East Africa Ltd",
        slug: "acme-logistics-ea",
        domain: "acmelogistics.co.ke",
        planTier: "enterprise",
        billingCycle: "monthly",
        seatLimit: 500,
        adminEmail: "ceo@acmelogistics.co.ke",
        adminFirstName: "Wanjiku",
        adminLastName: "Mwangi",
        countryCode: "KEN",
        currency: "USD",
      }),
    });
    assert(onboardRes.status === 201, "POST /api/v1/saas/tenants/onboard returns 201 Created");
    assert(onboardRes.data.data.subscription.status === "trialing", "New tenant initialized in 14-day trialing status");
    assert(onboardRes.data.data.subscription.totalBillingAmount === 2250.0, "Total billing calculated accurately (500 seats * $4.50 = $2,250)");

    const tenantId = onboardRes.data.data.id;
    const getTenantRes = await request(`/api/v1/saas/tenants/${tenantId}`);
    assert(getTenantRes.status === 200, "GET /api/v1/saas/tenants/:id returns 200 OK");
    assert(getTenantRes.data.data.onboarding.hasCompanyProfile === true, "Onboarding checklist initiated");

    // Action: Upgrade Seats
    const upgradeRes = await request(`/api/v1/saas/tenants/${tenantId}/actions`, {
      method: "POST",
      body: JSON.stringify({
        action: "upgrade_seats",
        seatLimit: 750,
      }),
    });
    assert(upgradeRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (upgrade_seats) returns 200 OK");
    assert(upgradeRes.data.data.subscription.seatLimit === 750, "Seat limit upgraded to 750");

    // Action: Suspend Tenant
    const suspendRes = await request(`/api/v1/saas/tenants/${tenantId}/actions`, {
      method: "POST",
      body: JSON.stringify({
        action: "suspend",
        reason: "Compliance review pending",
      }),
    });
    assert(suspendRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (suspend) returns 200 OK");
    assert(suspendRes.data.data.status === "suspended", "Tenant status updated to suspended");

    // Action: Reactivate Tenant
    const reactivateRes = await request(`/api/v1/saas/tenants/${tenantId}/actions`, {
      method: "POST",
      body: JSON.stringify({
        action: "reactivate",
      }),
    });
    assert(reactivateRes.status === 200, "POST /api/v1/saas/tenants/:id/actions (reactivate) returns 200 OK");
    assert(reactivateRes.data.data.status === "active", "Tenant status restored to active");

    // Invoices & Subscriptions
    const subsRes = await request("/api/v1/saas/billing/subscriptions");
    assert(subsRes.status === 200, "GET /api/v1/saas/billing/subscriptions returns 200 OK");
    assert(subsRes.data.data.length >= 2, "Subscriptions overview populated");

    const invRes = await request("/api/v1/saas/billing/invoices/generate", {
      method: "POST",
      body: JSON.stringify({
        tenantId,
        billingPeriodStart: "2026-10-01",
        billingPeriodEnd: "2026-10-31",
        subtotalAmount: 3375.0,
        taxAmount: 540.0,
        currency: "USD",
      }),
    });
    assert(invRes.status === 201, "POST /api/v1/saas/billing/invoices/generate returns 201 Created");
    assert(invRes.data.data.invoiceNumber.startsWith("INV-"), "Generated formatted invoice number");
    assert(invRes.data.data.totalAmount === 3915.0, "Total invoice amount includes tax (3375 + 540 = 3915)");

    const usageRes = await request(`/api/v1/saas/tenants/${tenantId}/usage`);
    assert(usageRes.status === 200, "GET /api/v1/saas/tenants/:id/usage returns 200 OK");
    assert(usageRes.data.data.seats.availableSeats === 749, "Available seats tracked (750 - 1 = 749)");
  }

  // SECTION 2: Team & User Management (Supabase Auth Integration)
  console.log("\n[SECTION 2] Team & User Management (Supabase Auth Integration)");
  {
    const usersRes = await request("/api/v1/users");
    assert(usersRes.status === 200, "GET /api/v1/users returns 200 OK");
    assert(usersRes.data.data.some((u: any) => u.role === "SUPER_ADMIN"), "Includes Super Admin user");
    assert(usersRes.data.data.some((u: any) => u.role === "HR_MANAGER"), "Includes HR Manager user");

    const inviteRes = await request("/api/v1/users/invite", {
      method: "POST",
      body: JSON.stringify({
        email: "plant.engineer@mandela.co.ke",
        roleSlug: "STATION_SUPERVISOR",
        organizationName: "Nairobi Industrial Plant",
        expiresInDays: 7,
      }),
    });
    assert(inviteRes.status === 201, "POST /api/v1/users/invite returns 201 Created");
    assert(inviteRes.data.data.inviteToken.startsWith("inv_tok_"), "Generated secure invite token");
    assert(inviteRes.data.data.supabaseMagicLink.includes("auth.zuri.africa"), "Generated Supabase Auth magic link");

    const invsListRes = await request("/api/v1/users/invitations");
    assert(invsListRes.status === 200, "GET /api/v1/users/invitations returns 200 OK");
    assert(invsListRes.data.data.some((i: any) => i.email === "plant.engineer@mandela.co.ke"), "Invitation recorded in pending status");

    // Supabase Webhook Sync (user.created)
    const newSupabaseUserId = "b2222222-3333-4444-5555-666666666661";
    const syncRes = await request("/api/v1/users/supabase-sync", {
      method: "POST",
      body: JSON.stringify({
        event: "user.created",
        supabaseUserId: newSupabaseUserId,
        email: "plant.engineer@mandela.co.ke",
        userMetadata: {
          first_name: "Kennedy",
          last_name: "Omondi",
          role: "STATION_SUPERVISOR",
          organization_name: "Nairobi Industrial Plant",
        },
      }),
    });
    assert(syncRes.status === 201, "POST /api/v1/users/supabase-sync (user.created) returns 201 Created");
    assert(syncRes.data.data.supabaseSynced === true, "User synchronized directly with Supabase Auth ID");

    // Role Update
    const updateRoleRes = await request(`/api/v1/users/${newSupabaseUserId}/role`, {
      method: "PATCH",
      body: JSON.stringify({
        roleSlug: "HR_MANAGER",
      }),
    });
    assert(updateRoleRes.status === 200, "PATCH /api/v1/users/:id/role returns 200 OK");
    assert(updateRoleRes.data.data.role === "HR_MANAGER", "User role elevated to HR_MANAGER");

    // Status Toggle (Suspend)
    const suspendUserRes = await request(`/api/v1/users/${newSupabaseUserId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        isActive: false,
      }),
    });
    assert(suspendUserRes.status === 200, "PATCH /api/v1/users/:id/status returns 200 OK");
    assert(suspendUserRes.data.data.isActive === false, "User account suspended");
  }

  // SECTION 3: Enterprise Document Governance, Threat Scanning & Auto-Compression
  console.log("\n[SECTION 3] Document Governance, Threat Screening & Auto-Compression");
  {
    // Test 1: Reject Blacklisted Executable Extension (.exe)
    const badExtRes = await request("/api/v1/documents/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: "malware_payload.exe",
        fileSizeBytes: 2048500,
        mimeType: "application/x-msdownload",
      }),
    });
    assert(badExtRes.status === 422, "POST /api/v1/documents/presign-upload rejects .exe with 422 Unprocessable");
    assert(badExtRes.data.securityBlocked === true, "Security policy blocked executable upload");

    // Test 2: Reject Unapproved MIME Type (.sh script)
    const badMimeRes = await request("/api/v1/documents/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: "hack_script.sh",
        fileSizeBytes: 1240,
        mimeType: "application/x-sh",
      }),
    });
    assert(badMimeRes.status === 422, "POST /api/v1/documents/presign-upload rejects script with 422 Unprocessable");
    assert(badMimeRes.data.securityBlocked === true, "Security policy blocked script MIME type");

    // Test 3: Reject Disguised Executable with MZ Magic Bytes (malware renamed to .pdf)
    const fakePdfRes = await request("/api/v1/documents/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: "disguised_contract.pdf",
        fileSizeBytes: 1048576,
        mimeType: "application/pdf",
        magicBytesHex: "4d5a90000300000004000000ffff0000", // MZ executable header
      }),
    });
    assert(fakePdfRes.status === 422, "POST /api/v1/documents/presign-upload rejects disguised MZ executable with 422");
    assert(fakePdfRes.data.error.includes("Executable binary header (MZ) detected"), "Magic bytes inspection caught masked executable");

    // Test 4: Approve Legitimate Employment Contract PDF
    const goodDocRes = await request("/api/v1/documents/presign-upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: "signed_employment_agreement_2026.pdf",
        fileSizeBytes: 2450000,
        mimeType: "application/pdf",
        documentType: "contract",
      }),
    });
    assert(goodDocRes.status === 201, "POST /api/v1/documents/presign-upload approves valid contract with 201 Created");
    assert(goodDocRes.data.securityCleared === true, "Document cleared security screening");
    assert(goodDocRes.data.data.presignedUploadUrl.includes("supabase-storage.zuri.africa"), "Presigned direct upload URL generated for Supabase Storage");

    // Test 5: Automated Compression Pipeline on High-Res Camera Scan (10MB Image -> WebP)
    const optImgRes = await request("/api/v1/documents/optimize", {
      method: "POST",
      body: JSON.stringify({
        originalFileName: "national_id_front_camera_scan.png",
        originalFileSizeBytes: 10485760, // 10 MB
        mimeType: "image/png",
      }),
    });
    assert(optImgRes.status === 200, "POST /api/v1/documents/optimize on 10MB image returns 200 OK");
    assert(optImgRes.data.data.outputFormat === "image/webp", "Image transcoded to modern WebP format");
    assert(optImgRes.data.data.compressionRatioPercent > 90, "Image compressed by over 90% (from 10MB down to ~570KB)");
    assert(optImgRes.data.data.bytesSaved > 9000000, "Saved over 9 MB of storage on a single document");

    // Test 6: Automated Compression Pipeline on Scanned PDF (20MB Scan -> Downsampled Linearized PDF)
    const optPdfRes = await request("/api/v1/documents/optimize", {
      method: "POST",
      body: JSON.stringify({
        originalFileName: "mining_environmental_safety_audit.pdf",
        originalFileSizeBytes: 20971520, // 20 MB
        mimeType: "application/pdf",
      }),
    });
    assert(optPdfRes.status === 200, "POST /api/v1/documents/optimize on 20MB PDF returns 200 OK");
    assert(optPdfRes.data.data.isLinearized === true, "PDF linearized for web fast-streaming");
    assert(optPdfRes.data.data.compressionRatioPercent >= 80, "PDF scan downsampled with ~84% storage reduction");

    // Test 7: Storage Quota & Telemetry Metrics
    const metricsRes = await request("/api/v1/documents/storage-metrics");
    assert(metricsRes.status === 200, "GET /api/v1/documents/storage-metrics returns 200 OK");
    assert(metricsRes.data.data.tenantStorageAllowanceGb === 50.0, "Tenant storage allowance is 50 GB");
    assert(metricsRes.data.data.totalBytesSavedByCompression > 0, "Compression savings tracked in telemetry");
    assert(metricsRes.data.data.deduplicatedObjectsCount >= 200, "Deduplicated objects verified");
  }

  console.log("\n=================================================================================");
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
  console.log("=================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
