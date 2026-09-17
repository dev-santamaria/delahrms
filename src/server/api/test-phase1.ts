/**
 * =========================================================================================
 * PHASE 1 AUTOMATED INTEGRATION TEST SUITE: CORE HR, PROFILE 360 & POSITIONS
 * =========================================================================================
 * Comprehensive test coverage verifying:
 * 1. Organization structure (Departments, Branches with Geofencing, Designations, Hierarchy)
 * 2. Position-Driven Architecture (Approved Seats, FTE Capacity, Vacancy Requisitions, Budgets)
 * 3. Employee Master Data & Onboarding (Statutory IDs, Bank EFT/M-Pesa Rails, Contracts)
 * 4. Aggregated Profile 360 View (Personal, Statutory, Banking, Car, Pension, SACCOs)
 * 5. Banking Disbursement Updates
 * 6. Career Lifecycle Audit Events (Promotions, Confirmations, Transfers)
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

async function runPhase1Tests() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 1: CORE HR, PROFILE 360 & POSITION MANAGEMENT TEST SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: Organization Hierarchy & Setup
  console.log("\x1b[1m[SECTION 1] Organization Hierarchy, Departments & Geofenced Branches\x1b[0m");
  {
    // 1a. List departments
    const deptListRes = await app.request("/api/v1/organization/departments");
    const deptListData = await deptListRes.json();
    assert(deptListRes.status === 200, "GET /api/v1/organization/departments returns 200 OK");
    assert(deptListData.count >= 4, "Core corporate departments listed (ENG, FIN, OPS, HR)");

    // 1b. Create department
    const createDeptRes = await app.request("/api/v1/organization/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Enterprise Architecture & AI",
        code: "EA-AI",
      }),
    });
    const createDeptData = await createDeptRes.json();
    assert(createDeptRes.status === 201, "POST /api/v1/organization/departments returns 201 Created");
    assert(createDeptData.data.code === "EA-AI", "Department created with code EA-AI");

    // 1c. Branches with Geofencing
    const branchRes = await app.request("/api/v1/organization/branches");
    const branchData = await branchRes.json();
    assert(branchRes.status === 200, "GET /api/v1/organization/branches returns 200 OK");
    assert(branchData.count >= 4, "Multinational branches listed (Nairobi HQ, Mombasa Hub, Kampala, Dar es Salaam)");
    assert(branchData.data[0].geofenceRadiusMeters === 150, "Nairobi HQ geofence radius configured to 150m");

    // 1d. Create Branch
    const createBrRes = await app.request("/api/v1/organization/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Kisumu Regional Tech Center",
        code: "KSM-01",
        city: "Kisumu",
        stateOrCounty: "Kisumu County",
        countryCode: "KEN",
        latitude: -0.091702,
        longitude: 34.767956,
        geofenceRadiusMeters: 150,
      }),
    });
    const createBrData = await createBrRes.json();
    assert(createBrRes.status === 201, "POST /api/v1/organization/branches returns 201 Created");
    assert(createBrData.data.code === "KSM-01", "Kisumu branch created with geofence radius 150m");

    // 1e. Designations & Corporate Hierarchy
    const desigRes = await app.request("/api/v1/organization/designations");
    const desigData = await desigRes.json();
    assert(desigRes.status === 200, "GET /api/v1/organization/designations returns 200 OK");
    assert(desigData.count >= 4, "Designations listed and mapped to job grades");

    const hierRes = await app.request("/api/v1/organization/hierarchy");
    const hierData = await hierRes.json();
    assert(hierRes.status === 200, "GET /api/v1/organization/hierarchy returns 200 OK");
    assert(hierData.data.holdingCompany.subsidiaries.length === 3, "Multinational subsidiaries tree rendered (Kenya, Uganda, Tanzania)");
  }

  // SECTION 2: Position Management & Headcount Control
  console.log("\n\x1b[1m[SECTION 2] Position Management, FTE Controls & Vacancy Lifecycle\x1b[0m");
  {
    // 2a. List positions
    const posRes = await app.request("/api/v1/positions");
    const posData = await posRes.json();
    assert(posRes.status === 200, "GET /api/v1/positions returns 200 OK");
    assert(posData.count >= 4, "Positions master catalog returned");

    // 2b. Create approved position
    const createPosRes = await app.request("/api/v1/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positionCode: "POS-AI-001",
        title: "Staff Machine Learning Engineer",
        fte: 1.0,
        maxHeadcountCapacity: 1,
        status: "vacant",
        budgetedSalaryMin: 500000,
        budgetedSalaryMax: 750000,
        currency: "KES",
        isCriticalPosition: true,
      }),
    });
    const createPosData = await createPosRes.json();
    assert(createPosRes.status === 201, "POST /api/v1/positions returns 201 Created");
    assert(createPosData.data.status === "vacant", "Position created as approved vacant seat");
    assert(createPosData.data.isCriticalPosition === true, "Critical position flag set for succession planning");

    // 2c. Assign employee to position
    const assignPosRes = await app.request("/api/v1/positions/pos-03/assign-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-042",
        effectiveDate: "2026-10-01",
      }),
    });
    const assignPosData = await assignPosRes.json();
    assert(assignPosRes.status === 200, "POST /api/v1/positions/:id/assign-employee returns 200 OK");
    assert(assignPosData.data.status === "occupied", "Position transitioned to 'occupied' status");

    // 2d. Vacate position & auto-open vacancy requisition
    const vacatePosRes = await app.request("/api/v1/positions/pos-02/vacate", {
      method: "POST",
    });
    const vacatePosData = await vacatePosRes.json();
    assert(vacatePosRes.status === 200, "POST /api/v1/positions/:id/vacate returns 200 OK");
    assert(vacatePosData.data.status === "vacant", "Position vacated");
    assert(typeof vacatePosData.data.autoRequisitionNumber === "string", "Approved recruitment requisition opened automatically");

    // 2e. Headcount Budgets & FTE control
    const budgetRes = await app.request("/api/v1/positions/budgets");
    const budgetData = await budgetRes.json();
    assert(budgetRes.status === 200, "GET /api/v1/positions/budgets returns 200 OK");
    assert(budgetData.data[0].approvedFteLimit === 55.0, "Departmental FTE limit tracked (55.0 FTEs)");
    assert(budgetData.data[0].vacantFte === 7.0, "Vacant capacity tracked (7.0 FTEs open)");
  }

  // SECTION 3: Workforce Registry, Onboarding & Profile 360
  console.log("\n\x1b[1m[SECTION 3] Workforce Registry, Onboarding & Profile 360\x1b[0m");
  {
    // 3a. List employees
    const empRes = await app.request("/api/v1/employees");
    const empData = await empRes.json();
    assert(empRes.status === 200, "GET /api/v1/employees returns 200 OK");
    assert(empData.count >= 4, "Active workforce listed");

    // 3b. Complete Onboarding with KRA PIN, NSSF, SHIF, and Bank/M-Pesa Rails
    const onboardRes = await app.request("/api/v1/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: "Grace",
        lastName: "Mutheu",
        dateOfBirth: "1994-05-12",
        gender: "female",
        maritalStatus: "single",
        personalEmail: "grace.mutheu@gmail.com",
        phoneNumber: "+254 711 223344",
        nationalIdNumber: "30192847",
        taxIdentificationNumber: "A009876543M", // KRA PIN
        socialSecurityNumber: "NSSF-77665544",
        healthInsuranceNumber: "SHA-1239870",
        bankName: "Equity Bank Kenya",
        bankBranch: "Community Branch",
        bankAccountNumber: "0180299887766",
        bankAccountName: "Grace Mutheu",
        bankSwiftCode: "EQBLKENA",
        mobileMoneyProvider: "M-Pesa",
        mobileMoneyNumber: "+254 711 223344",
        employeeCode: "EMP-045",
        workEmail: "grace.mutheu@mandelaglobal.com",
        hireDate: "2026-10-01",
        probationMonths: 3,
        employmentType: "full_time",
        status: "probation",
        basicSalary: 280000,
        currency: "KES",
      }),
    });
    const onboardData = await onboardRes.json();
    assert(onboardRes.status === 201, "POST /api/v1/employees returns 201 Created");
    assert(onboardData.data.statutoryIdentifiers.kraPin === "A009876543M", "KRA PIN captured on onboarding");
    assert(onboardData.data.paymentDisbursementRails.bankName === "Equity Bank Kenya", "Bank EFT payout rail configured");

    // 3c. Unified Profile 360 View
    const p360Res = await app.request("/api/v1/employees/emp-001/profile-360");
    const p360Data = await p360Res.json();
    assert(p360Res.status === 200, "GET /api/v1/employees/:id/profile-360 returns 200 OK");
    assert(p360Data.data.statutoryCompliance.kraPin === "A001234567X", "Profile 360 includes verified KRA PIN");
    assert(p360Data.data.jobGradeAndBenefits.gradeCode === "EXEC-1", "Profile 360 includes Job Grade EXEC-1");
    assert(p360Data.data.jobGradeAndBenefits.healthInsurance.inpatientLimit === 10000000, "Profile 360 includes KES 10M health insurance tier");
    assert(p360Data.data.assignedFleetVehicle.registrationNumber === "KDF 123A", "Profile 360 links assigned company vehicle (KDF 123A Prado)");
    assert(p360Data.data.pensionEnrollment.schemeName.includes("Octagon"), "Profile 360 links Octagon Pension scheme enrollment");
    assert(p360Data.data.activeCooperativeMandates.length === 2, "Profile 360 aggregates Harambee & Stima SACCO check-offs");

    // 3d. Update Banking Rails
    const updateBankRes = await app.request("/api/v1/employees/emp-001/banking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankName: "Absa Bank Kenya",
        bankBranch: "Queensway Branch",
        bankAccountNumber: "030998877665",
        bankAccountName: "Nelson Mandela CP",
        mobileMoneyProvider: "M-Pesa",
        mobileMoneyNumber: "+254 722 000111",
      }),
    });
    const updateBankData = await updateBankRes.json();
    assert(updateBankRes.status === 200, "PATCH /api/v1/employees/:id/banking returns 200 OK");
    assert(updateBankData.data.updatedBanking.bankName === "Absa Bank Kenya", "Bank updated to Absa Bank Kenya");

    // 3e. Career Lifecycle Audit Event
    const lifecycleRes = await app.request("/api/v1/employees/emp-002/lifecycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "promotion",
        effectiveDate: "2026-10-01",
        fromDetails: { title: "Staff Cloud Systems Architect", grade: "G6", basicSalary: 420000 },
        toDetails: { title: "Principal Enterprise Architect", grade: "M1", basicSalary: 520000 },
        notes: "Promotion to Principal Architect approved by Executive Committee",
      }),
    });
    const lifecycleData = await lifecycleRes.json();
    assert(lifecycleRes.status === 201, "POST /api/v1/employees/:id/lifecycle returns 201 Created");
    assert(lifecycleData.data.eventType === "promotion", "Promotion lifecycle event recorded");

    // 3f. Lifecycle History
    const historyRes = await app.request("/api/v1/employees/emp-001/lifecycles");
    const historyData = await historyRes.json();
    assert(historyRes.status === 200, "GET /api/v1/employees/:id/lifecycles returns 200 OK");
    assert(historyData.count >= 3, "Complete career progression timeline returned (Hire, Confirmation, Salary Revision)");
  }

  // FINAL SUMMARY
  console.log("\n=================================================================================");
  console.log(`  PHASE 1 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error("Phase 1 test execution failed with error:", err);
  process.exit(1);
});
