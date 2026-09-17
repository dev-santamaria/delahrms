/**
 * =========================================================================================
 * UNIVERSAL GLOBAL STATUTORY PAYROLL ENGINE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * High-performance, multinational statutory computation engine supporting progressive tax
 * brackets, tiered social security/pension formulas, statutory healthcare, training levies,
 * dynamic employee tax reliefs (exemptions & tax credits), and multi-currency calculations.
 * 
 * Supported Pan-African & Global Jurisdictions:
 * - Kenya (KRA): Progressive PAYE (10%-35%), NSSF Tier I & II, SHIF 2.75%, Housing Levy 1.5%
 * - Uganda (URA): Progressive PAYE (0%-40%), NSSF Uganda (5% EE + 10% ER), LST Exemption
 * - Tanzania (TRA): Progressive PAYE (0%-30%), NSSF/PSSSF (10% EE + 10% ER), WCF (0.5%), SDL (3.5%)
 * - Zambia (ZRA): Progressive PAYE (0%-37%), NAPSA Pension (5% EE + 5% ER capped), NHIMA (1% EE + 1% ER)
 * - United Kingdom (HMRC): Progressive PAYE with Personal Allowance, NIC Class 1, Auto-Enrollment Pension
 * - United States (IRS/SSA): Federal Withholding Brackets, FICA Social Security, Medicare, FUTA
 * - South Africa (SARS): Progressive PAYE, Unemployment Insurance (UIF 1%), Skills Development Levy (SDL 1%)
 * - Nigeria (FIRS/LIRS): Progressive PAYE, PenCom Pension (8% EE + 10% ER), National Housing Fund (NHF 2.5%)
 * 
 * Invariants & Regulatory Precision:
 * - All monetary calculations are rounded to 2 decimal places to ensure zero financial discrepancy.
 * - Tax reliefs are split into Pre-Tax Exemptions (which reduce taxable gross) and Tax Credits (which directly offset PAYE liability).
 * =========================================================================================
 */

export interface TaxBracket {
  from: number;
  to: number | null; // null means and above
  rate: number; // e.g. 0.10 for 10%
}

export interface StatutoryConfig {
  countryCode: string;
  currency: string;
  payeBrackets: TaxBracket[];
  personalReliefMonthly: number;
  insuranceReliefRate: number;
  maxInsuranceReliefMonthly: number;
  nssfConfig: {
    tier1Limit: number; // e.g. 7,000 KES
    tier2Limit: number; // e.g. 36,000 KES
    employeeRate: number; // e.g. 0.06 (6%)
    employerRate: number; // e.g. 0.06 (6%)
  };
  shifConfig: {
    rate: number; // e.g. 0.0275 (2.75%)
    minContribution: number;
  };
  housingLevyConfig: {
    employeeRate: number; // e.g. 0.015 (1.5%)
    employerRate: number; // e.g. 0.015 (1.5%)
  };
}

/**
 * Standard Kenya 2026 Statutory Preset (KRA PAYE, NSSF Tier I & II, SHIF 2.75%, Housing Levy 1.5%)
 */
export const KENYA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "KEN",
  currency: "KES",
  payeBrackets: [
    { from: 0, to: 24000, rate: 0.10 },
    { from: 24000, to: 32333, rate: 0.25 },
    { from: 32333, to: 500000, rate: 0.30 },
    { from: 500000, to: 800000, rate: 0.325 },
    { from: 800000, to: null, rate: 0.35 },
  ],
  personalReliefMonthly: 2400,
  insuranceReliefRate: 0.15,
  maxInsuranceReliefMonthly: 5000,
  nssfConfig: {
    tier1Limit: 7000,
    tier2Limit: 36000,
    employeeRate: 0.06,
    employerRate: 0.06,
  },
  shifConfig: {
    rate: 0.0275,
    minContribution: 300,
  },
  housingLevyConfig: {
    employeeRate: 0.015,
    employerRate: 0.015,
  },
};

/**
 * Standard United Kingdom 2026 Statutory Preset (HMRC PAYE, NIC Class 1, Auto-Enrollment Pension)
 */
