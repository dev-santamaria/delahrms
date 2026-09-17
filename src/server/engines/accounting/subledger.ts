/**
 * =========================================================================================
 * DOUBLE-ENTRY WORKFORCE ACCOUNTING & SUB-LEDGER POSTING ENGINE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Fully automated, immutable subledger engine generating balanced debit and credit journal
 * vouchers for multinational payroll runs. Strictly complies with international GAAP/IFRS
 * accounting standards, validating the universal double-entry invariant:
 * Sum(Debits) === Sum(Credits) with zero cent discrepancy.
 * 
 * Multi-Country & Dynamic Chart of Accounts (COA) Presets:
 * - Universal IFRS/GAAP: Standard international cost centers and liability accounts
 * - Kenya (KRA): KRA PAYE, NSSF Kenya, SHIF, Affordable Housing Levy
 * - Uganda (URA): URA PAYE Withholding, NSSF Uganda (EE + ER), Local Service Tax
 * - Tanzania (TRA): TRA PAYE Withholding, NSSF/PSSSF Tanzania, WCF, SDL
 * - Zambia (ZRA): ZRA PAYE Withholding, NAPSA Pension Liability, NHIMA Health Insurance
 * - United Kingdom (HMRC): HMRC PAYE, Secondary Class 1 NIC, Workplace Pension (NEST)
 * - United States (IRS): IRS Federal Withholding, FICA Social Security, Medicare, FUTA
 * - South Africa (SARS): SARS PAYE, Unemployment Insurance (UIF), Skills Development Levy (SDL)
 * - Nigeria (FIRS): State BIR / FIRS PAYE, PenCom Pension, National Housing Fund (NHF)
 * 
 * ERP Integration Mesh:
 * - Direct SAP BAPI/RFC document formatting
 * - ERPNext Journal Entry REST payload generation
 * - Subledger auditability with naming series voucher numbering
 * =========================================================================================
 */

import { CalculatedPayrollResult } from "../payroll/engine";

export interface JournalVoucherLine {
  accountCode: string;
  accountName: string;
  accountType: "expense" | "liability" | "asset";
  costCenterCode?: string;
  departmentName?: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

export interface DoubleEntryVoucher {
  voucherNumber: string;
  entryDate: string;
  postingDate: string;
  organizationId: string;
  organizationName: string;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  discrepancy: number;
  lines: JournalVoucherLine[];
}

export interface PayrollAccountingInput {
  organizationId: string;
  organizationName: string;
  currency: string;
  countryCode?: string; // ISO-3166-1 alpha-3 code (e.g. "KEN", "UGA", "TZA", "ZMB", "GBR", "USA", "ZAF", "NGA")
  payrollRunNumber: string;
  voucherNumber?: string;
  postingDate: string;
  results: CalculatedPayrollResult[];
  chartOfAccounts?: Partial<ChartOfAccountsMapping>;
}

export interface AccountMappingItem {
  code: string;
  name: string;
  type: "expense" | "liability" | "asset";
}

export interface ChartOfAccountsMapping {
  BASIC_SALARY_EXPENSE: AccountMappingItem;
  ALLOWANCES_EXPENSE: AccountMappingItem;
  REIMBURSED_EXPENSES: AccountMappingItem;
  NSSF_EMPLOYER_EXPENSE: AccountMappingItem;
  HOUSING_LEVY_EMPLOYER_EXPENSE: AccountMappingItem;
  EMPLOYER_BENEFITS_EXPENSE: AccountMappingItem;

  STAFF_LOANS_RECEIVABLE: AccountMappingItem;

