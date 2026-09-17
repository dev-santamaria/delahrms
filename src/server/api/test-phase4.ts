/**
 * =========================================================================================
 * PHASE 4 AUTOMATED INTEGRATION TEST SUITE: MOBILITY, TRAVEL, IT ASSETS & STATUTORY FILINGS
 * =========================================================================================
 * Comprehensive test coverage verifying:
 * 1. Global Mobility (Visa Catalog, Relocation Cases, Legal Checklists, 183-Day Tax Residency)
 * 2. Corporate Travel (Per Diem Policies, Pre-Trip Requests, Non-Payroll Advances, Reconciliations)
 * 3. IT Assets & SaaS Access (Hardware Fleet, MDM Encryption, Custody Handover, License Grants, Tickets)
 * 4. Statutory Filings & Remittances (Agency Returns, KRA PRN Tracking, Third-Party SACCO/Insurance Batches)
 * =========================================================================================
 */

import { app } from "./app";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`, details || "");
  }
}

async function runPhase4Tests() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 4: MOBILITY, TRAVEL, IT ASSETS & STATUTORY REMITTANCES TEST SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: Global Mobility & 183-Day Tax Residency
  console.log("\x1b[1m[SECTION 1] Global Mobility, Visa Sponsorship & 183-Day Tax Residency\x1b[0m");
  {
    // 1a. List global visa catalog
    const visaRes = await app.request("/api/v1/mobility/visas");
    const visaData = await visaRes.json();
    assert(visaRes.status === 200, "GET /api/v1/mobility/visas returns 200 OK");
    assert(visaData.count >= 3, "Visa catalog includes Kenya Class D, Uganda G2 & Tanzania Class B");

    // 1b. Create relocation case
    const caseRes = await app.request("/api/v1/mobility/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-004", // Jean-Pierre Dubois
        visaTypeId: "visa-tza-class-b",
        originCountryCode: "FRA",
        destinationCountryCode: "TZA",
        targetRelocationDate: "2026-11-01",
        sponsoringEntityName: "Mandela Mining Operations Tanzania Ltd",
        assignedLegalCounsel: "Bowmans East Africa Legal LLP",
      }),
    });
    const caseData = await caseRes.json();
    assert(caseRes.status === 201, "POST /api/v1/mobility/cases returns 201 Created");
    assert(caseData.data.caseNumber.startsWith("IMM-2026-"), "Immigration case tracking number generated");
    assert(caseData.data.status === "document_collection", "Case initialized in 'document_collection' status");

    const caseId = caseData.data.id;

    // 1c. Upload case document
    const docRes = await app.request(`/api/v1/mobility/cases/${caseId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType: "police_clearance",
        title: "Interpol Certificate of Good Conduct",
        fileUrl: "https://storage.zuri.africa/legal-docs/interpol_dubois.pdf",
      }),
    });
    const docData = await docRes.json();
    assert(docRes.status === 201, "POST /api/v1/mobility/cases/:id/documents returns 201 Created");
    assert(docData.data.status === "under_review", "Uploaded document placed under legal review");

    const docId = docData.data.id;

    // 1d. Legal counsel verifies document
    const verifyDocRes = await app.request(`/api/v1/mobility/cases/${caseId}/documents/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "verified",
        notes: "Verified with Interpol National Central Bureau",
      }),
    });
    const verifyDocData = await verifyDocRes.json();
    assert(verifyDocRes.status === 200, "PATCH /api/v1/mobility/cases/:id/documents/:docId returns 200 OK");
    assert(verifyDocData.data.status === "verified", "Document marked as verified");

    // 1e. Add dependent spouse for visa sponsorship
    const depRes = await app.request(`/api/v1/mobility/cases/${caseId}/dependents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Claire",
        lastName: "Dubois",
        relationship: "spouse",
        dateOfBirth: "1989-04-12",
        passportNumber: "FRA-99201928",
      }),
    });
    const depData = await depRes.json();
    assert(depRes.status === 201, "POST /api/v1/mobility/cases/:id/dependents returns 201 Created");
    assert(depData.data.relationship === "spouse", "Spouse registered for visa sponsorship");

    // 1f. Log physical cross-border presence triggering 183-day rule
    const logPresRes = await app.request("/api/v1/mobility/presence/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-004",
        countryCode: "TZA",
        entryDate: "2026-07-01",
        exitDate: "2026-07-20",
        daysSpent: 20, // 166 prior + 20 = 186 days (exceeds 183 days!)
      }),
    });
    const logPresData = await logPresRes.json();
    assert(logPresRes.status === 201, "POST /api/v1/mobility/presence/log returns 201 Created");
    assert(logPresData.data.cumulativeDaysYearToDate === 186, "Cumulative days calculated accurately as 186 days");
    assert(logPresData.data.isTaxResidencyTriggered === true, "Statutory tax residency triggered (>= 183 days)");

    // 1g. Query tax compliance status
    const statusRes = await app.request("/api/v1/mobility/presence/emp-004/status");
    const statusData = await statusRes.json();
    assert(statusRes.status === 200, "GET /api/v1/mobility/presence/:id/status returns 200 OK");
    const tzaStatus = statusData.countryBreakdown.find((c: any) => c.countryCode === "TZA");
    assert(tzaStatus.isTaxResident === true, "Employee confirmed as Tax Resident in Tanzania");
  }

  // SECTION 2: Corporate Travel, Per Diem & Cash Advances
  console.log("\n\x1b[1m[SECTION 2] Corporate Travel, Per Diem & Non-Payroll Cash Advance Reconciliation\x1b[0m");
  {
    // 2a. Query per diem policies
    const policyRes = await app.request("/api/v1/travel/policies");
    const policyData = await policyRes.json();
    assert(policyRes.status === 200, "GET /api/v1/travel/policies returns 200 OK");
    assert(policyData.count >= 4, "Policies configured for Kenya, Uganda, Tanzania, and South Africa");

    // 2b. Submit travel authorization with automated Per Diem calculation
    // 5 days in Uganda (USD 60 meals + 150 hotel + 25 incidentals = USD 235/day * 5 = USD 1,175)
    const reqRes = await app.request("/api/v1/travel/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-001",
        title: "Regional Banking Integration Summit",
        businessPurpose: "Negotiate institutional SACCO check-off settlement integration with central banking rails.",
        tripType: "regional_cross_border",
        originCountryCode: "KEN",
        originCity: "Nairobi",
        destinationCountryCode: "UGA",
        destinationCity: "Kampala",
        departureDate: "2026-10-05",
        returnDate: "2026-10-10",
        totalDays: 5,
        estimatedFlightAmount: 450.0,
        isCashAdvanceRequested: true,
      }),
    });
    const reqData = await reqRes.json();
    assert(reqRes.status === 201, "POST /api/v1/travel/requests returns 201 Created");
    assert(reqData.data.estimatedPerDiemAmount === 1175.0, "Per Diem calculated automatically as USD 1,175 (5d * USD 235)");
    assert(reqData.data.cashAdvanceAmount === 1175.0, "Cash advance requested for allowable Per Diem amount");

    const travelRequestId = reqData.data.id;

    // 2c. Authorize travel request
    const approveRes = await app.request(`/api/v1/travel/requests/${travelRequestId}/approve`, {
      method: "POST",
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, "POST /api/v1/travel/requests/:id/approve returns 200 OK");
    assert(approveData.data.status === "approved", "Travel request approved");

    // 2d. Disburse non-payroll cash advance immediately via Bank EFT
    const disburseRes = await app.request(`/api/v1/travel/requests/${travelRequestId}/disburse-advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disbursedAmount: 1175.0,
        disbursementMethod: "bank_eft",
        disbursementReference: "EFT-STANBIC-99881122",
      }),
    });
    const disburseData = await disburseRes.json();
    assert(disburseRes.status === 200, "POST /api/v1/travel/requests/:id/disburse-advance returns 200 OK");
    assert(disburseData.data.status === "advance_disbursed", "Advance marked as disbursed bypassing payroll");

    // 2e. Post-trip expense reconciliation
    // Advance received: 1175; Allowable Per Diem: 1175; Actual verified local taxi/meeting room: 150
    // Net settlement variance: (1175 + 150) - 1175 = +150 (Company owes employee USD 150 reimbursement)
    const recRes = await app.request("/api/v1/travel/reconciliations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        travelRequestId: travelRequestId,
        employeeId: "emp-001",
        totalAdvanceReceived: 1175.0,
        totalAllowablePerDiem: 1175.0,
        totalActualVerifiedExpenses: 150.0,
        currency: "USD",
      }),
    });
    const recData = await recRes.json();
    assert(recRes.status === 201, "POST /api/v1/travel/reconciliations returns 201 Created");
    assert(recData.data.netSettlementVariance === 150.0, "Net variance calculates USD 150 due to employee");
    assert(recData.data.settlementDisposition.includes("Company owes employee"), "Disposition correctly flags company reimbursement");

    const recId = recData.data.id;

    // 2f. Settle reconciliation variance
    const settleRes = await app.request(`/api/v1/travel/reconciliations/${recId}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settlementReference: "EFT-REIMBURSE-4401" }),
    });
    const settleData = await settleRes.json();
    assert(settleRes.status === 200, "POST /api/v1/travel/reconciliations/:id/settle returns 200 OK");
    assert(settleData.data.status === "settled", "Reconciliation finalized with status 'settled'");
  }

  // SECTION 3: IT Asset Management & SaaS Access Grants
  console.log("\n\x1b[1m[SECTION 3] IT Asset Management, Hardware Custody & SaaS Access Governance\x1b[0m");
  {
    // 3a. List fleet hardware inventory
    const devListRes = await app.request("/api/v1/assets/devices");
    const devListData = await devListRes.json();
    assert(devListRes.status === 200, "GET /api/v1/assets/devices returns 200 OK");
    assert(devListData.count >= 3, "Hardware fleet inventory listed (MacBook Pro M3, ThinkPad P1, Starlink Terminal)");

    // 3b. Register hardware asset
    const regDevRes = await app.request("/api/v1/assets/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serialNumber: "C02H999XYZ1",
        assetTag: "MND-LAP-042",
        brand: "Apple",
        modelName: "MacBook Pro 14-inch M3 Pro (36GB RAM, 1TB SSD)",
        deviceCategory: "laptop",
        ownershipType: "purchased",
        mdmProvider: "jamf",
        diskEncryptionActive: true,
      }),
    });
    const regDevData = await regDevRes.json();
    assert(regDevRes.status === 201, "POST /api/v1/assets/devices returns 201 Created");
    assert(regDevData.data.assetTag === "MND-LAP-042", "Device registered with asset tag MND-LAP-042");
    assert(regDevData.data.mdmEnrolled === true, "MDM enrollment verified via Jamf");

    const deviceId = regDevData.data.id;

    // 3c. Handover custody to employee
    const assignDevRes = await app.request("/api/v1/assets/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: deviceId,
        employeeId: "emp-002",
        courierName: "Fargo Courier",
        trackingNumber: "FRG-2026-9901",
        handoverNotes: "Assigned for Principal Architecture role",
      }),
    });
    const assignDevData = await assignDevRes.json();
    assert(assignDevRes.status === 201, "POST /api/v1/assets/assignments returns 201 Created");
    assert(assignDevData.data.signedHandoverUrl.includes("custody-forms"), "Signed equipment custody receipt generated");

    const assignmentId = assignDevData.data.id;

    // 3d. Provision SaaS Access Grant
    const saasGrantRes = await app.request("/api/v1/assets/saas/grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        saasApplicationId: "saas-4",
        accountUsernameOrEmail: "david.kiprono@mandelaglobal.com",
        roleOrLicenseTier: "administrator",
      }),
    });
    const saasGrantData = await saasGrantRes.json();
    assert(saasGrantRes.status === 201, "POST /api/v1/assets/saas/grants returns 201 Created");
    assert(saasGrantData.data.roleOrLicenseTier === "administrator", "AWS Administrator license provisioned");

    const grantId = saasGrantData.data.id;

    // 3e. Revoke SaaS grant on offboarding
    const revokeRes = await app.request(`/api/v1/assets/saas/grants/${grantId}/revoke`, {
      method: "POST",
    });
    const revokeData = await revokeRes.json();
    assert(revokeRes.status === 200, "POST /api/v1/assets/saas/grants/:id/revoke returns 200 OK");
    assert(revokeData.data.status === "revoked", "SaaS access license revoked");

    // 3f. Return hardware asset
    const returnDevRes = await app.request(`/api/v1/assets/assignments/${assignmentId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: deviceId,
        returnNotes: "Asset returned in pristine condition with power brick",
      }),
    });
    const returnDevData = await returnDevRes.json();
    assert(returnDevRes.status === 200, "POST /api/v1/assets/assignments/:id/return returns 200 OK");
    assert(returnDevData.data.status === "returned", "Device successfully marked as returned to inventory");

    // 3g. Submit & Resolve IT support ticket
    const ticketRes = await app.request("/api/v1/assets/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        title: "Replacement YubiKey 5C NFC Token Request",
        description: "Primary physical security key lost in transit during airport security inspection.",
        category: "security_hardware",
        priority: "high",
      }),
    });
    const ticketData = await ticketRes.json();
    assert(ticketRes.status === 201, "POST /api/v1/assets/tickets returns 201 Created");
    assert(ticketData.data.ticketNumber.startsWith("IT-2026-"), "Support ticket number generated");

    const ticketId = ticketData.data.id;

    const resolveTktRes = await app.request(`/api/v1/assets/tickets/${ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resolutionNotes: "Old token revoked in IAM; replacement YubiKey provisioned and dispatched via courier.",
      }),
    });
    const resolveTktData = await resolveTktRes.json();
    assert(resolveTktRes.status === 200, "PATCH /api/v1/assets/tickets/:id/resolve returns 200 OK");
    assert(resolveTktData.data.status === "resolved", "Ticket marked as resolved");
  }

  // SECTION 4: Statutory Tax Filings & Third-Party Remittances
  console.log("\n\x1b[1m[SECTION 4] Government Statutory Filings & Third-Party Remittance Disbursements\x1b[0m");
  {
    // 4a. Statutory agencies
    const agenciesRes = await app.request("/api/v1/statutory/agencies");
    const agenciesData = await agenciesRes.json();
    assert(agenciesRes.status === 200, "GET /api/v1/statutory/agencies returns 200 OK");
    assert(agenciesData.count >= 4, "Statutory agencies listed (KRA, SHIF, NSSF, Housing Levy)");

    // 4b. Generate monthly statutory filing batch with KRA PRN
    const genFilingRes = await app.request("/api/v1/statutory/filings/generate-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payrollRunId: "run-2026-10-ken",
        agencyCode: "KRA_PAYE",
        periodMonth: 10,
        periodYear: 2026,
        totalEmployeeDeduction: 1550000.0,
        totalEmployerContribution: 0.0,
        currency: "KES",
        prnReference: "PRN-KRA-2026-1049",
      }),
    });
    const genFilingData = await genFilingRes.json();
    assert(genFilingRes.status === 201, "POST /api/v1/statutory/filings/generate-batch returns 201 Created");
    assert(genFilingData.data.prnOrPaymentReference === "PRN-KRA-2026-1049", "KRA e-Slip PRN captured accurately");
    assert(genFilingData.data.totalRemittanceAmount === 1550000.0, "Total PAYE tax remittance captured as KES 1.55M");

    const filingId = genFilingData.data.id;

    // 4c. Acknowledge statutory tax settlement with bank receipt
    const markPaidRes = await app.request(`/api/v1/statutory/filings/${filingId}/mark-paid`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiptNumber: "CBK-RTGS-990011",
        receiptFileUrl: "https://storage.zuri.africa/receipts/CBK-RTGS-990011.pdf",
      }),
    });
    const markPaidData = await markPaidRes.json();
    assert(markPaidRes.status === 200, "PATCH /api/v1/statutory/filings/:id/mark-paid returns 200 OK");
    assert(markPaidData.data.status === "paid_and_receipted", "Status updated to 'paid_and_receipted'");

    // 4d. Third-party remittance institutions
    const instRes = await app.request("/api/v1/statutory/remittances/institutions");
    const instData = await instRes.json();
    assert(instRes.status === 200, "GET /api/v1/statutory/remittances/institutions returns 200 OK");
    assert(instData.count >= 3, "Third-party institutions listed (Harambee SACCO, Britam, HELB)");

    // 4e. Generate remittance batch for Britam Insurance
    const genRemRes = await app.request("/api/v1/statutory/remittances/batches/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payrollRunId: "run-2026-10-ken",
        institutionId: "inst-britam",
        totalAmount: 185000.0,
        currency: "KES",
        employeeCount: 22,
      }),
    });
    const genRemData = await genRemRes.json();
    assert(genRemRes.status === 201, "POST /api/v1/statutory/remittances/batches/generate returns 201 Created");
    assert(genRemData.data.totalAmount === 185000.0, "Remittance batch total is KES 185,000 across 22 policies");

    const batchId = genRemData.data.id;

    // 4f. Execute electronic bank remittance disbursement
    const disburseRemRes = await app.request(`/api/v1/statutory/remittances/batches/${batchId}/disburse`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disbursementReference: "B2B-STANBIC-BRITAM-0012",
      }),
    });
    const disburseRemData = await disburseRemRes.json();
    assert(disburseRemRes.status === 200, "PATCH /api/v1/statutory/remittances/batches/:id/disburse returns 200 OK");
    assert(disburseRemData.data.status === "disbursed", "Remittance batch marked as disbursed with electronic UTR");
  }

  // FINAL SUMMARY
  console.log("\n=================================================================================");
  console.log(`  PHASE 4 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error("Phase 4 test execution failed with error:", err);
  process.exit(1);
});