export const UK_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "GBR",
  currency: "GBP",
  payeBrackets: [
    { from: 0, to: 1047.50, rate: 0.00 }, // Personal Allowance £12,570/yr
    { from: 1047.50, to: 4189.17, rate: 0.20 }, // Basic Rate 20%
    { from: 4189.17, to: 10428.33, rate: 0.40 }, // Higher Rate 40%
    { from: 10428.33, to: null, rate: 0.45 }, // Additional Rate 45%
  ],
  personalReliefMonthly: 0,
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 1048,
    tier2Limit: 4189,
    employeeRate: 0.08, // 8% National Insurance
    employerRate: 0.138, // 13.8% Secondary Class 1 NI
  },
  shifConfig: {
    rate: 0.05, // 5% Employee Qualifying Workplace Pension
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.03, // 3% Employer Minimum Pension Contribution
  },
};

/**
 * Standard United States 2026 Statutory Preset (Federal Withholding, FICA Social Security & Medicare)
 */
export const US_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "USA",
  currency: "USD",
  payeBrackets: [
    { from: 0, to: 967, rate: 0.10 },
    { from: 967, to: 3929, rate: 0.12 },
    { from: 3929, to: 8379, rate: 0.22 },
    { from: 8379, to: 15993, rate: 0.24 },
    { from: 15993, to: 20308, rate: 0.32 },
    { from: 20308, to: 50775, rate: 0.35 },
    { from: 50775, to: null, rate: 0.37 },
  ],
  personalReliefMonthly: 0,
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 14050, // FICA OASDI Wage Base Monthly Limit
    tier2Limit: 14050,
    employeeRate: 0.062, // 6.2% Social Security
    employerRate: 0.062, // 6.2% Social Security
  },
  shifConfig: {
    rate: 0.0145, // 1.45% Medicare
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.006, // 0.6% FUTA (Federal Unemployment)
  },
};

/**
 * Standard South Africa 2026 Statutory Preset (SARS PAYE, UIF, Skills Development Levy)
 */
export const SOUTH_AFRICA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "ZAF",
  currency: "ZAR",
  payeBrackets: [
    { from: 0, to: 19770, rate: 0.18 },
    { from: 19770, to: 30875, rate: 0.26 },
    { from: 30875, to: 42708, rate: 0.31 },
    { from: 42708, to: 56041, rate: 0.36 },
    { from: 56041, to: 71666, rate: 0.39 },
    { from: 71666, to: 151458, rate: 0.41 },
    { from: 151458, to: null, rate: 0.45 },
  ],
  personalReliefMonthly: 1435, // Primary Rebate
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 17712, // UIF Ceiling
    tier2Limit: 17712,
    employeeRate: 0.01, // 1% UIF
    employerRate: 0.01, // 1% UIF
  },
  shifConfig: {
    rate: 0.00,
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.01, // 1% Skills Development Levy (SDL)
  },
};

/**
 * Standard Nigeria 2026 Statutory Preset (Personal Income Tax, PenCom Pension 8%/10%, NHF)
 */
export const NIGERIA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "NGA",
  currency: "NGN",
  payeBrackets: [
    { from: 0, to: 25000, rate: 0.07 },
    { from: 25000, to: 50000, rate: 0.11 },
    { from: 50000, to: 91666, rate: 0.15 },
    { from: 91666, to: 133333, rate: 0.19 },
    { from: 133333, to: 266666, rate: 0.21 },
    { from: 266666, to: null, rate: 0.24 },
  ],
  personalReliefMonthly: 16666, // Consolidated Relief Allowance component
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 10000000,
    tier2Limit: 10000000,
    employeeRate: 0.08, // 8% PenCom Pension
    employerRate: 0.10, // 10% PenCom Pension
  },
  shifConfig: {
    rate: 0.00,
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.025, // 2.5% National Housing Fund (NHF)
    employerRate: 0.00,
  },
};

/**
 * Standard Uganda 2026 Statutory Preset (URA PAYE, NSSF Uganda 5% EE / 10% ER)
 * Regulated under Uganda Income Tax Act and NSSF Act Cap 222.
 */
export const UGANDA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "UGA",
  currency: "UGX",
  payeBrackets: [
    { from: 0, to: 235000, rate: 0.00 }, // Threshold exempt
    { from: 235000, to: 335000, rate: 0.10 },
    { from: 335000, to: 410000, rate: 0.20 },
    { from: 410000, to: 10000000, rate: 0.30 },
    { from: 10000000, to: null, rate: 0.40 }, // High earner additional 10%
  ],
  personalReliefMonthly: 0,
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 100000000, // Standard mandatory NSSF on gross earnings
    tier2Limit: 100000000,
    employeeRate: 0.05, // 5% Employee Contribution
    employerRate: 0.10, // 10% Employer Contribution
  },
  shifConfig: {
    rate: 0.00,
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.00,
  },
};