  NET_SALARIES_PAYABLE: AccountMappingItem;
  PAYE_TAX_PAYABLE: AccountMappingItem;
  NSSF_PAYABLE: AccountMappingItem;
  SHIF_PAYABLE: AccountMappingItem;
  HOUSING_LEVY_PAYABLE: AccountMappingItem;
  EMPLOYER_BENEFITS_PAYABLE: AccountMappingItem;
  THIRD_PARTY_REMITTANCES_PAYABLE: AccountMappingItem;
  OTHER_DEDUCTIONS_PAYABLE: AccountMappingItem;
}

/**
 * Standard Universal IFRS / US GAAP General Ledger Accounts
 */
export const IFRS_GAAP_COA_PRESET: ChartOfAccountsMapping = {
  BASIC_SALARY_EXPENSE: { code: "60100", name: "Gross Salaries & Wages Expense", type: "expense" },
  ALLOWANCES_EXPENSE: { code: "60110", name: "Staff Allowances & Benefits Expense", type: "expense" },
  REIMBURSED_EXPENSES: { code: "60150", name: "Staff Reimbursed Business Expenses", type: "expense" },
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer Pension & Social Security Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Employer Statutory Levy Expense", type: "expense" },
  EMPLOYER_BENEFITS_EXPENSE: { code: "60230", name: "Employer Health & Benefits Expense", type: "expense" },

  STAFF_LOANS_RECEIVABLE: { code: "10500", name: "Staff Advances & Loans Receivable", type: "asset" },

  NET_SALARIES_PAYABLE: { code: "20100", name: "Net Salaries Payable", type: "liability" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "Statutory Income Tax Withholding Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "Mandatory Social Security Liability (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Mandatory Social Health Insurance Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Statutory Housing / Training Levy Payable (EE + ER)", type: "liability" },
  EMPLOYER_BENEFITS_PAYABLE: { code: "20240", name: "Staff Benefits & Insurance Payable", type: "liability" },
  THIRD_PARTY_REMITTANCES_PAYABLE: { code: "20310", name: "Third-Party Payroll Remittances Payable", type: "liability" },
  OTHER_DEDUCTIONS_PAYABLE: { code: "20300", name: "Other Payroll Deductions Payable", type: "liability" },
};

/**
 * Standard Kenya GL Accounts (KRA, NSSF, SHIF, Affordable Housing Levy)
 */
export const KENYA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer Pension Expense (NSSF Kenya)", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Employer Affordable Housing Levy Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "KRA PAYE Tax Withholding Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "NSSF Kenya Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Social Health Insurance (SHIF) Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Affordable Housing Levy Payable (EE + ER)", type: "liability" },
};

/**
 * Standard Uganda GL Accounts (URA, NSSF Uganda, Local Service Tax)
 */
export const UGANDA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer NSSF Uganda Contribution Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Local Service Tax / Municipal Levy Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "URA PAYE Tax Withholding Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "NSSF Uganda Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Uganda National Health Insurance Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Local Government / Statutory Levies Payable", type: "liability" },
};

/**
 * Standard Tanzania GL Accounts (TRA, NSSF/PSSSF, Skills Development Levy, WCF)
 */
export const TANZANIA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer Pension Expense (NSSF / PSSSF Tanzania)", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Skills Development Levy (SDL) & WCF Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "TRA PAYE Tax Withholding Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "NSSF/PSSSF Tanzania Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Tanzania NHIF Health Insurance Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "SDL & Workers Compensation Fund (WCF) Payable", type: "liability" },
};

/**
 * Standard Zambia GL Accounts (ZRA, NAPSA, NHIMA, WCFCB)
 */
export const ZAMBIA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer NAPSA Pension Contribution Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Employer NHIMA Health Insurance & WCFCB Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "ZRA PAYE Tax Withholding Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "NAPSA Pension Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "NHIMA National Health Insurance Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Workers Compensation & Statutory Levies Payable", type: "liability" },
};

/**
 * Standard United Kingdom GL Accounts (HMRC PAYE, NIC, Workplace Pension)
 */
export const UK_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer Secondary Class 1 NIC Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Employer Qualifying Workplace Pension Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "HMRC PAYE Tax Withheld Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "National Insurance Contributions (NIC) Payable", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Workplace Auto-Enrollment Pension Payable (NEST)", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Apprenticeship Levy / Statutory Payable", type: "liability" },
};

/**
 * Standard United States GL Accounts (IRS Withholding, FICA, Medicare, FUTA)
 */
export const US_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer FICA Social Security Tax Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Employer FUTA / SUTA Unemployment Tax Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "IRS Federal Income Tax Withheld Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "FICA Social Security Taxes Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Medicare Taxes Payable (EE + ER)", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Federal & State Unemployment Taxes Payable", type: "liability" },
};

/**
 * Standard South Africa GL Accounts (SARS PAYE, UIF, Skills Development Levy)
 */
export const SOUTH_AFRICA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer Unemployment Insurance (UIF) Expense", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Skills Development Levy (SDL) Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "SARS PAYE Tax Withheld Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "UIF Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "Compensation Fund / Medical Scheme Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "Skills Development Levy (SDL) Payable", type: "liability" },
};

/**
 * Standard Nigeria GL Accounts (State BIR / FIRS, PenCom, NHF)
 */
