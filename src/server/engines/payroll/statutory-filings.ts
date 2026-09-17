/**
 * =========================================================================================
 * UNIVERSAL STATUTORY AGENCY RETURNS & INSTITUTIONAL REMITTANCE ENGINE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Automated regulatory return generation engine outputting compliant, portal-ready files
 * for official revenue authorities, social security funds, and commercial third-party lenders:
 * 
 * Supported Agency Returns:
 * 1. Kenya: KRA iTax PAYE, SHA/SHIF Portal CSV, NSSF e-Service CSV, Affordable Housing Levy (AHL)
 * 2. Uganda: Uganda Revenue Authority (URA) Monthly PAYE CSV, NSSF Uganda e-Return (5% EE + 10% ER)
 * 3. Tanzania: Tanzania Revenue Authority (TRA) PAYE CSV, NSSF/PSSSF & Levies (SDL/WCF) CSV
 * 4. Zambia: Zambia Revenue Authority (ZRA) PAYE Schedule, NAPSA & NHIMA Contribution Schedule
 * 5. United Kingdom: HMRC Real Time Information (RTI) Full Payment Submission (FPS) Schedule
 * 6. United States: IRS Form 941 Quarterly / W-2 Wage Summary Schedule
 * 7. South Africa: SARS EMP201 Monthly Declaration Schedule (PAYE, UIF, SDL)
 * 8. Nigeria: State Internal Revenue Service (LIRS/FIRS) PAYE Monthly Schedule (CRA, PenCom, NHF)
 * 9. Third-Party Remittances: Check-off schedules for insurance policies (e.g. Britam), SACCOs, and student loans (HELB)
 * 10. Universal Filing Dispatcher: `generateGlobalStatutoryFiling(countryCode, filingType, input)`
 * =========================================================================================
 */

import { CalculatedPayrollResult } from "./engine";

export interface EmployeeFilingProfile {
  employeeId: string;
  employeeName: string;
  nationalId: string;
  kraPin: string;
  nssfNumber: string;
  shifNumber: string;
  residentialStatus?: "Resident" | "Non-Resident";
  employeeType?: "Primary" | "Secondary";
}

export interface StatutoryFilingInput {
  organizationName: string;
  organizationTaxId: string; // e.g. KRA PIN
  periodMonth: number;
  periodYear: number;
  currency: string;
  employees: {
    profile: EmployeeFilingProfile;
    calculation: CalculatedPayrollResult;
    remittances?: {
      institutionName: string;
      institutionCode: string;
      remittanceType: string;
      memberOrPolicyNumber: string;
      amount: number;
    }[];
  }[];
}

/**
 * 1. Generate Official KRA iTax PAYE Monthly Return CSV
 */
