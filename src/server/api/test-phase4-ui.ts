/**
 * Phase 4 Automated Verification Suite: People Operations, ATS Recruitment & Compliance Hub
 *
 * Validates:
 * 1. Persona context switching to 'hr_ops'
 * 2. Workforce master registry, onboarding with statutory IDs, and career lifecycle transitions
 * 3. Organization multi-entity hierarchy tree, cost centers, and matrix dotted-line reporting
 * 4. Job grades compensation bands (G1 to EXEC-1) and health insurance entitlement matrices
 * 5. ATS recruitment 7-stage hiring pipeline, candidate applications, interview scorecards, and digital offer letters
 * 6. Workforce learning, OSHA/AML course recertification, quiz evaluations, and compliance audit matrices
 * 7. Global mobility cross-border cases, 183-day physical presence tracking, and PE exposure radar
 * 8. Ethics, FCPA whistleblowing vault, anonymous passcode tracking, and lead investigator resolution
 */

import { apiClient } from "@/lib/api-client";
import { app } from "./app";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✖ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✔ PASS: ${message}`);
}

async function runPhase4Verification() {
  console.log("=================================================================================");
  console.log("  PHASE 4 VERIFICATION: PEOPLE OPS, ATS RECRUITMENT & COMPLIANCE HUB (HR OPS ROLE)");
  console.log("=================================================================================");

  // Wire client to local Hono instance
  apiClient.setCustomFetch((url: string, options: RequestInit) => {
    const parsedUrl = new URL(url.startsWith("http") ? url : `http://localhost:3000${url}`);
    const req = new Request(parsedUrl.toString(), options);
    return app.fetch(req);
  });

  // 1. Switch context to HR Operations
  apiClient.setContext({
    tenantId: "tenant-default",
    organizationId: "org-kenya",
    userId: "usr-hr-ops-lead",
    userRole: "hr_ops",
  });

  const ctx = apiClient.getContext();
  assert(ctx.userRole === "hr_ops", "User context switches dynamically to 'hr_ops'");

  // 2. Workforce Directory & Onboarding
  const empListRes = await apiClient.workforce.getEmployees();
  assert(empListRes.status === 200, "apiClient.workforce.getEmployees() returns status 200");
  const empList = empListRes.data?.data || empListRes.data;
  assert(Array.isArray(empList), "Workforce list returned as array");
  assert(empList.some((e: any) => e.name.includes("Nelson Mandela") || e.employeeCode === "EMP-001"), "Master directory includes executive record");

  // Onboard new employee
  const onboardPayload = {
    firstName: "Beatrice",
    lastName: "Waweru",
    workEmail: "beatrice.waweru@mandelaglobal.com",
    employeeCode: `EMP-PH4-${Date.now().toString().slice(-4)}`,
    nationalIdNumber: "30192847",
    taxIdentificationNumber: "A00887766K",
    socialSecurityNumber: "NSSF-778899",
    healthInsuranceNumber: "SHIF-554433",
    bankName: "Stanbic Bank Kenya",
    bankAccountNumber: "01009823471",
    hireDate: "2026-10-01",
    basicSalary: 350000,
    probationMonths: 3,
  };
  const onboardRes = await apiClient.workforce.createEmployee(onboardPayload);
  assert(onboardRes.status === 200 || onboardRes.status === 201, "apiClient.workforce.createEmployee() returns 200/201");
  const onboarded = onboardRes.data?.data || onboardRes.data;
  assert(onboarded.fullName === "Beatrice Waweru", "Onboarded employee fullName verified");
  assert(onboarded.statutoryIdentifiers?.kraPin === "A00887766K", "KRA PIN stored in master record");

  // Record career lifecycle event
  const lifecycleRes = await apiClient.workforce.recordLifecycle("emp-001", {
    eventType: "promotion",
    effectiveDate: "2026-10-01",
    notes: "Promoted to Group Executive Managing Director following regional expansion",
    fromDetails: { role: "Chief Executive Officer" },
    toDetails: { role: "Group Executive Managing Director", salary: 750000 },
  });
  assert(lifecycleRes.status === 200 || lifecycleRes.status === 201, "apiClient.workforce.recordLifecycle() returns 200/201");
  const lifecycleData = lifecycleRes.data?.data || lifecycleRes.data;
  assert(lifecycleData.eventType === "promotion", "Lifecycle event recorded as promotion");

  // 3. Organization Hierarchy & Reporting Lines
  const hierarchyRes = await apiClient.organization.getHierarchy();
  assert(hierarchyRes.status === 200, "apiClient.organization.getHierarchy() returns status 200");
  const hierData = hierarchyRes.data?.data || hierarchyRes.data;
  assert(hierData?.holdingCompany?.name === "Mandela Global Holdings Ltd", "Corporate holding company verified");
  assert(hierData?.holdingCompany?.subsidiaries?.length >= 3, "Contains East African regional subsidiaries (KEN, UGA, TZA)");

  // Assign matrix dotted-line reporting
  const repRes = await apiClient.organization.assignReportingLine({
    employeeId: "emp-008",
    managerEmployeeId: "emp-002",
    reportingType: "dotted_line_matrix",
  });
  assert(repRes.status === 201, "apiClient.organization.assignReportingLine() returns status 201");
  const repData = repRes.data?.data || repRes.data;
  assert(repData.reportingType === "dotted_line_matrix", "Reporting line assigned as dotted_line_matrix");

  // 4. Job Grades Compensation & Benefit Entitlements
  const gradesRes = await apiClient.jobGrades.getGrades();
  assert(gradesRes.status === 200, "apiClient.jobGrades.getGrades() returns status 200");
  const gradesList = gradesRes.data?.data || gradesRes.data;
  assert(Array.isArray(gradesList), "Job grades returned as array");
  assert(gradesList.some((g: any) => g.gradeCode === "EXEC-1" && g.isCompanyCarEligible === true), "EXEC-1 grade carries company vehicle eligibility");

  // Query Grade Entitlements
  const entitlementsRes = await apiClient.jobGrades.getEntitlements("grd-10");
  assert(entitlementsRes.status === 200, "apiClient.jobGrades.getEntitlements() returns status 200");
  const entitlements = entitlementsRes.data?.data || entitlementsRes.data;
  assert(entitlements.executivePerks?.companyCarEligible === true, "Grade entitlements include company vehicle");
  assert(entitlements.healthInsurancePlan?.inpatientLimit >= 5000000, "Inpatient health limit is >= KES 5M");

  // 5. ATS Recruitment Pipeline
  const openingsRes = await apiClient.recruitment.getOpenings();
  assert(openingsRes.status === 200, "apiClient.recruitment.getOpenings() returns status 200");
  const openingsList = openingsRes.data?.data || openingsRes.data;
  assert(Array.isArray(openingsList), "Job openings returned as array");

  // Create Opening
  const createJobRes = await apiClient.recruitment.createOpening({
    title: "Regional Safety & Quality Auditor",
    code: `QA-AUD-${Date.now().toString().slice(-4)}`,
    departmentName: "Operations & Supply Chain",
    workplaceType: "on_site",
    employmentType: "full_time",
    minSalary: 300000,
    maxSalary: 420000,
    currency: "KES",
    description: "Audit industrial safety adherence across stations",
    requirements: "NEBOSH or DOSHS safety credentials",
    closingDate: "2026-11-30",
  });
  assert(createJobRes.status === 201, "apiClient.recruitment.createOpening() returns status 201");
  const createdJob = createJobRes.data?.data || createJobRes.data;
  assert(createdJob.pipelineStages?.length === 7, "Job requisition automatically initialized with 7-stage hiring pipeline");

  // Schedule interview
  const interviewRes = await apiClient.recruitment.scheduleInterview({
    applicationId: "app-job-01",
    scheduledAt: "2026-10-10T14:00:00Z",
    durationMinutes: 60,
    title: "Technical Architecture Defense Panel",
    interviewerUserId: "usr-001",
    meetingUrl: "https://meet.google.com/zuri-test-interview",
  });
  assert(interviewRes.status === 201, "apiClient.recruitment.scheduleInterview() returns status 201");

  // Submit standardized scorecard
  const evalRes = await apiClient.recruitment.submitEvaluation({
    interviewScheduleId: interviewRes.data?.data?.id || "int-01",
    applicationId: "app-job-01",
    interviewerUserId: "usr-001",
    overallRating: 5,
    competencyRatings: { technicalDepth: 5, communication: 5, cultureFit: 4 },
    strengths: "Extraordinary systems knowledge and clear articulation",
    recommendation: "strong_hire",
  });
  assert(evalRes.status === 201, "apiClient.recruitment.submitEvaluation() returns status 201");
  const evalData = evalRes.data?.data || evalRes.data;
  assert(evalData.recommendation === "strong_hire", "Candidate evaluated with 'strong_hire' recommendation");

  // Generate formal job offer
  const offerRes = await apiClient.recruitment.generateOffer({
    jobOpeningId: createdJob.id,
    applicationId: "app-job-01",
    candidateId: "cand-001",
    jobTitle: "Staff Cloud Systems Architect",
    baseSalary: 520000,
    currency: "KES",
    startDate: "2026-11-01",
    expirationDate: "2026-10-20",
  });
  assert(offerRes.status === 201, "apiClient.recruitment.generateOffer() returns status 201");
  const offerData = offerRes.data?.data || offerRes.data;
  assert(offerData.baseSalary === 520000, "Formal offer base salary KES 520,000 verified");
  assert(offerData.status === "sent", "Offer extended status is 'sent'");

  // 6. Workforce Learning & Compliance Matrix
  const coursesRes = await apiClient.learning.getCourses();
  assert(coursesRes.status === 200, "apiClient.learning.getCourses() returns status 200");
  const coursesList = coursesRes.data?.data || coursesRes.data;
  assert(Array.isArray(coursesList), "Courses returned as array");
  assert(coursesList.some((c: any) => c.code === "COMP-AML-101" && c.isMandatory === true), "AML Compliance course is mandatory");

  // Complete assignment & generate certificate
  const compRes = await apiClient.learning.completeAssignment("asg-001", {
    scorePercentage: 96,
  });
  assert(compRes.status === 200, "apiClient.learning.completeAssignment() returns status 200");
  const compData = compRes.data?.data || compRes.data;
  assert(compData.isPassed === true, "Course assignment marked passed (96% >= pass mark)");
  assert(compData.certificateNumber?.startsWith("CERT-"), "Digital certificate number generated");

  // Query compliance retraining matrix
  const matrixRes = await apiClient.learning.getComplianceMatrix();
  assert(matrixRes.status === 200, "apiClient.learning.getComplianceMatrix() returns status 200");
  const matrixData = matrixRes.data?.data || matrixRes.data;
  assert(matrixData.overallCompliancePercentage >= 60, "Overall workforce compliance percentage computed (>= 60%)");
  assert(matrixData.enterpriseWorkforceScope === 2150, "Total enterprise workforce scope is 2,150 staff");

  // 7. Global Mobility & 183-Day Physical Presence
  const mobilityCasesRes = await apiClient.mobility.getCases();
  assert(mobilityCasesRes.status === 200, "apiClient.mobility.getCases() returns status 200");

  // Log presence and evaluate tax residency
  const logPresRes = await apiClient.mobility.logPresence({
    employeeId: "emp-004",
    countryCode: "TZA",
    entryDate: "2026-07-01",
    exitDate: "2026-07-30",
    daysSpent: 30,
  });
  assert(logPresRes.status === 201, "apiClient.mobility.logPresence() returns status 201");
  const presData = logPresRes.data?.data || logPresRes.data;
  assert(presData.cumulativeDaysYearToDate >= 183, "183-day statutory tax residency triggered (> 183 days)");
  assert(presData.isTaxResidencyTriggered === true, "Tax residency trigger boolean confirmed true");

  // 8. Ethics, Whistleblowing Vault & Investigation Resolution
  const fileEthicsRes = await apiClient.ethics.fileCase({
    subject: "Safety Interlock Bypass on Primary Ore Crusher",
    category: "safety_violation",
    severity: "critical",
    description: "Emergency stop interlock switch bypassed with jumper wire during shift change.",
    incidentDate: "2026-09-15",
    location: "Dar es Salaam Extraction Plant",
    partiesInvolved: ["Night Shift Supervisor"],
    isAnonymous: true,
    accessPasscode: "Crusher-Safe-2026",
  });
  assert(fileEthicsRes.status === 201, "apiClient.ethics.fileCase() returns status 201");
  const ethicsData = fileEthicsRes.data?.data || fileEthicsRes.data;
  assert(ethicsData.isAnonymous === true, "Whistleblower report flagged as anonymous");
  assert(ethicsData.caseNumber?.startsWith("ETH-"), "Confidential case number assigned (ETH-...)");

  // Authenticate whistleblower with secret passcode
  const authWhistleRes = await apiClient.ethics.trackCase(ethicsData.caseNumber, "Crusher-Safe-2026");
  assert(authWhistleRes.status === 200, "apiClient.ethics.trackCase() authenticates with secret passcode");
  const authData = authWhistleRes.data?.data || authWhistleRes.data;
  assert(authData.caseNumber === ethicsData.caseNumber, "Authenticated case number matches");

  // Assign lead investigator
  const assignInvRes = await apiClient.ethics.assignInvestigator("case-001", {
    investigatorUserId: "usr-audit-lead",
    investigatorName: "Amina Odhiambo (Head of Internal Audit)",
  });
  assert(assignInvRes.status === 200, "apiClient.ethics.assignInvestigator() returns status 200");

  // Post encrypted message in case thread
  const msgRes = await apiClient.ethics.postMessage("case-001", {
    isFromReporter: false,
    message: "Inspection team dispatched to secure plant telemetry logs.",
    attachments: [],
  });
  assert(msgRes.status === 201, "apiClient.ethics.postMessage() returns status 201");

  // Formally resolve case
  const resolveRes = await apiClient.ethics.resolveCase("case-001", {
    resolutionSummary: "Audit concluded; jumper wires removed and interlocks recertified.",
    correctiveActionTaken: "Shift supervisor sanctioned and mandatory retraining scheduled.",
  });
  assert(resolveRes.status === 200, "apiClient.ethics.resolveCase() returns status 200");
  const resData = resolveRes.data?.data || resolveRes.data;
  assert(resData.status === "resolved", "Case status updated to 'resolved' with immutable audit trail");

  console.log("=================================================================================");
  console.log("  PHASE 4 UI & API VERIFICATION: ALL ASSERTIONS PASSED (100%)");
  console.log("=================================================================================");
}

runPhase4Verification().catch((err) => {
  console.error("Phase 4 verification execution failed:", err);
  process.exit(1);
});