export const NIGERIA_COA_PRESET: ChartOfAccountsMapping = {
  ...IFRS_GAAP_COA_PRESET,
  NSSF_EMPLOYER_EXPENSE: { code: "60200", name: "Employer PenCom Pension Expense (10%)", type: "expense" },
  HOUSING_LEVY_EMPLOYER_EXPENSE: { code: "60220", name: "Industrial Training Fund (ITF) Expense", type: "expense" },
  PAYE_TAX_PAYABLE: { code: "20200", name: "State BIR / FIRS PAYE Tax Withheld Payable", type: "liability" },
  NSSF_PAYABLE: { code: "20210", name: "PenCom Pension Contributions Payable (EE + ER)", type: "liability" },
  SHIF_PAYABLE: { code: "20220", name: "National Health Insurance Authority (NHIA) Payable", type: "liability" },
  HOUSING_LEVY_PAYABLE: { code: "20230", name: "National Housing Fund (NHF) Payable", type: "liability" },
};

/**
 * Universal Global Chart of Accounts Registry
 */
export const GLOBAL_HR_COA_PRESETS: Record<string, ChartOfAccountsMapping> = {
  GLOBAL: IFRS_GAAP_COA_PRESET,
  KEN: KENYA_COA_PRESET,
  UGA: UGANDA_COA_PRESET,
  TZA: TANZANIA_COA_PRESET,
  ZMB: ZAMBIA_COA_PRESET,
  GBR: UK_COA_PRESET,
  USA: US_COA_PRESET,
  ZAF: SOUTH_AFRICA_COA_PRESET,
  NGA: NIGERIA_COA_PRESET,
};

/**
 * Fallback Default COA (Kenya for backward-compatibility)
 */
export const DEFAULT_HR_COA = KENYA_COA_PRESET;

/**
 * Generates an immutable, balanced Double-Entry Journal Voucher from payroll results.
 */
