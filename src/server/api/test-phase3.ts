/**
 * =========================================================================================
 * PHASE 3 AUTOMATED INTEGRATION TEST SUITE: RECRUITMENT, PERFORMANCE, LEARNING & ETHICS
 * =========================================================================================
 * Comprehensive test coverage verifying:
 * 1. Recruitment & ATS Pipeline (Requisitions, Candidates, Multi-Stage Progress, Scorecards, Offers)
 * 2. Performance Management & OKRs (Cycles, Cascading Goals, Key Results, 360 Appraisal Reviews)
 * 3. Workforce Learning & Compliance (Course Catalog, Assignments, Quizzes, Expirations, Retraining Matrix)
 * 4. Ethics, Whistleblowing & Grievances (Anonymous Reports, Passcode Vault, Investigator Chat, Resolutions)
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

async function runPhase3Tests() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 3: RECRUITMENT, PERFORMANCE, LEARNING & GRIEVANCE TEST SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: Recruitment & ATS Pipeline
  console.log("\x1b[1m[SECTION 1] Talent Acquisition, Candidate Pipelines & Digital Job Offers\x1b[0m");
  {
    // 1a. List job openings
    const openingsRes = await app.request("/api/v1/recruitment/openings");
    const openingsData = await openingsRes.json();
    assert(openingsRes.status === 200, "GET /api/v1/recruitment/openings returns 200 OK");
    assert(openingsData.count >= 2, "Published job openings listed (Staff Cloud Architect, Mining Logistics Director)");

    // 1b. Create job opening
    const createJobRes = await app.request("/api/v1/recruitment/openings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Principal Machine Learning Engineer",
        code: "ENG-ML-003",
        departmentName: "Engineering & Technology",
        description: "Architect distributed LLM serving systems, semantic vector search, and on-premise inference pipelines.",
        workplaceType: "hybrid",
        employmentType: "full_time",
        openingsCount: 1,
        minSalary: 550000.0,
        maxSalary: 750000.0,
        currency: "KES",
        closingDate: "2026-11-30",
      }),
    });
    const createJobData = await createJobRes.json();
    assert(createJobRes.status === 201, "POST /api/v1/recruitment/openings returns 201 Created");
    assert(createJobData.data.code === "ENG-ML-003", "Job requisition created with code ENG-ML-003");
    assert(createJobData.data.pipelineStages.length === 7, "Default 7-stage hiring pipeline attached");

    const createdJobId = createJobData.data.id;

    // 1c. Register candidate with resume & AI summary
    const candRes = await app.request("/api/v1/recruitment/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Joy",
        lastName: "Chebet",
        email: "joy.chebet.ai@gmail.com",
        phoneNumber: "+254 733 889900",
        linkedinUrl: "https://linkedin.com/in/joychebet",
        portfolioUrl: "https://github.com/joychebet",
        resumeUrl: "https://storage.zuri.africa/resumes/joy_chebet_cv.pdf",
        aiSummary: "Doctorate in Machine Learning; 8 years building production NLP and deep recommendation engines.",
      }),
    });
    const candData = await candRes.json();
    assert(candRes.status === 201, "POST /api/v1/recruitment/candidates returns 201 Created");
    assert(candData.data.aiMatchScore >= 90.0, "AI competency match score computed (>= 90%)");

    const candidateId = candData.data.id;

    // 1d. Submit application
    const appRes = await app.request("/api/v1/recruitment/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobOpeningId: createdJobId,
        candidateId: candidateId,
        source: "linkedin_direct",
      }),
    });
    const appData = await appRes.json();
    assert(appRes.status === 201, "POST /api/v1/recruitment/applications returns 201 Created");
    assert(appData.data.stageId === "stg-1", "Application placed in Stage 1 (Application Received)");

    const applicationId = appData.data.id;

    // 1e. Advance candidate to Panel Interview
    const advanceRes = await app.request(`/api/v1/recruitment/applications/${applicationId}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageId: "stg-4",
        notes: "Passed coding screen with distinction",
      }),
    });
    const advanceData = await advanceRes.json();
    assert(advanceRes.status === 200, "PATCH /api/v1/recruitment/applications/:id/stage returns 200 OK");
    assert(advanceData.data.stageName === "Panel Interview", "Candidate advanced to 'Panel Interview'");

    // 1f. Schedule Panel Interview
    const scheduleRes = await app.request("/api/v1/recruitment/interviews/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: applicationId,
        interviewerUserId: "usr-admin-01",
        title: "Technical Architecture & Deep Learning Systems Panel",
        scheduledAt: "2026-09-22T10:00:00.000Z",
        durationMinutes: 60,
        meetingUrl: "https://meet.google.com/zuri-ml-interview",
      }),
    });
    const scheduleData = await scheduleRes.json();
    assert(scheduleRes.status === 201, "POST /api/v1/recruitment/interviews/schedule returns 201 Created");
    assert(scheduleData.data.durationMinutes === 60, "60-minute panel interview scheduled");

    const interviewId = scheduleData.data.id;

    // 1g. Submit Scorecard Evaluation
    const evalRes = await app.request("/api/v1/recruitment/interviews/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewScheduleId: interviewId,
        applicationId: applicationId,
        interviewerUserId: "usr-admin-01",
        overallRating: 5,
        competencyRatings: {
          systemDesign: 5,
          deepLearningTheory: 5,
          leadership: 4,
        },
        strengths: "Mastery of distributed model inference, quantization, and clean API design.",
        recommendation: "strong_hire",
      }),
    });
    const evalData = await evalRes.json();
    assert(evalRes.status === 201, "POST /api/v1/recruitment/interviews/evaluate returns 201 Created");
    assert(evalData.data.recommendation === "strong_hire", "Recommendation logged as 'strong_hire'");

    // 1h. Generate Formal Job Offer
    const offerRes = await app.request("/api/v1/recruitment/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobOpeningId: createdJobId,
        applicationId: applicationId,
        candidateId: candidateId,
        jobTitle: "Principal Machine Learning Engineer",
        baseSalary: 680000.0,
        currency: "KES",
        startDate: "2026-11-01",
        expirationDate: "2026-10-15",
      }),
    });
    const offerData = await offerRes.json();
    assert(offerRes.status === 201, "POST /api/v1/recruitment/offers returns 201 Created");
    assert(offerData.data.baseSalary === 680000.0, "Offer generated with KES 680,000 base salary");
    assert(offerData.data.status === "sent", "Offer status initialized to 'sent'");

    const offerId = offerData.data.id;

    // 1i. Candidate Accepts Offer -> Onboarding readiness bridge triggered
    const acceptRes = await app.request(`/api/v1/recruitment/offers/${offerId}/accept`, {
      method: "POST",
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200, "POST /api/v1/recruitment/offers/:id/accept returns 200 OK");
    assert(acceptData.data.offer.status === "accepted", "Offer transitioned to 'accepted'");
    assert(acceptData.data.onboardingBridgeTriggered === true, "Core HR employee onboarding bridge triggered automatically");
  }

  // SECTION 2: Performance Management & OKRs
  console.log("\n\x1b[1m[SECTION 2] Performance Appraisal Cycles, Cascading OKRs & 360 Reviews\x1b[0m");
  {
    // 2a. List appraisal cycles
    const cyclesRes = await app.request("/api/v1/performance/cycles");
    const cyclesData = await cyclesRes.json();
    assert(cyclesRes.status === 200, "GET /api/v1/performance/cycles returns 200 OK");
    assert(cyclesData.count >= 2, "Appraisal cycles listed (Annual & Mid-Year)");

    // 2b. Create appraisal cycle
    const createCycleRes = await app.request("/api/v1/performance/cycles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "FY2027 Strategic H1 Review Cycle",
        startDate: "2027-01-01",
        endDate: "2027-06-30",
        reviewDeadline: "2027-07-15",
        status: "planning",
      }),
    });
    const createCycleData = await createCycleRes.json();
    assert(createCycleRes.status === 201, "POST /api/v1/performance/cycles returns 201 Created");
    assert(createCycleData.data.status === "planning", "Cycle created in 'planning' status");

    // 2c. Create cascading goal with Key Results
    const createGoalRes = await app.request("/api/v1/performance/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        title: "Migrate Core Payroll Calculations to Rust Sub-Engine",
        description: "Benchmark sub-millisecond calculation speed across 100,000 synthetic employee payslips.",
        goalType: "individual",
        weightage: 50,
        dueDate: "2026-12-15",
        keyResults: [
          { title: "Develop WASM bridge between TypeScript and native engine", targetValue: 100, unit: "%" },
          { title: "Achieve under 5ms execution per 1,000 workers", targetValue: 5, unit: "ms" },
        ],
      }),
    });
    const createGoalData = await createGoalRes.json();
    assert(createGoalRes.status === 201, "POST /api/v1/performance/goals returns 201 Created");
    assert(createGoalData.data.keyResults.length === 2, "2 measurable Key Results attached");

    const goalId = createGoalData.data.id;

    // 2d. Update Goal Progress
    const updateGoalRes = await app.request(`/api/v1/performance/goals/${goalId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progressPercentage: 75.0,
        status: "on_track",
        keyResultUpdates: [{ keyResultIndex: 0, currentValue: 100 }],
      }),
    });
    const updateGoalData = await updateGoalRes.json();
    assert(updateGoalRes.status === 200, "PATCH /api/v1/performance/goals/:id/progress returns 200 OK");
    assert(updateGoalData.data.progressPercentage === 75.0, "Progress percentage updated to 75.0%");

    // 2e. Submit 360 Appraisal Review
    const reviewRes = await app.request("/api/v1/performance/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cycleId: "cyc-2026-annual",
        employeeId: "emp-002",
        reviewerUserId: "usr-admin-01",
        reviewerName: "Nelson Mandela CP",
        reviewType: "manager",
        overallRating: 4.9,
        strengthsText: "Superb execution on cloud resilience and distributed database high availability.",
        improvementsText: "Continue training junior cohort in systems programming.",
      }),
    });
    const reviewData = await reviewRes.json();
    assert(reviewRes.status === 201, "POST /api/v1/performance/reviews returns 201 Created");
    assert(reviewData.data.overallRating === 4.9, "Score 4.9/5.0 registered");
    assert(reviewData.data.aiSynthesisSummary.length > 20, "AI synthesis summary generated automatically");

    // 2f. Aggregated 360 Appraisal Summary
    const summaryRes = await app.request("/api/v1/performance/reviews/summary/emp-002");
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200, "GET /api/v1/performance/reviews/summary/:id returns 200 OK");
    assert(summaryData.data.ratingBand.includes("Exceeds Expectations"), "Performance rating classified as Tier 1 Exceeds Expectations");
    assert(summaryData.data.breakdown.managerReviewRating >= 4.5, "Manager review rating tracked in 360 breakdown");
  }

  // SECTION 3: Learning & Compliance Re-certification
  console.log("\n\x1b[1m[SECTION 3] Workforce Learning, Training & Automated Recertification Matrices\x1b[0m");
  {
    // 3a. List courses
    const coursesRes = await app.request("/api/v1/learning/courses");
    const coursesData = await coursesRes.json();
    assert(coursesRes.status === 200, "GET /api/v1/learning/courses returns 200 OK");
    assert(coursesData.count >= 3, "Catalog includes AML, Cybersecurity & OSHA Mining courses");

    // 3b. Publish new compliance course
    const createCourseRes = await app.request("/api/v1/learning/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Kenya Data Protection Act (DPA 2019) Enterprise Governance",
        code: "PRIV-DPA-101",
        category: "compliance_mandatory",
        isMandatory: true,
        validityPeriodMonths: 12,
        passingScorePercentage: 80,
        estimatedDurationMinutes: 45,
        description: "Data subject rights, lawful processing, cross-border transfers, and ODPC reporting.",
      }),
    });
    const createCourseData = await createCourseRes.json();
    assert(createCourseRes.status === 201, "POST /api/v1/learning/courses returns 201 Created");
    assert(createCourseData.data.code === "PRIV-DPA-101", "DPA course published with code PRIV-DPA-101");

    const courseId = createCourseData.data.id;

    // 3c. Assign course to employees
    const assignRes = await app.request("/api/v1/learning/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: courseId,
        employeeIds: ["emp-001", "emp-002"],
        dueDate: "2026-10-31",
      }),
    });
    const assignData = await assignRes.json();
    assert(assignRes.status === 201, "POST /api/v1/learning/assignments returns 201 Created");
    assert(assignData.data.length === 2, "Course assigned to 2 employees");

    const assignmentId = assignData.data[0].id;

    // 3d. Complete course & issue certificate
    const completeRes = await app.request(`/api/v1/learning/assignments/${assignmentId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scorePercentage: 96,
        notes: "Passed quiz on first attempt",
      }),
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, "PATCH /api/v1/learning/assignments/:id/complete returns 200 OK");
    assert(completeData.data.isPassed === true, "Passing score registered (96% >= 80%)");
    assert(completeData.data.certificateNumber.startsWith("CERT-"), "Digital certificate number generated");
    assert(completeData.data.expiresAt.startsWith("2027-"), "Expiration timestamp set 12 months in the future");

    // 3e. Compliance Retraining Matrix Dashboard
    const matrixRes = await app.request("/api/v1/learning/compliance/retraining-matrix");
    const matrixData = await matrixRes.json();
    assert(matrixRes.status === 200, "GET /api/v1/learning/compliance/retraining-matrix returns 200 OK");
    assert(matrixData.data.enterpriseWorkforceScope === 2150, "Full enterprise workforce scope evaluated (2,150 workers)");
    assert(matrixData.data.recertificationStatus.currentlyExpiredRequiringRetraining > 0, "Identifies workers requiring OSHA/AML retraining");
  }

  // SECTION 4: Ethics, Whistleblowing & Grievances
  console.log("\n\x1b[1m[SECTION 4] Ethics, Anonymous Whistleblowing & Grievance Vault\x1b[0m");
  {
    // 4a. Submit confidential anonymous report
    const fileRes = await app.request("/api/v1/grievances/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Suspected Kickback Scheme in Subsidiary Spare Parts Procurement",
        description: "Heavy machinery invoices for Dar es Salaam mining dump trucks show an undisclosed 15% surcharge routed to an offshore account.",
        category: "financial_fraud",
        severity: "critical",
        isAnonymous: true,
        location: "Dar es Salaam Port Logistics Office",
        accessPasscode: "SecureAudit#2026",
        partiesInvolved: ["Subsidiary Procurement Lead", "Offshore Trading LLC"],
      }),
    });
    const fileData = await fileRes.json();
    assert(fileRes.status === 201, "POST /api/v1/grievances/cases returns 201 Created");
    assert(fileData.data.caseNumber.startsWith("ETH-2026-"), "Case tracking reference generated (ETH-2026-XXXX)");
    assert(fileData.data.isAnonymous === true, "Anonymous identity protection preserved");

    const caseNumber = fileData.data.caseNumber;

    // 4b. Whistleblower tracking login with access passcode
    const trackRes = await app.request("/api/v1/grievances/cases/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseNumber: caseNumber,
        accessPasscode: "SecureAudit#2026",
      }),
    });
    const trackData = await trackRes.json();
    assert(trackRes.status === 200, "POST /api/v1/grievances/cases/track returns 200 OK");
    assert(trackData.data.caseNumber === caseNumber, "Whistleblower authenticated into encrypted case view");

    // 4c. Incorrect passcode rejection
    const failTrackRes = await app.request("/api/v1/grievances/cases/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseNumber: caseNumber,
        accessPasscode: "WrongPasscode123",
      }),
    });
    assert(failTrackRes.status === 401, "Invalid access passcode rejected with 401 Unauthorized");

    // 4d. Assign lead investigator
    const assignRes = await app.request(`/api/v1/grievances/cases/${caseNumber}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        investigatorUserId: "usr-compliance-01",
        investigatorName: "Amina Odhiambo (Internal Audit Director)",
      }),
    });
    const assignData = await assignRes.json();
    assert(assignRes.status === 200, "POST /api/v1/grievances/cases/:id/assign returns 200 OK");
    assert(assignData.data.status === "investigation_active", "Case transitioned to 'investigation_active'");

    // 4e. Send confidential two-way message in vault
    const msgRes = await app.request(`/api/v1/grievances/cases/${caseNumber}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Forensic auditors have frozen the disputed vendor accounts and secured bank statements.",
        isFromReporter: false,
      }),
    });
    const msgData = await msgRes.json();
    assert(msgRes.status === 201, "POST /api/v1/grievances/cases/:id/messages returns 201 Created");
    assert(msgData.data.message.includes("frozen"), "Encrypted message posted to investigation thread");

    // 4f. Resolve case
    const resolveRes = await app.request(`/api/v1/grievances/cases/${caseNumber}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resolutionSummary: "Vendor contract cancelled with prejudice. Embezzled funds (USD 84,000) recovered via bank indemnity.",
        correctiveActionTaken: "Procurement manager terminated; dual-signoff threshold lowered to USD 5,000.",
      }),
    });
    const resolveData = await resolveRes.json();
    assert(resolveRes.status === 200, "POST /api/v1/grievances/cases/:id/resolve returns 200 OK");
    assert(resolveData.data.status === "resolved", "Case marked as 'resolved' with full compliance audit record");
  }

  // FINAL SUMMARY
  console.log("\n=================================================================================");
  console.log(`  PHASE 3 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error("Phase 3 test execution failed with error:", err);
  process.exit(1);
});