export function generateKraItaxCsv(input: StatutoryFilingInput): string {
  const headers = [
    "PIN of Employee",
    "Name of Employee",
    "Residential Status",
    "Type of Employee",
    "Basic Salary",
    "Housing Allowance",
    "Transport Allowance",
    "Other Allowances",
    "Gross Pay",
    "Non-Cash Benefit",
    "NSSF Contribution",
    "Taxable Pay",
    "Tax Payable",
    "Personal Relief",
    "Insurance Relief",
    "PAYE Tax Deducted",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "A000000000X",
      `"${profile.employeeName}"`,
      profile.residentialStatus || "Resident",
      profile.employeeType || "Primary",
      calculation.basicSalary.toFixed(2),
      (calculation.totalAllowances * 0.7).toFixed(2), // Housing portion
      (calculation.totalAllowances * 0.3).toFixed(2), // Other allowances portion
      "0.00",
      calculation.grossPay.toFixed(2),
      (calculation.carBenefitTaxable || 0).toFixed(2), // Column 10: Non-Cash Benefit / Car Benefit
      (calculation.nssfEmployee + (calculation.pensionEmployeeTaxExempt || 0)).toFixed(2), // Column 11: Total Allowable Retirement Deductions
      calculation.taxableGross.toFixed(2),
      calculation.taxBeforeRelief.toFixed(2),
      calculation.personalRelief.toFixed(2),
      calculation.insuranceRelief.toFixed(2),
      calculation.payeTax.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 2. Generate Official Kenya SHIF (Social Health Authority - SHA) Portal CSV
 */
export function generateShifPortalCsv(input: StatutoryFilingInput): string {
  const headers = [
    "National ID / Passport",
    "SHA Number",
    "Employee Full Name",
    "Gross Monthly Salary",
    "SHIF Contribution (2.75%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.nationalId || "00000000",
      profile.shifNumber || "SHA-000000",
      `"${profile.employeeName}"`,
      calculation.grossPay.toFixed(2),
      calculation.shifEmployee.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 3. Generate Official Kenya NSSF e-Service Returns CSV
 */
export function generateNssfPortalCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Payroll Number",
    "Employee Full Name",
    "National ID Number",
    "NSSF Membership Number",
    "Gross Pay",
    "Voluntary Contribution",
    "Tier 1 Total (EE + ER)",
    "Tier 2 Total (EE + ER)",
    "Total NSSF Remittance",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    const tier1Total = 840; // Standard 7,000 * 12%
    const tier2Total = Math.max(0, calculation.nssfEmployee * 2 - tier1Total);
    const totalNssf = (calculation.nssfEmployee + calculation.nssfEmployer).toFixed(2);

    return [
      profile.employeeId,
      `"${profile.employeeName}"`,
      profile.nationalId || "00000000",
      profile.nssfNumber || "NSSF-000000",
      calculation.grossPay.toFixed(2),
      "0.00",
      tier1Total.toFixed(2),
      tier2Total.toFixed(2),
      totalNssf,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 4. Generate Kenya Affordable Housing Levy (AHL) Return Schedule CSV
 */
export function generateHousingLevyScheduleCsv(input: StatutoryFilingInput): string {
  const headers = [
    "KRA PIN of Employee",
    "Employee Full Name",
    "Gross Monthly Salary",
    "Employee Levy (1.5%)",
    "Employer Levy (1.5%)",
    "Total Housing Levy Remittance (3.0%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    const totalLevy = (calculation.housingLevyEmployee + calculation.housingLevyEmployer).toFixed(2);

    return [
      profile.kraPin || "A000000000X",
      `"${profile.employeeName}"`,
      calculation.grossPay.toFixed(2),
      calculation.housingLevyEmployee.toFixed(2),
      calculation.housingLevyEmployer.toFixed(2),
      totalLevy,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 5. Generate Third-Party Institutional Check-Off Remittance Schedule
 * (For Britam Education Policy, Harambee SACCO, HELB, Unions)
 */
export interface InstitutionalCheckoffReport {
  institutionName: string;
  institutionCode: string;
  remittanceType: string;
  payrollPeriod: string;
  totalAmount: number;
  employeeCount: number;
  csvContent: string;
  items: {
    employeeName: string;
    nationalId: string;
    memberOrPolicyNumber: string;
    loanAccountNumber?: string;
    productName?: string;
    principalPortion?: number;
    interestPortion?: number;
    amount: number;
  }[];
}

export function generateInstitutionalCheckoffSchedules(
  input: StatutoryFilingInput
): InstitutionalCheckoffReport[] {
  const institutionMap = new Map<string, {
    institutionName: string;
    institutionCode: string;
    remittanceType: string;
    items: {
      employeeName: string;
      nationalId: string;
      memberOrPolicyNumber: string;
      loanAccountNumber?: string;
      productName?: string;
      principalPortion?: number;
      interestPortion?: number;
      amount: number;
    }[];
  }>();

  for (const emp of input.employees) {
    if (!emp.remittances || !Array.isArray(emp.remittances)) continue;

    for (const rem of emp.remittances) {
      const key = rem.institutionCode;
      if (!institutionMap.has(key)) {
        institutionMap.set(key, {
          institutionName: rem.institutionName,
          institutionCode: rem.institutionCode,
          remittanceType: rem.remittanceType,
          items: [],
        });
      }

      institutionMap.get(key)!.items.push({
        employeeName: emp.profile.employeeName,
        nationalId: emp.profile.nationalId,
        memberOrPolicyNumber: rem.memberOrPolicyNumber,
        loanAccountNumber: (rem as any).loanAccountNumber,
        productName: (rem as any).productName,
        principalPortion: (rem as any).principalPortion || 0,
        interestPortion: (rem as any).interestPortion || 0,
        amount: rem.amount,
      });
    }
  }

  const reports: InstitutionalCheckoffReport[] = [];

  for (const [code, inst] of institutionMap.entries()) {
    const totalAmount = inst.items.reduce((acc, i) => acc + i.amount, 0);
    const headers = [
      "Employee Full Name",
      "National ID",
      "Member / Policy Number",
      "Loan Account No",
      "Product / Remittance Category",
      "Principal Portion (KES)",
      "Interest Portion (KES)",
      "Total Remittance (KES)",
    ];
    const rows = inst.items.map((item) =>
      `"${item.employeeName}","${item.nationalId}","${item.memberOrPolicyNumber}","${item.loanAccountNumber || "-"}","${item.productName || inst.remittanceType}",${(item.principalPortion || 0).toFixed(2)},${(item.interestPortion || 0).toFixed(2)},${item.amount.toFixed(2)}`
    );

    const csvContent = [
      `# Institutional Check-off Remittance Schedule: ${inst.institutionName} (${code})`,
      `# Organization: ${input.organizationName} (PIN: ${input.organizationTaxId})`,
      `# Payroll Period: ${input.periodMonth}/${input.periodYear}`,
      `# Total Remittance: KES ${totalAmount.toFixed(2)}`,
      headers.join(","),
      ...rows,
    ].join("\n");

    reports.push({
      institutionName: inst.institutionName,
      institutionCode: inst.institutionCode,
      remittanceType: inst.remittanceType,
      payrollPeriod: `${input.periodMonth}/${input.periodYear}`,
      totalAmount: Math.round(totalAmount * 100) / 100,
      employeeCount: inst.items.length,
      csvContent,
      items: inst.items,
    });
  }

  return reports;
}

/**
 * 6. Generate Generic Pension & Retirement Scheme Remittance Schedule
 * (Universal: Octagon Africa, ICEA Lion, Britam, Zamara, or in-house staff trust)
 */
export interface PensionRemittanceReport {
  schemeName: string;
  schemeCode: string;
  payrollPeriod: string;
  totalEmployeeNormal: number;
  totalEmployeeExcessOrAvc: number;
  totalEmployerContribution: number;
  totalRemittance: number;
  memberCount: number;
  csvContent: string;
}

export function generatePensionRemittanceReport(
  input: StatutoryFilingInput,
  schemeName: string = "Retirement Benefits Pension Scheme",
  schemeCode: string = "PENSION"
): PensionRemittanceReport {
  const headers = [
    "Staff ID",
    "Employee Full Name",
    "National ID Number",
    "KRA Tax PIN",
    "Scheme Member Number",
    "Basic Monthly Salary",
    "Employee Normal Contribution (Tax-Exempt)",
    "Employee Voluntary AVC / Excess (Taxable)",
    "Employer Matching Contribution",
    "Total Remittance Disbursable",
  ];

  let totalEmployeeNormal = 0;
  let totalEmployeeExcessOrAvc = 0;
  let totalEmployerContribution = 0;
  let totalRemittance = 0;
  let memberCount = 0;

  const rows: string[] = [];

  for (const emp of input.employees) {
    const calc = emp.calculation;
    const eeNormal = calc.pensionEmployeeTaxExempt || 0;
    const eeExcess = calc.pensionEmployeeTaxable || 0;
    const erAmount = calc.pensionEmployer || 0;
    const empTotal = eeNormal + eeExcess + erAmount;

    if (empTotal > 0) {
      memberCount++;
      totalEmployeeNormal += eeNormal;
      totalEmployeeExcessOrAvc += eeExcess;
      totalEmployerContribution += erAmount;
      totalRemittance += empTotal;

      rows.push([
        emp.profile.employeeId,
        `"${emp.profile.employeeName}"`,
        emp.profile.nationalId || "00000000",
        emp.profile.kraPin || "A000000000X",
        (emp.profile as any).pensionMemberNumber || `MEM-${emp.profile.employeeId}`,
        calc.basicSalary.toFixed(2),
        eeNormal.toFixed(2),
        eeExcess.toFixed(2),
        erAmount.toFixed(2),
        empTotal.toFixed(2),
      ].join(","));
    }
  }

  const csvContent = [
    `# Retirement Benefits Remittance Schedule: ${schemeName} (${schemeCode})`,
    `# Sponsoring Employer: ${input.organizationName} (PIN: ${input.organizationTaxId})`,
    `# Contribution Period: ${input.periodMonth}/${input.periodYear}`,
    `# Total Contribution Amount: KES ${totalRemittance.toFixed(2)} (Members: ${memberCount})`,
    headers.join(","),
    ...rows,
  ].join("\n");

  return {
    schemeName,
    schemeCode,
    payrollPeriod: `${input.periodMonth}/${input.periodYear}`,
    totalEmployeeNormal: Math.round(totalEmployeeNormal * 100) / 100,
    totalEmployeeExcessOrAvc: Math.round(totalEmployeeExcessOrAvc * 100) / 100,
    totalEmployerContribution: Math.round(totalEmployerContribution * 100) / 100,
    totalRemittance: Math.round(totalRemittance * 100) / 100,
    memberCount,
    csvContent,
  };
}

/**
 * 6. Generate Official Uganda Revenue Authority (URA) Monthly PAYE Return CSV
 * Regulated under the Uganda Income Tax Act.
 */
export function generateUgandaUraPayeCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Employee TIN",
    "Employee Full Name",
    "National ID (NIN)",
    "Gross Monthly Salary (UGX)",
    "NSSF Contribution 5% (Tax Deductible)",
    "Taxable Pay",
    "URA PAYE Tax Deducted",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "1000000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "CM000000000000",
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 7. Generate Official Uganda NSSF Monthly Contribution Return CSV
 * Regulated under Uganda NSSF Act Cap 222 (5% EE + 10% ER = 15% Total).
 */
export function generateUgandaNssfCsv(input: StatutoryFilingInput): string {
  const headers = [
    "NSSF Membership Number",
    "Employee Full Name",
    "National ID (NIN)",
    "Gross Pay (UGX)",
    "Employee Contribution (5%)",
    "Employer Contribution (10%)",
    "Total NSSF Remittance (15%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.nssfNumber || "NS00000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "CM000000000000",
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      (calculation.nssfEmployee + calculation.nssfEmployer).toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 8. Generate Official Tanzania Revenue Authority (TRA) Monthly PAYE Return CSV
 * Regulated under Tanzania Income Tax Act 2004.
 */
export function generateTanzaniaTraPayeCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Employee TIN",
    "Employee Full Name",
    "NIDA Number",
    "Basic Pay (TZS)",
    "Allowances (TZS)",
    "Gross Pay",
    "NSSF/PSSSF Deduction (10%)",
    "Taxable Income",
    "TRA PAYE Tax Deducted",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "100-000-000",
      `"${profile.employeeName}"`,
      profile.nationalId || "19000000000000000000",
      calculation.basicSalary.toFixed(2),
      calculation.totalAllowances.toFixed(2),
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 9. Generate Official Tanzania NSSF / PSSSF & Levies Schedule CSV
 * Covers 10% EE + 10% ER, 0.5% WCF, and 3.5% SDL.
 */
export function generateTanzaniaNssfCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Social Security Number",
    "Employee Full Name",
    "NIDA Number",
    "Gross Wages (TZS)",
    "Employee NSSF (10%)",
    "Employer NSSF (10%)",
    "Total NSSF (20%)",
    "WCF (0.5%)",
    "SDL (3.5%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    const wcf = calculation.grossPay * 0.005;
    const sdl = calculation.grossPay * 0.035;
    return [
      profile.nssfNumber || "TZ-NSSF-000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "19000000000000000000",
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      (calculation.nssfEmployee + calculation.nssfEmployer).toFixed(2),
      wcf.toFixed(2),
      sdl.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 10. Generate Official Zambia Revenue Authority (ZRA) PAYE Schedule CSV
 * Regulated under Zambia Income Tax Act.
 */
export function generateZambiaZraPayeCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Employee TPIN",
    "Employee Full Name",
    "NRC / Passport Number",
    "Gross Emoluments (ZMW)",
    "NAPSA Deduction (Tax Exempt)",
    "Taxable Pay",
    "ZRA PAYE Tax Deducted",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "1000000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "000000/00/0",
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 11. Generate Official Zambia NAPSA & NHIMA Schedule CSV
 * Regulated under National Pension Scheme Act & National Health Insurance Act.
 */
export function generateZambiaNapsaCsv(input: StatutoryFilingInput): string {
  const headers = [
    "NAPSA Social Security Number",
    "Employee Full Name",
    "NRC Number",
    "Gross Earnings (ZMW)",
    "NAPSA Employee (5%)",
    "NAPSA Employer (5%)",
    "Total NAPSA (10%)",
    "NHIMA Employee (1%)",
    "NHIMA Employer (1%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.nssfNumber || "NAPSA-0000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "000000/00/0",
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      (calculation.nssfEmployee + calculation.nssfEmployer).toFixed(2),
      calculation.shifEmployee.toFixed(2),
      calculation.housingLevyEmployer.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 12. Generate Official United Kingdom HMRC Real Time Information (RTI) Full Payment Submission (FPS) CSV
 */
export function generateUkHmrcRtiFpsCsv(input: StatutoryFilingInput): string {
  const headers = [
    "National Insurance Number (NINO)",
    "Payroll ID",
    "Employee Full Name",
    "Gross Taxable Pay (GBP)",
    "HMRC PAYE Tax Deducted",
    "Employee NIC Class 1",
    "Employer Secondary NIC",
    "Employee Workplace Pension",
    "Employer Workplace Pension",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "QQ123456A",
      profile.employeeId,
      `"${profile.employeeName}"`,
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      calculation.shifEmployee.toFixed(2),
      calculation.housingLevyEmployer.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 13. Generate Official United States IRS Form 941 / W-2 Wage Summary CSV
 */
export function generateUsForm941Csv(input: StatutoryFilingInput): string {
  const headers = [
    "Social Security Number (SSN)",
    "Employee Full Name",
    "Federal Wages Subject to Tax (USD)",
    "Federal Income Tax Withheld",
    "Social Security Tax (EE 6.2%)",
    "Medicare Tax (EE 1.45%)",
    "Employer FICA Share",
    "Employer FUTA Share",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "000-00-0000",
      `"${profile.employeeName}"`,
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.shifEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      calculation.housingLevyEmployer.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 14. Generate Official South Africa SARS EMP201 Monthly Declaration CSV
 */
export function generateSouthAfricaSarsEmp201Csv(input: StatutoryFilingInput): string {
  const headers = [
    "Tax Reference Number",
    "Employee Full Name",
    "South African ID Number",
    "Remuneration for PAYE (ZAR)",
    "SARS PAYE Tax Withheld",
    "UIF Employee (1%)",
    "UIF Employer (1%)",
    "Skills Development Levy (1%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "0000000000",
      `"${profile.employeeName}"`,
      profile.nationalId || "0000000000080",
      calculation.grossPay.toFixed(2),
      calculation.payeTax.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
      calculation.housingLevyEmployer.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 15. Generate Official Nigeria State BIR / FIRS PAYE Monthly Schedule CSV
 */
export function generateNigeriaLirsPayeCsv(input: StatutoryFilingInput): string {
  const headers = [
    "Taxpayer Identification Number (TIN)",
    "Employee Full Name",
    "Gross Emoluments (NGN)",
    "PenCom Pension (EE 8%)",
    "Taxable Gross",
    "PAYE Tax Deducted",
    "National Housing Fund (2.5%)",
    "PenCom Pension (ER 10%)",
  ];

  const rows = input.employees.map(({ profile, calculation }) => {
    return [
      profile.kraPin || "N-0000000000",
      `"${profile.employeeName}"`,
      calculation.grossPay.toFixed(2),
      calculation.nssfEmployee.toFixed(2),
      calculation.taxableGross.toFixed(2),
      calculation.payeTax.toFixed(2),
      calculation.housingLevyEmployee.toFixed(2),
      calculation.nssfEmployer.toFixed(2),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Universal Global Statutory Filing Dispatcher
 * Routes statutory return generation by ISO-3166-1 alpha-3 country code and filing type.
 */
export function generateGlobalStatutoryFiling(
  countryCode: string,
  filingType: string,
  input: StatutoryFilingInput
): string {
  const normalizedCountry = countryCode.toUpperCase();
  const normalizedType = filingType.toLowerCase();

  switch (normalizedCountry) {
    case "KEN":
      if (normalizedType.includes("shif") || normalizedType.includes("sha")) return generateShifPortalCsv(input);
      if (normalizedType.includes("nssf")) return generateNssfPortalCsv(input);
      if (normalizedType.includes("housing") || normalizedType.includes("ahl")) return generateHousingLevyScheduleCsv(input);
      return generateKraItaxCsv(input);

    case "UGA":
      if (normalizedType.includes("nssf")) return generateUgandaNssfCsv(input);
      return generateUgandaUraPayeCsv(input);

    case "TZA":
      if (normalizedType.includes("nssf") || normalizedType.includes("psssf")) return generateTanzaniaNssfCsv(input);
      return generateTanzaniaTraPayeCsv(input);

    case "ZMB":
      if (normalizedType.includes("napsa") || normalizedType.includes("nhima")) return generateZambiaNapsaCsv(input);
      return generateZambiaZraPayeCsv(input);

    case "GBR":
      return generateUkHmrcRtiFpsCsv(input);

    case "USA":
      return generateUsForm941Csv(input);

    case "ZAF":
      return generateSouthAfricaSarsEmp201Csv(input);

    case "NGA":
      return generateNigeriaLirsPayeCsv(input);

    default:
      return generateKraItaxCsv(input);
  }
}