export function generatePayrollJournalVoucher(input: PayrollAccountingInput): DoubleEntryVoucher {
  const lines: JournalVoucherLine[] = [];
  const countryKey = (input.countryCode || "GLOBAL").toUpperCase();
  const basePreset = GLOBAL_HR_COA_PRESETS[countryKey] || GLOBAL_HR_COA_PRESETS.GLOBAL;
  const coa: ChartOfAccountsMapping = {
    ...basePreset,
    ...(input.chartOfAccounts || {}),
  };

  // Aggregations
  let totalBasic = 0;
  let totalAllowances = 0;
  let totalReimbursements = 0;
  let totalNssfEr = 0;
  let totalHousingEr = 0;
  let totalEmployerBenefits = 0;

  let totalNetPay = 0;
  let totalPaye = 0;
  let totalNssfTotal = 0;
  let totalShif = 0;
  let totalHousingTotal = 0;
  let totalLoanRepayments = 0;
  let totalThirdPartyRemittances = 0;
  let totalOtherDeductions = 0;

  for (const r of input.results) {
    totalBasic += r.basicSalary;
    totalAllowances += r.totalAllowances;
    totalReimbursements += r.totalReimbursements || 0;
    totalNssfEr += r.nssfEmployer;
    totalHousingEr += r.housingLevyEmployer;
    totalEmployerBenefits += r.employerBenefitCost || 0;

    totalNetPay += r.netPay;
    totalPaye += r.payeTax;
    totalNssfTotal += r.nssfEmployee + r.nssfEmployer;
    totalShif += r.shifEmployee;
    totalHousingTotal += r.housingLevyEmployee + r.housingLevyEmployer;
    totalLoanRepayments += r.totalLoanRepayments || 0;
    totalThirdPartyRemittances += r.totalThirdPartyRemittances || 0;
    totalOtherDeductions += r.otherDeductions;
  }

  // 1. DEBIT: Basic Salaries Expense
  if (totalBasic > 0) {
    lines.push({
      accountCode: coa.BASIC_SALARY_EXPENSE.code,
      accountName: coa.BASIC_SALARY_EXPENSE.name,
      accountType: coa.BASIC_SALARY_EXPENSE.type,
      debitAmount: Math.round(totalBasic * 100) / 100,
      creditAmount: 0,
      description: `Basic salaries for payroll run ${input.payrollRunNumber}`,
    });
  }

  // 2. DEBIT: Staff Allowances Expense
  if (totalAllowances > 0) {
    lines.push({
      accountCode: coa.ALLOWANCES_EXPENSE.code,
      accountName: coa.ALLOWANCES_EXPENSE.name,
      accountType: coa.ALLOWANCES_EXPENSE.type,
      debitAmount: Math.round(totalAllowances * 100) / 100,
      creditAmount: 0,
      description: `Staff allowances for payroll run ${input.payrollRunNumber}`,
    });
  }

  // 3. DEBIT: Reimbursed Expenses (Travel, Meals, Supplies)
  if (totalReimbursements > 0) {
    lines.push({
      accountCode: coa.REIMBURSED_EXPENSES.code,
      accountName: coa.REIMBURSED_EXPENSES.name,
      accountType: coa.REIMBURSED_EXPENSES.type,
      debitAmount: Math.round(totalReimbursements * 100) / 100,
      creditAmount: 0,
      description: `Approved staff expense reimbursements for payroll run ${input.payrollRunNumber}`,
    });
  }

  // 4. DEBIT: Employer NSSF Expense
  if (totalNssfEr > 0) {
    lines.push({
      accountCode: coa.NSSF_EMPLOYER_EXPENSE.code,
      accountName: coa.NSSF_EMPLOYER_EXPENSE.name,
      accountType: coa.NSSF_EMPLOYER_EXPENSE.type,
      debitAmount: Math.round(totalNssfEr * 100) / 100,
      creditAmount: 0,
      description: `Employer NSSF statutory cost for ${input.payrollRunNumber}`,
    });
  }

  // 5. DEBIT: Employer Housing Levy Expense
  if (totalHousingEr > 0) {
    lines.push({
      accountCode: coa.HOUSING_LEVY_EMPLOYER_EXPENSE.code,
      accountName: coa.HOUSING_LEVY_EMPLOYER_EXPENSE.name,
      accountType: coa.HOUSING_LEVY_EMPLOYER_EXPENSE.type,
      debitAmount: Math.round(totalHousingEr * 100) / 100,
      creditAmount: 0,
      description: `Employer Housing Levy statutory cost for ${input.payrollRunNumber}`,
    });
  }

  // 6. DEBIT: Employer Benefits Expense (HMO, Insurance)
  if (totalEmployerBenefits > 0) {
    lines.push({
      accountCode: coa.EMPLOYER_BENEFITS_EXPENSE.code,
      accountName: coa.EMPLOYER_BENEFITS_EXPENSE.name,
      accountType: coa.EMPLOYER_BENEFITS_EXPENSE.type,
      debitAmount: Math.round(totalEmployerBenefits * 100) / 100,
      creditAmount: 0,
      description: `Employer contributions to health and group benefits for ${input.payrollRunNumber}`,
    });
  }

  // 7. CREDIT: Net Salaries Payable
  if (totalNetPay > 0) {
    lines.push({
      accountCode: coa.NET_SALARIES_PAYABLE.code,
      accountName: coa.NET_SALARIES_PAYABLE.name,
      accountType: coa.NET_SALARIES_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalNetPay * 100) / 100,
      description: `Net salary payable to workforce for ${input.payrollRunNumber}`,
    });
  }

  // 8. CREDIT: PAYE Tax Payable
  if (totalPaye > 0) {
    lines.push({
      accountCode: coa.PAYE_TAX_PAYABLE.code,
      accountName: coa.PAYE_TAX_PAYABLE.name,
      accountType: coa.PAYE_TAX_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalPaye * 100) / 100,
      description: `PAYE withholding tax payable for ${input.payrollRunNumber}`,
    });
  }

  // 9. CREDIT: NSSF Total Payable (Employee + Employer)
  if (totalNssfTotal > 0) {
    lines.push({
      accountCode: coa.NSSF_PAYABLE.code,
      accountName: coa.NSSF_PAYABLE.name,
      accountType: coa.NSSF_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalNssfTotal * 100) / 100,
      description: `Total NSSF statutory liability (EE + ER) for ${input.payrollRunNumber}`,
    });
  }

  // 10. CREDIT: SHIF Payable
  if (totalShif > 0) {
    lines.push({
      accountCode: coa.SHIF_PAYABLE.code,
      accountName: coa.SHIF_PAYABLE.name,
      accountType: coa.SHIF_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalShif * 100) / 100,
      description: `SHIF health insurance liability for ${input.payrollRunNumber}`,
    });
  }

  // 11. CREDIT: Housing Levy Total Payable (Employee + Employer)
  if (totalHousingTotal > 0) {
    lines.push({
      accountCode: coa.HOUSING_LEVY_PAYABLE.code,
      accountName: coa.HOUSING_LEVY_PAYABLE.name,
      accountType: coa.HOUSING_LEVY_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalHousingTotal * 100) / 100,
      description: `Affordable Housing Levy liability (EE + ER) for ${input.payrollRunNumber}`,
    });
  }

  // 12. CREDIT: Employer Benefits Payable
  if (totalEmployerBenefits > 0) {
    lines.push({
      accountCode: coa.EMPLOYER_BENEFITS_PAYABLE.code,
      accountName: coa.EMPLOYER_BENEFITS_PAYABLE.name,
      accountType: coa.EMPLOYER_BENEFITS_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalEmployerBenefits * 100) / 100,
      description: `Employer benefit liabilities payable to providers for ${input.payrollRunNumber}`,
    });
  }

  // 13. CREDIT: Staff Loans Asset (Recovery reduces asset balance)
  if (totalLoanRepayments > 0) {
    lines.push({
      accountCode: coa.STAFF_LOANS_RECEIVABLE.code,
      accountName: coa.STAFF_LOANS_RECEIVABLE.name,
      accountType: coa.STAFF_LOANS_RECEIVABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalLoanRepayments * 100) / 100,
      description: `Company loan principal & interest recoveries for ${input.payrollRunNumber}`,
    });
  }

  // 14. CREDIT: Third-Party Remittances Payable (SACCOs, Insurance policies, HELB)
  if (totalThirdPartyRemittances > 0) {
    lines.push({
      accountCode: coa.THIRD_PARTY_REMITTANCES_PAYABLE.code,
      accountName: coa.THIRD_PARTY_REMITTANCES_PAYABLE.name,
      accountType: coa.THIRD_PARTY_REMITTANCES_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalThirdPartyRemittances * 100) / 100,
      description: `Third-party check-off deductions payable (SACCO, Insurance, Britam) for ${input.payrollRunNumber}`,
    });
  }

  // 15. CREDIT: Other Deductions Payable
  if (totalOtherDeductions > 0) {
    lines.push({
      accountCode: coa.OTHER_DEDUCTIONS_PAYABLE.code,
      accountName: coa.OTHER_DEDUCTIONS_PAYABLE.name,
      accountType: coa.OTHER_DEDUCTIONS_PAYABLE.type,
      debitAmount: 0,
      creditAmount: Math.round(totalOtherDeductions * 100) / 100,
      description: `Other employee voluntary deductions and recoveries for ${input.payrollRunNumber}`,
    });
  }

  // Double-Entry Invariant Validation: Sum(Debits) === Sum(Credits)
  const totalDebit = Math.round(lines.reduce((acc, l) => acc + l.debitAmount, 0) * 100) / 100;
  const totalCredit = Math.round(lines.reduce((acc, l) => acc + l.creditAmount, 0) * 100) / 100;
  const discrepancy = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100;
  const isBalanced = discrepancy < 0.01;

  return {
    voucherNumber: input.voucherNumber || `JV-${input.payrollRunNumber}`,
    entryDate: new Date().toISOString().split("T")[0],
    postingDate: input.postingDate,
    organizationId: input.organizationId,
    organizationName: input.organizationName,
    currency: input.currency,
    totalDebit,
    totalCredit,
    isBalanced,
    discrepancy,
    lines,
  };
}

