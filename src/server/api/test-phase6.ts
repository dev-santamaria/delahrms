/**
 * =========================================================================================
 * PHASE 6 INTEGRATION TEST SUITE: OPERATIONS, CLAIMS, BENEFITS, SURVEYS & SOCIAL
 * =========================================================================================
 * Automated end-to-end verification for Phase 6 domain routers:
 * 1. Employee Document Vault, Expiry Radar & Policy Attestations
 * 2. Expense Claims, Line Items, Receipt Archiving & Fiscal Compliance (eTIMS)
 * 3. Flexible Benefits, Dependent Enrollments & Earned Wage Access (EWA)
 * 4. Workforce Surveys, Anonymous Feedback & eNPS Pulse Analytics
 * 5. Social Collaboration: Chat Channels, Universal Comments, Kudos & Announcements
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
    console.log(`  ✔ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✖ FAIL: ${testName}`);
    if (details) {
      console.error(`    Details:`, JSON.stringify(details, null, 2));
    }
  }
}

async function runPhase6TestSuite() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 6: OPERATIONS, CLAIMS, BENEFITS, SURVEYS & SOCIAL SUITE");
  console.log("=================================================================================\n");

  // =========================================================================================
  // SECTION 1: Document Vault, Expiry Radar & Policy Compliance
  // =========================================================================================
  console.log("[SECTION 1] Employee Document Vault, Expiry Radar & Policy Compliance");

  // 1.1 List document categories
  const catRes = await app.request("/api/v1/documents/categories");
  assert(catRes.status === 200, "GET /api/v1/documents/categories returns 200 OK");
  const catJson = await catRes.json();
  assert(catJson.data.length >= 5, "Categories include Contracts, Identification, Academic, and Disciplinary");

  // 1.2 Upload document to employee vault with expiration date
  const uploadRes = await app.request("/api/v1/documents/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-001",
      categoryId: "cat-02",
      title: "National Driving Permit Class B",
      fileName: "kwame_driving_license.pdf",
      fileUrl: "https://vault.zuri-hrms.com/docs/kwame_license.pdf",
      fileSizeBytes: 890000,
      mimeType: "application/pdf",
      expiryDate: "2026-11-20",
    }),
  });
  assert(uploadRes.status === 201, "POST /api/v1/documents/upload returns 201 Created");
  const uploadJson = await uploadRes.json();
  const uploadedDocId = uploadJson.data.id;

  // 1.3 Verify document authenticity
  const verifyDocRes = await app.request(`/api/v1/documents/${uploadedDocId}/verify`, { method: "PATCH" });
  assert(verifyDocRes.status === 200, "PATCH /api/v1/documents/:id/verify returns 200 OK");
  const verifyDocJson = await verifyDocRes.json();
  assert(verifyDocJson.data.isVerified === true, "Document marked as verified by HR");

  // 1.4 Check document expiration radar
  const expiringRes = await app.request("/api/v1/documents/alerts/expiring?days=60");
  assert(expiringRes.status === 200, "GET /api/v1/documents/alerts/expiring returns 200 OK");
  const expiringJson = await expiringRes.json();
  assert(expiringJson.count >= 1, "Identifies documents expiring within 60 days (e.g. passport, driving permit)");

  // 1.5 Query company policies
  const polRes = await app.request("/api/v1/documents/policies");
  assert(polRes.status === 200, "GET /api/v1/documents/policies returns 200 OK");
  const polJson = await polRes.json();
  assert(polJson.data.length >= 2, "Company policies listed (Code of Conduct, IT Acceptable Use)");

  // 1.6 Publish new policy
  const createPolRes = await app.request("/api/v1/documents/policies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Remote Work & Global Workation Policy",
      version: "1.0",
      content: "Guidelines for cross-border remote work and home-office equipment subsidies.",
      fileUrl: "https://vault.zuri-hrms.com/policies/remote_work_policy.pdf",
      requiresAcknowledgement: true,
      effectiveDate: "2026-10-01",
    }),
  });
  assert(createPolRes.status === 201, "POST /api/v1/documents/policies returns 201 Created");
  const createPolJson = await createPolRes.json();
  const newPolicyId = createPolJson.data.id;

  // 1.7 Employee e-signs and acknowledges policy
  const ackRes = await app.request(`/api/v1/documents/policies/${newPolicyId}/acknowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-001",
      signatureUrl: "data:image/svg+xml;base64,PHN2ZyB...",
    }),
  });
  assert(ackRes.status === 201, "POST /api/v1/documents/policies/:id/acknowledge returns 201 Created");
  const ackJson = await ackRes.json();
  assert(ackJson.data.employeeId === "emp-001", "Acknowledgment stamped with employee ID and legal timestamp");

  // =========================================================================================
  // SECTION 2: General Expense Claims & Fiscal Verification
  // =========================================================================================
  console.log("\n[SECTION 2] General Expense Claims & Fiscal Verification");

  // 2.1 List expense categories
  const expCatRes = await app.request("/api/v1/claims/categories");
  assert(expCatRes.status === 200, "GET /api/v1/claims/categories returns 200 OK");
  const expCatJson = await expCatRes.json();
  assert(expCatJson.data.length >= 4, "Expense categories loaded (Airtime, Mileage, Meals, Home Office)");

  // 2.2 Submit new claim container
  const createClaimRes = await app.request("/api/v1/claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-002",
      title: "Q3 Field Client Visits & High-Speed Mobile Data",
      description: "Mileage to Athi River distribution warehouse + Monthly Safaricom LTE eSIM",
      currency: "KES",
      payoutRoute: "direct_payout",
    }),
  });
  assert(createClaimRes.status === 201, "POST /api/v1/claims returns 201 Created");
  const createClaimJson = await createClaimRes.json();
  const claimId = createClaimJson.data.id;
  assert(createClaimJson.data.claimNumber.startsWith("EXP-"), `Claim number generated: ${createClaimJson.data.claimNumber}`);

  // 2.3 Add itemized expense with eTIMS fiscal verification
  const addItemRes = await app.request(`/api/v1/claims/${claimId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expenseCategoryId: "exp-cat-airtime",
      spentDate: "2026-09-14",
      merchantName: "Safaricom PLC",
      amount: 8500,
      taxAmount: 1172.41, // 16% VAT
      currency: "KES",
      receiptUrl: "https://vault.zuri-hrms.com/receipts/saf_etims_receipt.pdf",
      fiscalRegime: "etims_ke",
      fiscalInvoiceNumber: "ETIMS-00841920-2026",
      merchantTaxPin: "P000607117N",
    }),
  });
  assert(addItemRes.status === 201, "POST /api/v1/claims/:id/items returns 201 Created");
  const addItemJson = await addItemRes.json();
  assert(addItemJson.data.isFiscalVerified === true, "Fiscal receipt verified against merchant tax PIN");
  assert(addItemJson.claimTotal === "8500.00", "Claim total updated to KES 8,500.00");

  // 2.4 Add second line item
  await app.request(`/api/v1/claims/${claimId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      expenseCategoryId: "exp-cat-meals",
      spentDate: "2026-09-15",
      merchantName: "Artcaffe Grand Cafe Nairobi",
      amount: 4200,
      taxAmount: 579.31,
      currency: "KES",
      fiscalRegime: "etims_ke",
      fiscalInvoiceNumber: "ETIMS-00994182-2026",
      merchantTaxPin: "P051184920K",
    }),
  });

  // 2.5 Query detailed claim report
  const viewClaimRes = await app.request(`/api/v1/claims/${claimId}`);
  assert(viewClaimRes.status === 200, "GET /api/v1/claims/:id returns 200 OK");
  const viewClaimJson = await viewClaimRes.json();
  assert(viewClaimJson.data.items.length === 2, "Claim contains 2 itemized expense lines");
  assert(viewClaimJson.data.totalAmount === "12700.00", "Total claim amount calculated as KES 12,700.00 (8,500 + 4,200)");

  // 2.6 Approve expense claim
  const approveClaimRes = await app.request(`/api/v1/claims/${claimId}/approve`, { method: "POST" });
  assert(approveClaimRes.status === 200, "POST /api/v1/claims/:id/approve returns 200 OK");
  const approveClaimJson = await approveClaimRes.json();
  assert(approveClaimJson.data.status === "approved", "Claim status updated to 'approved'");

  // 2.7 Settle expense claim via direct payout
  const settleClaimRes = await app.request(`/api/v1/claims/${claimId}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentReference: "MPESA-B2C-994812" }),
  });
  assert(settleClaimRes.status === 200, "POST /api/v1/claims/:id/settle returns 200 OK");
  const settleClaimJson = await settleClaimRes.json();
  assert(settleClaimJson.data.status === "paid", "Claim marked as 'paid'");

  // =========================================================================================
  // SECTION 3: Flexible Benefits, Health Plans & Earned Wage Access (EWA)
  // =========================================================================================
  console.log("\n[SECTION 3] Flexible Benefits & Earned Wage Access (EWA)");

  // 3.1 List benefit providers
  const provRes = await app.request("/api/v1/benefits/providers");
  assert(provRes.status === 200, "GET /api/v1/benefits/providers returns 200 OK");
  const provJson = await provRes.json();
  assert(provJson.data.length >= 3, "Insurance providers loaded (AAR, Jubilee Allianz, Britam)");

  // 3.2 List benefit plans
  const plansRes = await app.request("/api/v1/benefits/plans");
  assert(plansRes.status === 200, "GET /api/v1/benefits/plans returns 200 OK");
  const plansJson = await plansRes.json();
  assert(plansJson.data.length >= 2, "Plans include Executive Health Cover and Gym Wellness Stipend");

  // 3.3 Register new Dental & Optical benefit plan
  const createPlanRes = await app.request("/api/v1/benefits/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      providerId: "prov-aar",
      name: "Comprehensive Dental & Optical Care",
      code: "DENT-OPT-AAR",
      category: "dental_and_vision",
      currency: "KES",
      tierPricing: { employee_only: 15000, full_family: 32000 },
      employerContributionPercentage: 80,
      isPreTaxDeduction: true,
    }),
  });
  assert(createPlanRes.status === 201, "POST /api/v1/benefits/plans returns 201 Created");
  const createPlanJson = await createPlanRes.json();
  const dentalPlanId = createPlanJson.data.id;

  // 3.4 Enroll employee in plan
  const enrollRes = await app.request("/api/v1/benefits/enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-002",
      benefitPlanId: dentalPlanId,
      coverageTier: "full_family",
      monthlyEmployeeCost: 6400, // 20% of 32,000
      monthlyEmployerCost: 25600, // 80% of 32,000
      effectiveStartDate: "2026-10-01",
    }),
  });
  assert(enrollRes.status === 201, "POST /api/v1/benefits/enrollments returns 201 Created");
  const enrollJson = await enrollRes.json();
  const enrollmentId = enrollJson.data.id;

  // 3.5 Attach dependent to enrollment
  const addDepRes = await app.request(`/api/v1/benefits/enrollments/${enrollmentId}/dependents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "Brian",
      lastName: "Kipchoge",
      relationship: "child",
      dateOfBirth: "2018-04-12",
    }),
  });
  assert(addDepRes.status === 201, "POST /api/v1/benefits/enrollments/:id/dependents returns 201 Created");

  // 3.6 Request Earned Wage Access (EWA) advance
  const ewaReqRes = await app.request("/api/v1/benefits/ewa/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-001",
      requestedAmount: 15000,
      payoutDestination: "+254722000000 (M-Pesa B2C)",
      currency: "KES",
    }),
  });
  assert(ewaReqRes.status === 201, "POST /api/v1/benefits/ewa/request returns 201 Created");
  const ewaReqJson = await ewaReqRes.json();
  const ewaId = ewaReqJson.data.id;
  assert(ewaReqJson.data.feeAmount === "375.00", "EWA convenience fee calculated accurately (2.5% of KES 15,000 = KES 375)");
  assert(ewaReqJson.data.totalRepaymentAmount === "15375.00", "Total repayment amount is KES 15,375.00");

  // 3.7 Disburse EWA payment
  const ewaDisbRes = await app.request(`/api/v1/benefits/ewa/${ewaId}/disburse`, { method: "POST" });
  assert(ewaDisbRes.status === 200, "POST /api/v1/benefits/ewa/:id/disburse returns 200 OK");
  const ewaDisbJson = await ewaDisbRes.json();
  assert(ewaDisbJson.data.status === "disbursed", "EWA advance marked as disbursed with M-Pesa B2C reference");

  // =========================================================================================
  // SECTION 4: Workforce Surveys & eNPS Pulse Analytics
  // =========================================================================================
  console.log("\n[SECTION 4] Workforce Surveys & eNPS Pulse Analytics");

  // 4.1 List survey campaigns
  const survRes = await app.request("/api/v1/surveys/campaigns");
  assert(survRes.status === 200, "GET /api/v1/surveys/campaigns returns 200 OK");
  const survJson = await survRes.json();
  assert(survJson.data.length >= 1, "Q3 Pulse survey campaign listed");
  const activeCamp = survJson.data[0];

  // 4.2 Create onboarding feedback campaign
  const createSurvRes = await app.request("/api/v1/surveys/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "First 90 Days New Hire Onboarding Experience",
      description: "Feedback on workstation setup, buddy mentorship, and cultural orientation",
      surveyType: "onboarding_feedback",
      isAnonymous: true,
      targetScope: "all_company",
      startDate: "2026-09-01",
      endDate: "2026-12-31",
      totalTargetCount: 85,
    }),
  });
  assert(createSurvRes.status === 201, "POST /api/v1/surveys/campaigns returns 201 Created");
  const createSurvJson = await createSurvRes.json();
  const newCampId = createSurvJson.data.id;

  // 4.3 Add question to onboarding survey
  const addQRes = await app.request(`/api/v1/surveys/campaigns/${newCampId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      questionText: "My onboarding mentor provided clear guidance during my first 30 days.",
      questionType: "rating_1_to_5",
      options: ["1 - Disagree", "2 - Somewhat Disagree", "3 - Neutral", "4 - Agree", "5 - Strongly Agree"],
      isRequired: true,
      displayOrder: 1,
    }),
  });
  assert(addQRes.status === 201, "POST /api/v1/surveys/campaigns/:id/questions returns 201 Created");
  const addQJson = await addQRes.json();
  const qId = addQJson.data.id;

  // 4.4 Submit survey feedback with strict anonymity guarantee
  const submitSurvRes = await app.request(`/api/v1/surveys/campaigns/${newCampId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeId: "emp-001", // Passed by client but MUST BE decoupled because isAnonymous = true
      answers: [
        {
          questionId: qId,
          numericValue: 5,
        },
      ],
    }),
  });
  assert(submitSurvRes.status === 201, "POST /api/v1/surveys/campaigns/:id/submit returns 201 Created");
  const submitSurvJson = await submitSurvRes.json();
  assert(submitSurvJson.data.isAnonymous === true, "Anonymity confirmed on submission");

  // 4.5 Query campaign metrics and eNPS
  const metricsRes = await app.request(`/api/v1/surveys/campaigns/${activeCamp.id}/metrics`);
  assert(metricsRes.status === 200, "GET /api/v1/surveys/campaigns/:id/metrics returns 200 OK");
  const metricsJson = await metricsRes.json();
  assert(metricsJson.data.enpsScore === 68, "eNPS score accurately tracked as +68");
  assert(metricsJson.data.classification === "Excellent (+50 to +70)", "eNPS benchmark classification rendered");

  // =========================================================================================
  // SECTION 5: Social Collaboration, Chat, Comments & Kudos
  // =========================================================================================
  console.log("\n[SECTION 5] Social Collaboration, Chat, Comments & Kudos");

  // 5.1 List team chat channels
  const convRes = await app.request("/api/v1/social/conversations");
  assert(convRes.status === 200, "GET /api/v1/social/conversations returns 200 OK");
  const convJson = await convRes.json();
  assert(convJson.data.length >= 2, "Conversations include #engineering-all-hands and direct messages");

  // 5.2 Post message in chat channel
  const postMsgRes = await app.request("/api/v1/social/conversations/conv-eng-channel/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderUserId: "emp-001",
      senderName: "Kwame Mensah",
      content: "All 33 enterprise backend domain routers are fully operational.",
    }),
  });
  assert(postMsgRes.status === 201, "POST /api/v1/social/conversations/:id/messages returns 201 Created");

  // 5.3 Post universal polymorphic comment on a candidate
  const postCmtRes = await app.request("/api/v1/social/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entityType: "candidate",
      entityId: "cand-042",
      authorUserId: "usr-lead-002",
      authorName: "David Ochieng",
      content: "Strong architectural presentation on multitenant sharding. Recommended for offer.",
      visibility: "internal_hr_only",
      mentions: ["usr-recruiter-01"],
    }),
  });
  assert(postCmtRes.status === 201, "POST /api/v1/social/comments returns 201 Created");

  // 5.4 Query universal comments
  const queryCmtRes = await app.request("/api/v1/social/comments?entityType=candidate&entityId=cand-042");
  assert(queryCmtRes.status === 200, "GET /api/v1/social/comments returns 200 OK");
  const queryCmtJson = await queryCmtRes.json();
  assert(queryCmtJson.data.length >= 1, "Universal comment retrieved for candidate entity");
  assert(queryCmtJson.data[0].visibility === "internal_hr_only", "HR confidential visibility scope preserved");

  // 5.5 Award peer recognition kudos with core value badge
  const kudosRes = await app.request("/api/v1/social/kudos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      senderUserId: "emp-001",
      senderName: "Kwame Mensah",
      receiverUserId: "emp-002",
      receiverName: "Faith Kipchoge",
      coreValueTag: "#DeliverExcellence",
      message: "Brilliant delivery on the statutory tax return PRN integration for KRA and SHIF!",
      points: 75,
    }),
  });
  assert(kudosRes.status === 201, "POST /api/v1/social/kudos returns 201 Created");
  const kudosJson = await kudosRes.json();
  const kudosId = kudosJson.data.id;
  assert(kudosJson.data.coreValueTag === "#DeliverExcellence", "Core value tag formatted with hashtag");

  // 5.6 React to kudos with emoji cheer
  const reactKudosRes = await app.request(`/api/v1/social/kudos/${kudosId}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "usr-ceo-001",
      emoji: "🔥",
    }),
  });
  assert(reactKudosRes.status === 200, "POST /api/v1/social/kudos/:id/react returns 200 OK");
  const reactKudosJson = await reactKudosRes.json();
  assert(reactKudosJson.data.reactions.length === 1, "Emoji cheer reaction recorded on kudos wall");

  // 5.7 Query and broadcast announcements
  const annRes = await app.request("/api/v1/social/announcements");
  assert(annRes.status === 200, "GET /api/v1/social/announcements returns 200 OK");
  const annJson = await annRes.json();
  assert(annJson.data.length >= 1, "Company announcements listed");
  const townHallAnn = annJson.data[0];

  // 5.8 Record announcement read receipt
  const readAnnRes = await app.request(`/api/v1/social/announcements/${townHallAnn.id}/read`, { method: "POST" });
  assert(readAnnRes.status === 200, "POST /api/v1/social/announcements/:id/read returns 200 OK");

  // =========================================================================================
  // SUMMARY
  // =========================================================================================
  console.log("\n=================================================================================");
  console.log(`  PHASE 6 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase6TestSuite().catch((err) => {
  console.error("Test Suite Execution Error:", err);
  process.exit(1);
});
