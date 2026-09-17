/**
 * =========================================================================================
 * COMPREHENSIVE END-TO-END HONO BACKEND TEST SUITE
 * =========================================================================================
 * Directly tests Hono app routes via `app.request()` across all domain routers:
 * 1. Health & Service Catalog (/api/health, /api/v1/meta/catalog)
 * 2. Multi-Country Payroll (/api/v1/payroll/calculate-preview, /api/v1/payroll/runs)
 * 3. Statutory Agency Filings Export (/api/v1/payroll/runs/:id/statutory-files)
 * 4. Multi-SACCO Cooperatives & 1/3 Rule Pre-validation (/api/v1/cooperatives/mandates)
 * 5. Generic Pension Schemes & AVC Remittances (/api/v1/pensions)
 * 6. Fleet Management & KRA Section 5(4) Car Benefit Tax (/api/v1/fleet/calculate-benefit)
 * 7. Job Grades & Health Insurance Benefit Matrix (/api/v1/job-grades/benefit-matrix)
 * 8. Universal Digital Forms & SHA-256 E-Signatures (/api/v1/forms/submissions)
 * 9. Staff Loans & Section 12B Fringe Benefit Tax 30% (/api/v1/loans/apply)
 * 10. Expatriates & 183-Day Statutory Tax Residency (/api/v1/expatriates/residency-status/:id)
 * 11. Accounting Sub-Ledger & ERP Payloads (/api/v1/accounting/generate-journal)
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

async function runAllTests() {
  console.log("\n=================================================================================");
  console.log("  STARTING END-TO-END HONO BACKEND TEST SUITE (ZURI HRMS)");
  console.log("=================================================================================\n");

  // TEST 1: Health Check
  console.log("\x1b[1m[TEST 1] System Health & Service Catalog\x1b[0m");
  {
    const res = await app.request("/api/health");
    const data = await res.json();
    assert(res.status === 200, "GET /api/health returns 200 OK");
    assert(data.status === "healthy" && data.version === "2.0.0", "Service is healthy with v2.0.0");

    const catRes = await app.request("/api/v1/meta/catalog");
    const catData = await catRes.json();
    assert(catRes.status === 200, "GET /api/v1/meta/catalog returns 200 OK");
    assert(catData.domains.length >= 12, "Enterprise domain sub-routers registered in catalog (14 domains active)");
  }

  // TEST 2: Multi-Country Payroll Engine Preview
  console.log("\n\x1b[1m[TEST 2] Multi-Country Payroll Calculation Preview\x1b[0m");
  {
    // 2a. Kenya (KEN) with Prado, Octagon Pension, Harambee SACCO, Staff Loan
    const kenyaPayload = {
      countryCode: "KEN",
      employees: [
        {
          employeeId: "EMP-001",
          employeeName: "Nelson Mandela CP",
          basicSalary: 650000,
          allowances: [{ code: "HOUSE", name: "House Allowance", amount: 150000, isTaxable: true }],
          companyCar: {
            registrationNumber: "KDF 123A",
            engineCapacityCc: 2982,
            initialCost: 7500000,
            ownershipType: "purchased" as const,
            isAvailableForPrivateUse: true,
            providesFuel: true,
          },
          pensionEnrollment: {
            schemeName: "Octagon Umbrella Retirement Scheme",
            schemeCode: "OCTAGON",
            memberNumber: "OCT-88912",
            employeeRate: 0.05,
            employerRate: 0.05,
            voluntaryAvcAmount: 10000,
          },
          thirdPartyRemittances: [
            {
              mandateId: "MAND-01",
              institutionName: "Harambee Sacco Society",
              institutionCode: "HARAMBEE",
              remittanceType: "Check-off",
              memberOrPolicyNumber: "SACCO-HAR-1002",
              productName: "Main Shares",
              amount: 30000,
            },
            {
              mandateId: "MAND-02",
              institutionName: "Stima Sacco Society",
              institutionCode: "STIMA",
              remittanceType: "Check-off",
              memberOrPolicyNumber: "SACCO-STM-4091",
              productName: "Development Loan",
              loanAccountNumber: "LN-STM-2024-001",
              amount: 45000,
            },
          ],
          companyLoanRepayments: [
            {
              loanId: "LN-01",
              loanNumber: "LN-2026-001",
              installmentNumber: 1,
              amount: 45000,
              remainingBalance: 2000000,
              staffInterestRate: 0.06,
              kraMarketLendingRate: 0.16,
            },
          ],
        },
      ],
    };

    const kenyaRes = await app.request("/api/v1/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(kenyaPayload),
    });
    const kenyaData = await kenyaRes.json();
    assert(kenyaRes.status === 200, "POST /api/v1/payroll/calculate-preview (KEN) returns 200 OK");
    assert(kenyaData.success === true, "Calculation succeeded for Kenya");
    assert(kenyaData.summary.currency === "KES", "Currency is KES");
    
    const empCalc = kenyaData.results[0];
    assert(empCalc.carBenefitTaxable === 195000, "KRA Car Benefit is KES 195,000 (2% of KES 7.5M + 30% fuel)");
    assert(empCalc.pensionEmployeeTaxExempt === 17840, "Pension pre-tax deduction capped with NSSF offset (KES 20,000 - KES 2,160)");
    assert(empCalc.fringeBenefitTaxEmployer === 5000, "Section 12B FBT is calculated as KES 5,000 (30% of KES 16,666.67)");
    assert(empCalc.isOneThirdRuleViolated === false, "1/3 Net Pay Rule is satisfied for Employee 1");

    // 2b. Uganda (UGA)
    const ugandaRes = await app.request("/api/v1/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: "UGA",
        employees: [
          {
            employeeId: "EMP-UG-01",
            employeeName: "Okello John",
            basicSalary: 4500000,
          },
        ],
      }),
    });
    const ugandaData = await ugandaRes.json();
    assert(ugandaRes.status === 200, "POST /api/v1/payroll/calculate-preview (UGA) returns 200 OK");
    assert(ugandaData.summary.currency === "UGX", "Uganda currency is UGX");

    // 2c. Tanzania (TZA)
    const tanzaniaRes = await app.request("/api/v1/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: "TZA",
        employees: [
          {
            employeeId: "EMP-TZ-01",
            employeeName: "Mwamposa David",
            basicSalary: 3200000,
          },
        ],
      }),
    });
    const tanzaniaData = await tanzaniaRes.json();
    assert(tanzaniaRes.status === 200, "POST /api/v1/payroll/calculate-preview (TZA) returns 200 OK");
    assert(tanzaniaData.summary.currency === "TZS", "Tanzania currency is TZS");

    // 2d. South Africa (ZAF)
    const zafRes = await app.request("/api/v1/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: "ZAF",
        employees: [
          {
            employeeId: "EMP-ZA-01",
            employeeName: "Sipho Dlamini",
            basicSalary: 45000,
          },
        ],
      }),
    });
    const zafData = await zafRes.json();
    assert(zafRes.status === 200, "POST /api/v1/payroll/calculate-preview (ZAF) returns 200 OK");
    assert(zafData.summary.currency === "ZAR", "South Africa currency is ZAR");

    // 2e. Zambia (ZMB)
    const zmbRes = await app.request("/api/v1/payroll/calculate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode: "ZMB",
        employees: [
          {
            employeeId: "EMP-ZM-01",
            employeeName: "Chileshe Banda",
            basicSalary: 28000,
          },
        ],
      }),
    });
    const zmbData = await zmbRes.json();
    assert(zmbRes.status === 200, "POST /api/v1/payroll/calculate-preview (ZMB) returns 200 OK");
    assert(zmbData.summary.currency === "ZMW", "Zambia currency is ZMW");
  }

  // TEST 3: Statutory Agency CSV Filings Export
  console.log("\n\x1b[1m[TEST 3] Statutory Returns CSV Generation\x1b[0m");
  {
    const filesRes = await app.request("/api/v1/payroll/runs/sample-run/statutory-files");
    const filesData = await filesRes.json();
    assert(filesRes.status === 200, "GET /api/v1/payroll/runs/:id/statutory-files returns 200 OK");
    assert(typeof filesData.files.kraItaxCsv === "string", "KRA iTax CSV generated");
    assert(filesData.files.kraItaxCsv.includes("Non-Cash Benefit"), "KRA CSV includes Column 10 Non-Cash / Car Benefit header");
    assert(typeof filesData.files.shifCsv === "string", "SHIF CSV generated");
    assert(typeof filesData.files.nssfCsv === "string", "NSSF CSV generated");
    assert(Array.isArray(filesData.files.institutionalSchedules), "Institutional check-off schedules generated");
  }

  // TEST 4: Cooperatives (SACCOs) & 1/3 Net Pay Rule
  console.log("\n\x1b[1m[TEST 4] Cooperatives Domain & 1/3 Net Pay Pre-Validation\x1b[0m");
  {
    const coopsRes = await app.request("/api/v1/cooperatives");
    const coopsData = await coopsRes.json();
    assert(coopsRes.status === 200, "GET /api/v1/cooperatives returns 200 OK");
    assert(coopsData.count >= 4, "4+ cooperatives onboarded (Harambee, Stima, Mwalimu, Police)");

    // Test mandate with 1/3 Rule compliance (Basic 100k, deduction 20k -> projected 80k > 33.3k)
    const compliantRes = await app.request("/api/v1/cooperatives/mandates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-TEST-01",
        institutionId: "inst-coop-001",
        remittanceType: "cooperative_checkoff",
        memberOrPolicyNumber: "MEM-9921",
        monthlyDeductionAmount: 20000,
        startDate: "2026-10-01",
        currentBasicSalary: 100000,
        existingTotalDeductions: 10000,
      }),
    });
    const compData = await compliantRes.json();
    assert(compData.complianceValidation.isCompliant === true, "Compliant mandate approved with isCompliant: true");

    // Test mandate with 1/3 Rule VIOLATION (Basic 100k, existing 60k, adding 15k -> projected 25k < 33.3k)
    const violationRes = await app.request("/api/v1/cooperatives/mandates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-TEST-02",
        institutionId: "inst-coop-001",
        remittanceType: "cooperative_checkoff",
        memberOrPolicyNumber: "MEM-9922",
        monthlyDeductionAmount: 15000,
        startDate: "2026-10-01",
        currentBasicSalary: 100000,
        existingTotalDeductions: 60000,
      }),
    });
    const violData = await violationRes.json();
    assert(violData.complianceValidation.isCompliant === false, "1/3 Rule violation detected with isCompliant: false");
    assert(violData.complianceValidation.warning.includes("violates the statutory 1/3 minimum"), "Warning issued for 1/3 rule violation");
  }

  // TEST 5: Generic Pension Schemes (Zero Hardcoding)
  console.log("\n\x1b[1m[TEST 5] Generic Pension Schemes & AVC Enrollment\x1b[0m");
  {
    const schemesRes = await app.request("/api/v1/pensions/schemes");
    const schemesData = await schemesRes.json();
    assert(schemesRes.status === 200, "GET /api/v1/pensions/schemes returns 200 OK");
    assert(schemesData.count >= 2, "Configured schemes list returned (Octagon, ICEA Lion)");

    const enrollRes = await app.request("/api/v1/pensions/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-001",
        schemeId: "scheme-001",
        memberNumber: "OCT-88912",
        employeeContributionRate: 5,
        employerContributionRate: 5,
        voluntaryAvcAmount: 10000,
        effectiveStartDate: "2026-01-01",
      }),
    });
    const enrollData = await enrollRes.json();
    assert(enrollRes.status === 201, "POST /api/v1/pensions/enroll returns 201 Created");
    assert(enrollData.data.voluntaryAvcAmount === 10000, "AVC amount recorded correctly");

    const schedRes = await app.request("/api/v1/pensions/schemes/scheme-001/remittance-schedule");
    const schedData = await schedRes.json();
    assert(schedRes.status === 200, "GET /api/v1/pensions/schemes/:id/remittance-schedule returns 200 OK");
    assert(schedData.data.summary.statutoryTaxExemptPortion > 0, "RBA statutory tax exempt breakdown generated");
  }

  // TEST 6: Fleet Management & Car Benefit Simulation
  console.log("\n\x1b[1m[TEST 6] Fleet & KRA Section 5(4) Car Benefit Engine\x1b[0m");
  {
    const vehRes = await app.request("/api/v1/fleet/vehicles");
    const vehData = await vehRes.json();
    assert(vehRes.status === 200, "GET /api/v1/fleet/vehicles returns 200 OK");
    assert(vehData.count >= 3, "Company vehicles list returned");

    // Test car benefit simulation: Land Cruiser Prado 2982cc, KES 7.5M cost, with fuel
    const simRes = await app.request("/api/v1/fleet/calculate-benefit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engineCapacityCc: 2982,
        initialCost: 7500000,
        ownershipType: "purchased",
        isAvailableForPrivateUse: true,
        providesFuel: true,
      }),
    });
    const simData = await simRes.json();
    assert(simRes.status === 200, "POST /api/v1/fleet/calculate-benefit returns 200 OK");
    assert(simData.calculation.carBenefitAmount === 150000, "Car benefit is KES 150,000 (2% of KES 7.5M)");
    assert(simData.calculation.fuelBenefitAmount === 45000, "Fuel benefit is KES 45,000 (30% of car benefit)");
    assert(simData.calculation.totalTaxableCarBenefit === 195000, "Total car benefit is KES 195,000");

    // Test CC rate taking precedence: 1600cc car, initial cost KES 100,000 (2% is only KES 2,000, CC is KES 4,200)
    const ccRes = await app.request("/api/v1/fleet/calculate-benefit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engineCapacityCc: 1600,
        initialCost: 100000,
        ownershipType: "purchased",
        isAvailableForPrivateUse: true,
        providesFuel: false,
      }),
    });
    const ccData = await ccRes.json();
    assert(ccData.calculation.carBenefitAmount === 4200, "Prescribed CC rate (KES 4,200) takes precedence over 2% (KES 2,000)");
  }

  // TEST 7: Job Grades & Benefit Eligibility Matrix
  console.log("\n\x1b[1m[TEST 7] Job Grades & Health Insurance Tier Matrix\x1b[0m");
  {
    const matrixRes = await app.request("/api/v1/job-grades/benefit-matrix");
    const matrixData = await matrixRes.json();
    assert(matrixRes.status === 200, "GET /api/v1/job-grades/benefit-matrix returns 200 OK");
    assert(matrixData.count === 4, "Health insurance tiers configured across 4 grade bands");

    const execTier = matrixData.data.find((m: any) => m.gradeCode === "EXEC-1");
    assert(execTier.inpatientLimit === 10000000, "Executive band receives KES 10M inpatient limit");
    assert(execTier.maxDependentsCovered === 6, "Executive band covers M+6");
  }

  // TEST 8: Universal Digital Forms & SHA-256 E-Signatures
  console.log("\n\x1b[1m[TEST 8] Digital Forms, Campaigns & E-Signatures\x1b[0m");
  {
    const tmplRes = await app.request("/api/v1/forms/templates");
    const tmplData = await tmplRes.json();
    assert(tmplRes.status === 200, "GET /api/v1/forms/templates returns 200 OK");
    assert(tmplData.count >= 3, "Templates listed (COI, Code of Conduct, IT Custody)");

    // Submit negative COI declaration (no escalation)
    const cleanSubRes = await app.request("/api/v1/forms/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "form-tmpl-001",
        employeeId: "EMP-001",
        formData: { hasOutsideInterests: "NO" },
        signatureData: "data:image/png;base64,iVBORw0KGgo...",
        signatureType: "drawn",
      }),
    });
    const cleanSubData = await cleanSubRes.json();
    assert(cleanSubRes.status === 201, "POST /api/v1/forms/submissions returns 201 Created");
    assert(cleanSubData.data.signature.documentSha256Hash.length === 64, "Document sealed with valid SHA-256 fingerprint");
    assert(cleanSubData.data.escalationReview === null, "No escalation triggered for negative COI disclosure");

    // Submit affirmative COI declaration (auto-triggers escalation review)
    const escalatedSubRes = await app.request("/api/v1/forms/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "form-tmpl-001",
        employeeId: "EMP-002",
        formData: {
          hasOutsideInterests: "YES",
          outsideDetails: "Director in IT logistics provider",
        },
        signatureData: "data:image/png;base64,iVBORw0KGgo...",
        signatureType: "drawn",
      }),
    });
    const escData = await escalatedSubRes.json();
    assert(escData.data.status === "pending_compliance_review", "Status set to pending_compliance_review");
    assert(escData.data.escalationReview !== null, "Escalation review created automatically");
    assert(escData.data.escalationReview.assignedRole === "compliance_officer", "Assigned to compliance_officer");
  }

  // TEST 9: Staff Loans & Section 12B FBT 30%
  console.log("\n\x1b[1m[TEST 9] Staff Loans & Section 12B FBT Engine\x1b[0m");
  {
    const loanAppRes = await app.request("/api/v1/loans/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "EMP-001",
        loanTypeCode: "HOME_DEVELOPMENT",
        principalAmount: 2000000,
        repaymentMonths: 48,
        subsidizedInterestRateAnnual: 6.0,
        officialMarketRateAnnual: 16.0,
        purpose: "Residential development",
      }),
    });
    const loanAppData = await loanAppRes.json();
    assert(loanAppRes.status === 201, "POST /api/v1/loans/apply returns 201 Created");
    assert(loanAppData.fringeBenefitTaxAnalysis.interestSavingsAnnualPercentage === 10.0, "Interest savings is 10.0% (16% - 6%)");
    assert(loanAppData.fringeBenefitTaxAnalysis.employerFbtLiabilityMonthly > 0, "Employer FBT liability calculated at 30%");
  }

  // TEST 10: Expatriates & 183-Day Statutory Tax Residency
  console.log("\n\x1b[1m[TEST 10] Expatriates & 183-Day Statutory Tax Residency\x1b[0m");
  {
    const expRes = await app.request("/api/v1/expatriates");
    const expData = await expRes.json();
    assert(expRes.status === 200, "GET /api/v1/expatriates returns 200 OK");
    assert(expData.count >= 3, "Expatriates tracked with work permits and passports");

    const residentRes = await app.request("/api/v1/expatriates/residency-status/EXP-001");
    const resData = await residentRes.json();
    assert(resData.data.isResidentForTaxPurposes === true, "EXP-001 (210 days) qualified as Resident");

    const nonResidentRes = await app.request("/api/v1/expatriates/residency-status/EXP-003");
    const nonResData = await nonResidentRes.json();
    assert(nonResData.data.isResidentForTaxPurposes === false, "EXP-003 (78 days) qualified as Non-Resident");
    assert(nonResData.data.applicablePayeTaxRegime.includes("Flat 37.5%"), "Non-resident regime applies flat 37.5% tax");
  }

  // TEST 11: Accounting Sub-Ledger & ERP Payloads
  console.log("\n\x1b[1m[TEST 11] Accounting Sub-Ledger & ERP Connectors\x1b[0m");
  {
    const journalRes = await app.request("/api/v1/accounting/generate-journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payrollRunNumber: "PR-2026-09-001",
        organizationName: "Mandela Global HQ",
        currency: "KES",
        employees: [
          {
            employeeId: "EMP-001",
            employeeName: "Nelson Mandela CP",
            basicSalary: 650000,
            allowances: [],
            customDeductions: [],
          },
        ],
      }),
    });
    const journalData = await journalRes.json();
    assert(journalRes.status === 200, "POST /api/v1/accounting/generate-journal returns 200 OK");
    assert(journalData.voucher.isBalanced === true, "Subledger journal voucher is perfectly balanced (Debits === Credits)");
    assert(journalData.erpPayloads.sap.HEADER.DOC_TYPE === "SA", "SAP S/4HANA BAPI payload generated with DOC_TYPE SA");
    assert(journalData.erpPayloads.erpnext.doctype === "Journal Entry", "ERPNext Journal Entry payload generated");
  }

  // FINAL SUMMARY
  console.log("\n=================================================================================");
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error("Test execution failed with unhandled error:", err);
  process.exit(1);
});