/**
 * Format voucher for direct SAP integration (BAPI / RFC format)
 */
export function formatSapJournalPayload(voucher: DoubleEntryVoucher, sapCompanyCode: string = "1000") {
  return {
    HEADER: {
      DOC_TYPE: "SA",
      COMP_CODE: sapCompanyCode,
      DOC_DATE: voucher.postingDate.replace(/-/g, ""),
      PSTNG_DATE: voucher.postingDate.replace(/-/g, ""),
      REF_DOC_NO: voucher.voucherNumber,
      HEADER_TXT: `Payroll JV ${voucher.organizationName}`,
    },
    ITEMS: voucher.lines.map((line, index) => ({
      ITEMNO_ACC: index + 1,
      GL_ACCOUNT: line.accountCode,
      ITEM_TEXT: line.description,
      DEBIT_CREDIT: line.debitAmount > 0 ? "S" : "H", // 'S' = Debit (Soll), 'H' = Credit (Haben) in SAP
      AMOUNT: line.debitAmount > 0 ? line.debitAmount : line.creditAmount,
      CURRENCY: voucher.currency,
      COSTCENTER: line.costCenterCode || "",
    })),
  };
}

/**
 * Format voucher for direct ERPNext integration (Journal Entry DocType)
 */
export function formatErpNextJournalPayload(voucher: DoubleEntryVoucher, erpNextCompany: string) {
  return {
    doctype: "Journal Entry",
    voucher_type: "Journal Entry",
    company: erpNextCompany,
    posting_date: voucher.postingDate,
    user_remark: `HRMS Payroll ${voucher.voucherNumber} for ${voucher.organizationName}`,
    accounts: voucher.lines.map((line) => ({
      account: `${line.accountName} - ${erpNextCompany}`,
      debit_in_account_currency: line.debitAmount,
      credit_in_account_currency: line.creditAmount,
      cost_center: line.costCenterCode || `Main - ${erpNextCompany}`,
      user_remark: line.description,
    })),
  };
}