/**
 * Standard Tanzania 2026 Statutory Preset (TRA PAYE, NSSF/PSSSF 10% EE / 10% ER, WCF 0.5%, SDL 3.5%)
 * Regulated under Tanzania Income Tax Act 2004, NSSF Act, and WCF Act.
 */
export const TANZANIA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "TZA",
  currency: "TZS",
  payeBrackets: [
    { from: 0, to: 270000, rate: 0.00 }, // Tax-free band
    { from: 270000, to: 520000, rate: 0.08 },
    { from: 520000, to: 760000, rate: 0.20 },
    { from: 760000, to: 1000000, rate: 0.25 },
    { from: 1000000, to: null, rate: 0.30 },
  ],
  personalReliefMonthly: 0,
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 100000000,
    tier2Limit: 100000000,
    employeeRate: 0.10, // 10% Employee Contribution
    employerRate: 0.10, // 10% Employer Contribution
  },
  shifConfig: {
    rate: 0.00,
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.04, // 3.5% Skills Development Levy (SDL) + 0.5% Workers Compensation Fund (WCF)
  },
};

/**
 * Standard Zambia 2026 Statutory Preset (ZRA PAYE, NAPSA 5% EE / 5% ER with ceiling, NHIMA 1% EE / 1% ER)
 * Regulated under Zambia Income Tax Act, National Pension Scheme Act, and National Health Insurance Act.
 */
export const ZAMBIA_STATUTORY_PRESET: StatutoryConfig = {
  countryCode: "ZMB",
  currency: "ZMW",
  payeBrackets: [
    { from: 0, to: 5100, rate: 0.00 }, // Tax-exempt band
    { from: 5100, to: 7100, rate: 0.20 },
    { from: 7100, to: 9200, rate: 0.30 },
    { from: 9200, to: null, rate: 0.37 },
  ],
  personalReliefMonthly: 0,
  insuranceReliefRate: 0,
  maxInsuranceReliefMonthly: 0,
  nssfConfig: {
    tier1Limit: 33408, // NAPSA statutory monthly ceiling
    tier2Limit: 33408,
    employeeRate: 0.05, // 5% NAPSA Employee (capped)
    employerRate: 0.05, // 5% NAPSA Employer (capped)
  },
  shifConfig: {
    rate: 0.01, // 1% NHIMA National Health Insurance (Employee)
    minContribution: 0,
  },
  housingLevyConfig: {
    employeeRate: 0.00,
    employerRate: 0.01, // 1% NHIMA National Health Insurance (Employer)
  },
};

/**
 * Universal Global Statutory Registry
 */
export const GLOBAL_STATUTORY_REGISTRY: Record<string, StatutoryConfig> = {
  KEN: KENYA_STATUTORY_PRESET,
  GBR: UK_STATUTORY_PRESET,
  USA: US_STATUTORY_PRESET,
  ZAF: SOUTH_AFRICA_STATUTORY_PRESET,
  NGA: NIGERIA_STATUTORY_PRESET,
  UGA: UGANDA_STATUTORY_PRESET,
  TZA: TANZANIA_STATUTORY_PRESET,
  ZMB: ZAMBIA_STATUTORY_PRESET,
};

/**
 * Retrieves statutory payroll configuration by ISO-3166-1 alpha-3 country code
 */
export function getStatutoryConfigForCountry(countryCode: string): StatutoryConfig {
  const normalized = countryCode.toUpperCase();
  return GLOBAL_STATUTORY_REGISTRY[normalized] || KENYA_STATUTORY_PRESET;
}

import { calculateKenyanCarBenefit } from "../../../db/schema/fleet-vehicles";

export interface EmployeePayrollInput {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  allowances: {
    code: string;
    name: string;
    amount: number;
    isTaxable: boolean;
  }[];
  customDeductions: {
    code: string;
    name: string;
    amount: number;
    isPreTax: boolean;
  }[];
  companyCar?: Parameters<typeof calculateKenyanCarBenefit>[0] & {
    registrationNumber?: string;
  };
  pensionEnrollment?: {
    schemeId?: string;
    schemeName: string;
    schemeCode: string;
    memberNumber?: string;
    employeeRate?: number; // e.g. 0.05 for 5%
    employeeFixedAmount?: number;
    voluntaryAvcAmount?: number;
    employerRate?: number; // e.g. 0.05 for 5%
    isTaxDeductible?: boolean;
    statutoryTaxExemptCapMonthly?: number; // defaults to KES 20,000 in Kenya
    sharesCapWithNssf?: boolean; // defaults to true in Kenya
  };
  benefits?: {
    code: string;
    name: string;
    employeeCost: number;
    employerCost: number;
    isPreTax: boolean;
  }[];
  earnedWageAdvance?: {
    advanceId: string;
    repaymentAmount: number;
  };
  expenseReimbursements?: {
    claimId: string;
    claimNumber: string;
    amount: number;
    description: string;
  }[];
  companyLoanRepayments?: {
    loanId: string;
    loanNumber: string;
    installmentNumber: number;
    amount: number;
    remainingBalance?: number;
    staffInterestRate?: number; // e.g. 0.03 for 3%
    kraMarketLendingRate?: number; // e.g. 0.15 for 15%
  }[];
  thirdPartyRemittances?: {
    mandateId: string;
    institutionName: string;
    institutionCode: string;
    remittanceType: string;
    memberOrPolicyNumber: string;
    loanAccountNumber?: string;
    productName?: string;
    amount: number;
    principalPortion?: number;
    interestPortion?: number;
  }[];
  nhifOrShifReliefEligible?: boolean;
  taxReliefs?: {
    reliefType: string;
    code: string;
    name: string;
    amount: number;
    isPreTaxDeduction: boolean; // Pre-tax exemption (reduces taxable gross, e.g. PWD, mortgage interest)
    isTaxCredit: boolean; // Tax credit (directly offsets PAYE liability)
  }[];
}

export interface CalculatedPayrollResult {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  totalAllowances: number;
  grossPay: number;
  carBenefitTaxable: number;
  
  // Statutory deductions
  nssfEmployee: number;
  nssfEmployer: number;
  shifEmployee: number;
  housingLevyEmployee: number;
  housingLevyEmployer: number;
  nitaEmployer: number;
  
  // Pension breakdown
  pensionEmployeeTaxExempt: number;
  pensionEmployeeTaxable: number;
  pensionEmployer: number;

  // Tax calculation
  taxableGross: number;
  taxBeforeRelief: number;
  personalRelief: number;
  insuranceRelief: number;
  totalTaxReliefs: number;
  payeTax: number;
  
  // Custom deductions & Recoveries
  otherDeductions: number;
  totalLoanRepayments: number;
  totalThirdPartyRemittances: number;
  totalReimbursements: number;
  totalDeductions: number;
  
  // Net pay and Employer costs
  netPay: number;
  minimumAllowableNetPay: number; // Kenyan 1/3 Rule (Section 19(3) Employment Act)
  isOneThirdRuleViolated: boolean;
  oneThirdRuleDeficit: number;

  employerBenefitCost: number;
  fringeBenefitTaxEmployer: number; // KRA Section 12B FBT on low-interest staff loans
  totalEmployerCost: number;
  costToCompany: number;
  
  lineItems: {
    code: string;
    name: string;
    type: "earning" | "deduction" | "employer_contribution";
    amount: number;
    isTaxable: boolean;
  }[];
}


/**
 * Calculates progressive tax across defined tax brackets.
 */
export function calculateProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;
  
  let totalTax = 0;
  
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.from) continue;
    
    const bracketCeiling = bracket.to !== null ? bracket.to : Infinity;
    const taxableInThisBracket = Math.min(taxableIncome, bracketCeiling) - bracket.from;
    
    if (taxableInThisBracket > 0) {
      totalTax += taxableInThisBracket * bracket.rate;
    }
  }
  
  return Math.round(totalTax * 100) / 100;
}

/**
 * Calculates tiered NSSF (Social Security).
 */
export function calculateNssf(
  pensionableEarnings: number,
  config: StatutoryConfig["nssfConfig"]
): { employee: number; employer: number } {
  if (pensionableEarnings <= 0) return { employee: 0, employer: 0 };

  const tier1Earnings = Math.min(pensionableEarnings, config.tier1Limit);
  const tier1Amount = tier1Earnings * config.employeeRate;

  let tier2Amount = 0;
  if (pensionableEarnings > config.tier1Limit) {
    const tier2Earnings = Math.min(pensionableEarnings, config.tier2Limit) - config.tier1Limit;
    tier2Amount = tier2Earnings * config.employeeRate;
  }

  const totalEmployee = Math.round((tier1Amount + tier2Amount) * 100) / 100;
  const totalEmployer = Math.round(
    (tier1Earnings * config.employerRate +
      (pensionableEarnings > config.tier1Limit
        ? (Math.min(pensionableEarnings, config.tier2Limit) - config.tier1Limit) * config.employerRate
        : 0)) * 100
  ) / 100;

  return { employee: totalEmployee, employer: totalEmployer };
}

/**
 * Calculates comprehensive payroll for an individual employee.
 */
export function calculateEmployeePayroll(
  input: EmployeePayrollInput,
  config: StatutoryConfig = KENYA_STATUTORY_PRESET
): CalculatedPayrollResult {
  const lineItems: CalculatedPayrollResult["lineItems"] = [];

  // 1. Basic Salary
  lineItems.push({
    code: "BASIC",
    name: "Basic Salary",
    type: "earning",
    amount: input.basicSalary,
    isTaxable: true,
  });

  // 2. Allowances
  let totalAllowances = 0;
  let taxableAllowances = 0;
  for (const allowance of input.allowances) {
    totalAllowances += allowance.amount;
    if (allowance.isTaxable) {
      taxableAllowances += allowance.amount;
    }
    lineItems.push({
      code: allowance.code,
      name: allowance.name,
      type: "earning",
      amount: allowance.amount,
      isTaxable: allowance.isTaxable,
    });
  }

  const grossPay = Math.round((input.basicSalary + totalAllowances) * 100) / 100;

  // 3. Statutory Deductions
  // NSSF (pre-tax pension deduction in Kenya)
  const nssf = calculateNssf(grossPay, config.nssfConfig);
  lineItems.push({
    code: "NSSF_EE",
    name: "NSSF Employee Contribution",
    type: "deduction",
    amount: nssf.employee,
    isTaxable: false,
  });
  lineItems.push({
    code: "NSSF_ER",
    name: "NSSF Employer Contribution",
    type: "employer_contribution",
    amount: nssf.employer,
    isTaxable: false,
  });

  // SHIF (Social Health Insurance Fund)
  const rawShif = grossPay * config.shifConfig.rate;
  const shifEmployee = Math.round(Math.max(rawShif, config.shifConfig.minContribution) * 100) / 100;
  lineItems.push({
    code: "SHIF",
    name: "Social Health Insurance (SHIF)",
    type: "deduction",
    amount: shifEmployee,
    isTaxable: false,
  });

  // Affordable Housing Levy
  const housingLevyEmployee = Math.round(grossPay * config.housingLevyConfig.employeeRate * 100) / 100;
  const housingLevyEmployer = Math.round(grossPay * config.housingLevyConfig.employerRate * 100) / 100;
  lineItems.push({
    code: "HOUSING_LEVY_EE",
    name: "Housing Levy Employee (1.5%)",
    type: "deduction",
    amount: housingLevyEmployee,
    isTaxable: false,
  });
  lineItems.push({
    code: "HOUSING_LEVY_ER",
    name: "Housing Levy Employer (1.5%)",
    type: "employer_contribution",
    amount: housingLevyEmployer,
    isTaxable: false,
  });

  // NITA Levy (KES 50 Employer Contribution in Kenya under Industrial Training Act)
  const nitaEmployer = config.countryCode === "KEN" ? 50 : 0;
  if (nitaEmployer > 0) {
    lineItems.push({
      code: "NITA_ER",
      name: "NITA Levy (Employer Contribution)",
      type: "employer_contribution",
      amount: nitaEmployer,
      isTaxable: false,
    });
  }

  // 4. Company Car Benefit Tax (Kenya Section 5(4) of Income Tax Act)
  let carBenefitTaxable = 0;
  if (input.companyCar) {
    const carCalc = calculateKenyanCarBenefit(input.companyCar);
    carBenefitTaxable = carCalc.totalTaxableCarBenefit;
    if (carBenefitTaxable > 0) {
      lineItems.push({
        code: "CAR_BENEFIT",
        name: `Company Car Benefit (${input.companyCar.registrationNumber || "Fleet"} - ${carCalc.rateApplied})`,
        type: "earning",
        amount: carBenefitTaxable,
        isTaxable: true,
      });
    }
  }

  // 5. Custom Pre-tax Deductions, Dynamic Pension Schemes & Benefits
  let totalPreTaxDeductions = nssf.employee; // NSSF is tax-deductible
  let otherDeductions = 0;
  let totalEmployerBenefitCost = 0;

  // Process Generic Retirement Pension Scheme (e.g. Octagon, ICEA Lion, Zamara, or in-house trust)
  let pensionEmployeeTaxExempt = 0;
  let pensionEmployeeTaxable = 0;
  let pensionEmployer = 0;
  if (input.pensionEnrollment) {
    const pen = input.pensionEnrollment;
    const normalRate = pen.employeeRate ?? 0.05;
    const normalAmount = pen.employeeFixedAmount ?? Math.round((input.basicSalary * normalRate) * 100) / 100;
    const avcAmount = pen.voluntaryAvcAmount ?? 0;
    const totalEmployeeContribution = Math.round((normalAmount + avcAmount) * 100) / 100;

    // Under Kenya Section 15(7)(b), statutory pre-tax limit is KES 20,000 shared with NSSF
    const statutoryCap = pen.statutoryTaxExemptCapMonthly ?? 20000;
    const nssfOffset = pen.sharesCapWithNssf !== false ? nssf.employee : 0;
    const remainingCap = Math.max(0, statutoryCap - nssfOffset);

    if (pen.isTaxDeductible !== false) {
      pensionEmployeeTaxExempt = Math.min(totalEmployeeContribution, remainingCap);
      pensionEmployeeTaxable = Math.round((totalEmployeeContribution - pensionEmployeeTaxExempt) * 100) / 100;
    } else {
      pensionEmployeeTaxable = totalEmployeeContribution;
    }

    totalPreTaxDeductions += pensionEmployeeTaxExempt;
    otherDeductions += pensionEmployeeTaxable;

    if (pensionEmployeeTaxExempt > 0) {
      lineItems.push({
        code: `${pen.schemeCode}_EE_TAX_FREE`,
        name: `${pen.schemeName} (Tax-Exempt Employee Contribution)`,
        type: "deduction",
        amount: pensionEmployeeTaxExempt,
        isTaxable: false,
      });
    }
    if (pensionEmployeeTaxable > 0) {
      lineItems.push({
        code: `${pen.schemeCode}_EE_TAXABLE`,
        name: `${pen.schemeName} (Post-Tax Employee Excess/AVC)`,
        type: "deduction",
        amount: pensionEmployeeTaxable,
        isTaxable: false,
      });
    }

    const erRate = pen.employerRate ?? normalRate;
    pensionEmployer = Math.round((input.basicSalary * erRate) * 100) / 100;
    if (pensionEmployer > 0) {
      lineItems.push({
        code: `${pen.schemeCode}_ER`,
        name: `${pen.schemeName} (Employer Matching Contribution)`,
        type: "employer_contribution",
        amount: pensionEmployer,
        isTaxable: false,
      });
    }
  }

  // Process employee benefit enrollments (health, dental, life)
  if (input.benefits && Array.isArray(input.benefits)) {
    for (const b of input.benefits) {
      if (b.isPreTax) {
        totalPreTaxDeductions += b.employeeCost;
      } else {
        otherDeductions += b.employeeCost;
      }
      if (b.employeeCost > 0) {
        lineItems.push({
          code: b.code,
          name: `${b.name} (Employee Share)`,
          type: "deduction",
          amount: b.employeeCost,
          isTaxable: false,
        });
      }
      if (b.employerCost > 0) {
        totalEmployerBenefitCost += b.employerCost;
        lineItems.push({
          code: `${b.code}_ER`,
          name: `${b.name} (Employer Contribution)`,
          type: "employer_contribution",
          amount: b.employerCost,
          isTaxable: false,
        });
      }
    }
  }

  for (const deduction of input.customDeductions) {
    if (deduction.isPreTax) {
      totalPreTaxDeductions += deduction.amount;
    } else {
      otherDeductions += deduction.amount;
    }
    lineItems.push({
      code: deduction.code,
      name: deduction.name,
      type: "deduction",
      amount: deduction.amount,
      isTaxable: false,
    });
  }

  // Process dynamic employee tax reliefs & exemptions (e.g. from employee_tax_reliefs table)
  let preTaxReliefTotal = 0;
  let taxCreditReliefTotal = 0;
  if (input.taxReliefs && Array.isArray(input.taxReliefs)) {
    for (const r of input.taxReliefs) {
      if (r.isPreTaxDeduction && r.amount > 0) {
        preTaxReliefTotal += r.amount;
        totalPreTaxDeductions += r.amount;
        lineItems.push({
          code: r.code || "TAX_EXEMPT",
          name: `${r.name} (Pre-Tax Statutory Exemption)`,
          type: "deduction",
          amount: r.amount,
          isTaxable: false,
        });
      } else if (r.isTaxCredit && r.amount > 0) {
        taxCreditReliefTotal += r.amount;
        lineItems.push({
          code: r.code || "TAX_CREDIT",
          name: `${r.name} (Tax Credit Relief)`,
          type: "deduction",
          amount: r.amount,
          isTaxable: false,
        });
      }
    }
  }

  // 6. Taxable Gross & PAYE (Non-cash car benefit added to taxable base)
  const taxableGross = Math.max(0, Math.round((grossPay + carBenefitTaxable - totalPreTaxDeductions) * 100) / 100);
  const taxBeforeRelief = calculateProgressiveTax(taxableGross, config.payeBrackets);

  // Reliefs
  const personalRelief = config.personalReliefMonthly;
  const insuranceRelief = Math.min(
    Math.round(shifEmployee * config.insuranceReliefRate * 100) / 100,
    config.maxInsuranceReliefMonthly
  );

  const totalRelief = personalRelief + insuranceRelief + taxCreditReliefTotal;
  const totalCombinedReliefs = Math.round((totalRelief + preTaxReliefTotal) * 100) / 100;
  const payeTax = Math.max(0, Math.round((taxBeforeRelief - totalRelief) * 100) / 100);

  lineItems.push({
    code: "PAYE",
    name: "Income Tax (PAYE)",
    type: "deduction",
    amount: payeTax,
    isTaxable: false,
  });

  // Process Earned Wage Access (EWA) advance recovery (post-tax reduction)
  if (input.earnedWageAdvance && input.earnedWageAdvance.repaymentAmount > 0) {
    otherDeductions += input.earnedWageAdvance.repaymentAmount;
    lineItems.push({
      code: "EWA_RECOVERY",
      name: "Earned Wage Access (Salary Advance Repayment)",
      type: "deduction",
      amount: input.earnedWageAdvance.repaymentAmount,
      isTaxable: false,
    });
  }

  // Process Company Loan Repayments & Section 12B Fringe Benefit Tax (FBT)
  let totalLoanRepayments = 0;
  let totalFbtEmployer = 0;
  if (input.companyLoanRepayments && Array.isArray(input.companyLoanRepayments)) {
    for (const loan of input.companyLoanRepayments) {
      totalLoanRepayments += loan.amount;
      lineItems.push({
        code: `LOAN_${loan.loanNumber}`,
        name: `Company Loan Repayment (#${loan.loanNumber} - Inst ${loan.installmentNumber})`,
        type: "deduction",
        amount: loan.amount,
        isTaxable: false,
      });

      // Calculate FBT under Section 12B if staff loan interest is below KRA market lending rate (typically 15%)
      if (loan.remainingBalance && loan.staffInterestRate !== undefined) {
        const marketRate = loan.kraMarketLendingRate ?? 0.15;
        if (marketRate > loan.staffInterestRate) {
          const monthlyFringeBenefit = loan.remainingBalance * (marketRate - loan.staffInterestRate) / 12;
          const fbtOnLoan = Math.round(monthlyFringeBenefit * 0.30 * 100) / 100; // 30% corporation tax rate
          totalFbtEmployer += fbtOnLoan;
          if (fbtOnLoan > 0) {
            lineItems.push({
              code: `FBT_LOAN_${loan.loanNumber}`,
              name: `Fringe Benefit Tax on Staff Loan #${loan.loanNumber} (Employer Liability: 30%)`,
              type: "employer_contribution",
              amount: fbtOnLoan,
              isTaxable: false,
            });
          }
        }
      }
    }
  }

  // Process Third-Party Institutional Remittances (Multi-Cooperatives, Insurance Policies, HELB)
  let totalThirdPartyRemittances = 0;
  if (input.thirdPartyRemittances && Array.isArray(input.thirdPartyRemittances)) {
    for (const rem of input.thirdPartyRemittances) {
      totalThirdPartyRemittances += rem.amount;
      const labelDetails = rem.loanAccountNumber
        ? `Loan #${rem.loanAccountNumber}`
        : (rem.productName || rem.remittanceType);
      lineItems.push({
        code: `REM_${rem.institutionCode}`,
        name: `${rem.institutionName} (${labelDetails} - Ref: ${rem.memberOrPolicyNumber})`,
        type: "deduction",
        amount: rem.amount,
        isTaxable: false,
      });
    }
  }

  // Process Approved Employee Expense Claims (Reimbursements added tax-free to net pay)
  let totalReimbursements = 0;
  if (input.expenseReimbursements && Array.isArray(input.expenseReimbursements)) {
    for (const claim of input.expenseReimbursements) {
      totalReimbursements += claim.amount;
      lineItems.push({
        code: `EXP_${claim.claimNumber}`,
        name: `Expense Reimbursement (${claim.claimNumber}: ${claim.description})`,
        type: "earning",
        amount: claim.amount,
        isTaxable: false,
      });
    }
  }

  // 7. Net Pay Calculation & Kenyan One-Third (1/3) Net Pay Rule Safeguard
  const totalDeductions = Math.round(
    (nssf.employee +
      shifEmployee +
      housingLevyEmployee +
      payeTax +
      otherDeductions +
      totalLoanRepayments +
      totalThirdPartyRemittances) *
      100
  ) / 100;

  // Final Net Pay (carBenefitTaxable is a non-cash benefit, so it is not added to cash net pay)
  const netPay = Math.round((grossPay - totalDeductions + totalReimbursements) * 100) / 100;
  
  // Section 19(3) Employment Act 2007: Net pay must not fall below 1/3 of Basic Salary
  const minimumAllowableNetPay = Math.round((input.basicSalary / 3) * 100) / 100;
  const isOneThirdRuleViolated = netPay < minimumAllowableNetPay;
  const oneThirdRuleDeficit = isOneThirdRuleViolated
    ? Math.round((minimumAllowableNetPay - netPay) * 100) / 100
    : 0;

  const totalEmployerCost = Math.round(
    (nssf.employer +
      housingLevyEmployer +
      nitaEmployer +
      pensionEmployer +
      totalEmployerBenefitCost +
      totalFbtEmployer) *
      100
  ) / 100;
  const costToCompany = Math.round((grossPay + totalEmployerCost) * 100) / 100;

  return {
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    basicSalary: input.basicSalary,
    totalAllowances: Math.round(totalAllowances * 100) / 100,
    grossPay,
    carBenefitTaxable,
    nssfEmployee: nssf.employee,
    nssfEmployer: nssf.employer,
    shifEmployee,
    housingLevyEmployee,
    housingLevyEmployer,
    nitaEmployer,
    pensionEmployeeTaxExempt,
    pensionEmployeeTaxable,
    pensionEmployer,
    taxableGross,
    taxBeforeRelief,
    personalRelief,
    insuranceRelief,
    totalTaxReliefs: totalCombinedReliefs,
    payeTax,
    otherDeductions: Math.round(otherDeductions * 100) / 100,
    totalLoanRepayments: Math.round(totalLoanRepayments * 100) / 100,
    totalThirdPartyRemittances: Math.round(totalThirdPartyRemittances * 100) / 100,
    totalReimbursements: Math.round(totalReimbursements * 100) / 100,
    totalDeductions,
    netPay,
    minimumAllowableNetPay,
    isOneThirdRuleViolated,
    oneThirdRuleDeficit,
    employerBenefitCost: Math.round(totalEmployerBenefitCost * 100) / 100,
    fringeBenefitTaxEmployer: Math.round(totalFbtEmployer * 100) / 100,
    totalEmployerCost,
    costToCompany,
    lineItems,
  };
}
