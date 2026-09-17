/**
 * Database Seed Execution Script
 * 
 * Populates the database with global system reference lookups, standard statutory agencies,
 * third-party check-off institutions, expense categories, loan types, and device catalog items.
 */

import { sql } from "drizzle-orm";
import { db } from "../index";
import {
  tenants,
  organizations,
  referenceLookups,
  statutoryAgencies,
  thirdPartyInstitutions,
  expenseCategories,
  loanTypes,
  deviceCatalog,
  trainingCourses,
  surveyCampaigns,
  formTemplates,
  currencies,
  currencyExchangeRates,
  geoAdministrativeUnits,
  perDiemPolicies,
  travelRequests,
  shiftRotationPatterns,
  rotationPatternSteps,
  companyLeaveShutdowns,
  erpConnectors,
  users,
  roles,
  userRoles,
} from "../schema";
import { INITIAL_REFERENCE_LOOKUPS } from "./initial-lookups";
import crypto from "crypto";

// Secure PBKDF2 Password Hasher
function hashPassword(password: string): string {
  const salt = "delahr_secure_salt_2026";
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export async function runDatabaseSeed() {
  console.log("🌱 Starting DelaHR Global Enterprise Database Seeder...");

  try {
    // 1. Verify DB Connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection established.");

    // 2. Create Platform Owner Tenant: Dela HR
    const tenantId = "00000000-0000-0000-0000-000000000001";
    await db
      .insert(tenants)
      .values({
        id: tenantId,
        name: "Dela HR",
        slug: "delahr",
        domain: "delahr.com",
        status: "active",
        tier: "enterprise",
      })
      .onConflictDoUpdate({
        target: tenants.id,
        set: { name: "Dela HR", slug: "delahr", status: "active" },
      });
    console.log("✅ Platform Owner Tenant: Dela HR configured.");

    // 3. Create Platform Headquarters Organization: Dela HR Ltd
    const orgId = "00000000-0000-0000-0000-000000000010";
    await db
      .insert(organizations)
      .values({
        id: orgId,
        tenantId,
        name: "Dela HR Ltd",
        code: "DELA-HQ-001",
        countryCode: "KEN",
        currency: "KES",
        taxId: "P051234567Z",
        registrationNumber: "CPR/2026/DELAHR",
        fiscalYearStartMonth: 1,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: organizations.id,
        set: { name: "Dela HR Ltd", taxId: "P051234567Z", isActive: true },
      });
    console.log("✅ Platform Headquarters: Dela HR Ltd (info@delahr.com, Tax PIN: P051234567Z) configured.");

    // 3b. Seed Platform Super Administrator
    const superAdminUserId = "00000000-0000-0000-0000-000000000099";
    const superAdminRole = "00000000-0000-0000-0000-000000000098";
    
    await db
      .insert(roles)
      .values({
        id: superAdminRole,
        tenantId,
        name: "Platform Super Administrator",
        slug: "super_admin",
        description: "Full global enterprise SaaS ownership and cross-tenant authority",
        isSystem: true,
        permissions: ["*"],
      })
      .onConflictDoNothing();

    await db
      .insert(users)
      .values({
        id: superAdminUserId,
        tenantId,
        email: "admin@delahr.com",
        firstName: "Super",
        lastName: "Administrator",
        phone: "+254700000000",
        isTenantOwner: true,
        isActive: true,
        status: "active",
        passwordHash: hashPassword("DelaHR2026?"),
      })
      .onConflictDoUpdate({
        target: [users.tenantId, users.email],
        set: {
          firstName: "Super",
          lastName: "Administrator",
          isActive: true,
          status: "active",
          passwordHash: hashPassword("DelaHR2026?"),
        },
      });

    await db
      .insert(userRoles)
      .values({
        id: "00000000-0000-0000-0000-000000000097",
        tenantId,
        userId: superAdminUserId,
        roleId: superAdminRole,
        organizationId: orgId,
      })
      .onConflictDoNothing();

    console.log("✅ Platform Owner User: Super Administrator (admin@delahr.com, Password: DelaHR2026?, Role: super_admin) seeded.");

    // 4. Seed Global Reference Lookups
    console.log(`📦 Seeding ${INITIAL_REFERENCE_LOOKUPS.length} reference lookup taxonomies...`);
    for (const lookup of INITIAL_REFERENCE_LOOKUPS) {
      await db
        .insert(referenceLookups)
        .values({
          tenantId: null, // Global default available to all tenants
          category: lookup.category,
          code: lookup.code,
          label: lookup.label,
          description: lookup.description,
          displayOrder: lookup.displayOrder,
          isSystem: true,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Reference lookups successfully seeded.");

    // 5. Seed Kenya Statutory Agencies (Country registry)
    const agencies = [
      {
        countryCode: "KEN",
        agencyName: "Kenya Revenue Authority (KRA iTax)",
        agencyCode: "KRA_PAYE",
        submissionFormat: "itax_csv",
        portalUrl: "https://itax.kra.go.ke",
        filingDueDayOfMonth: 9,
      },
      {
        countryCode: "KEN",
        agencyName: "Social Health Authority (SHA / SHIF)",
        agencyCode: "SHIF",
        submissionFormat: "sha_csv",
        portalUrl: "https://sha.go.ke",
        filingDueDayOfMonth: 9,
      },
      {
        countryCode: "KEN",
        agencyName: "National Social Security Fund (NSSF e-Service)",
        agencyCode: "NSSF",
        submissionFormat: "nssf_csv",
        portalUrl: "https://eservice.nssfkenya.co.ke",
        filingDueDayOfMonth: 9,
      },
      {
        countryCode: "KEN",
        agencyName: "Affordable Housing Levy Authority",
        agencyCode: "HOUSING_LEVY",
        submissionFormat: "housing_levy_csv",
        filingDueDayOfMonth: 9,
      },
    ];

    for (const agency of agencies) {
      await db
        .insert(statutoryAgencies)
        .values({
          ...agency,
          filingFrequency: "monthly",
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Statutory agencies (KRA, SHIF, NSSF, Housing Levy) configured.");

    // 6. Seed Third-Party Check-off Remittance Institutions
    const institutions = [
      {
        code: "BRITAM",
        name: "Britam Life Assurance Limited",
        institutionType: "insurance_provider",
        bankName: "KCB Bank Kenya",
        bankBranch: "Upper Hill",
        bankAccountNumber: "1109283741",
        currency: "KES",
      },
      {
        code: "HARAMBEE",
        name: "Harambee SACCO Society Limited",
        institutionType: "sacco",
        bankName: "Cooperative Bank of Kenya",
        bankBranch: "Parliament Road",
        bankAccountNumber: "0112938475",
        currency: "KES",
      },
      {
        code: "HELB",
        name: "Higher Education Loans Board (HELB)",
        institutionType: "student_loan_board",
        bankName: "National Bank of Kenya",
        bankBranch: "Harambee Avenue",
        bankAccountNumber: "0100123984",
        currency: "KES",
      },
    ];

    for (const inst of institutions) {
      await db
        .insert(thirdPartyInstitutions)
        .values({
          tenantId,
          organizationId: orgId,
          ...inst,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Third-Party Check-off Institutions (Britam, Harambee SACCO, HELB) seeded.");

    // 7. Seed Standard Expense Categories
    const expCategories = [
      { code: "TRAVEL", name: "Travel, Flights & Lodging", isReceiptRequired: true, maxLimitAmount: "250000", currency: "KES" },
      { code: "MEALS", name: "Client Entertainment & Team Meals", isReceiptRequired: true, maxLimitAmount: "50000", currency: "KES" },
      { code: "OFFICE_SUPPLIES", name: "Office Stationery & Small Tools", isReceiptRequired: true, maxLimitAmount: "30000", currency: "KES" },
      { code: "TELECOM", name: "Mobile Airtime & Home Internet", isReceiptRequired: false, maxLimitAmount: "15000", currency: "KES" },
    ];

    for (const exp of expCategories) {
      await db
        .insert(expenseCategories)
        .values({
          tenantId,
          organizationId: orgId,
          ...exp,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Expense Categories configured.");

    // 8. Seed Loan Types
    const loanT = [
      {
        code: "EMERGENCY",
        name: "Emergency Staff Loan",
        interestType: "zero_interest" as const,
        annualInterestRate: "0.00",
        maxTenureMonths: 6,
        maxPrincipalAmount: "100000",
        currency: "KES",
      },
      {
        code: "CAR_LOAN",
        name: "Company Vehicle & Asset Loan",
        interestType: "flat_rate" as const,
        annualInterestRate: "6.00",
        maxTenureMonths: 36,
        maxPrincipalAmount: "2000000",
        currency: "KES",
      },
      {
        code: "SALARY_ADVANCE",
        name: "Mid-Month Salary Advance",
        interestType: "zero_interest" as const,
        annualInterestRate: "0.00",
        maxTenureMonths: 1,
        maxPrincipalAmount: "50000",
        currency: "KES",
      },
    ];

    for (const lt of loanT) {
      await db
        .insert(loanTypes)
        .values({
          tenantId,
          organizationId: orgId,
          ...lt,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Loan Types configured.");

    // 9. Seed Workforce IT Hardware Device Catalog
    const devices = [
      {
        brand: "Apple",
        modelName: "MacBook Pro 16 M3 Max (36GB RAM, 1TB SSD)",
        category: "laptop",
        specifications: { chip: "Apple M3 Max", ram: "36GB unified", ssd: "1TB", display: "16.2 Liquid Retina XDR" },
        purchasePrice: "420000",
        currency: "KES",
      },
      {
        brand: "Dell",
        modelName: "XPS 15 9530 (32GB RAM, 1TB SSD)",
        category: "laptop",
        specifications: { cpu: "Intel Core i7-13700H", ram: "32GB DDR5", ssd: "1TB NVMe", display: "15.6 OLED 3.5K" },
        purchasePrice: "280000",
        currency: "KES",
      },
      {
        brand: "Dell",
        modelName: "UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
        category: "monitor",
        specifications: { size: "27 inch", resolution: "3840x2160 4K", hub: "90W USB-C PD, RJ45 Ethernet" },
        purchasePrice: "85000",
        currency: "KES",
      },
      {
        brand: "Yubico",
        modelName: "YubiKey 5C NFC FIDO2 Security Key",
        category: "yubikey",
        specifications: { interface: "USB-C & NFC", standards: "FIDO2, WebAuthn, U2F, Smart Card" },
        purchasePrice: "9500",
        currency: "KES",
      },
    ];

    for (const dev of devices) {
      await db
        .insert(deviceCatalog)
        .values({
          tenantId,
          ...dev,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Workforce IT Hardware Device Catalog seeded.");

    // 10. Seed Training & Mandatory Retraining Courses
    const courses = [
      {
        title: "Workplace Cybersecurity & Phishing Defense",
        code: "SEC-101",
        category: "cybersecurity_it",
        isMandatory: true,
        validityPeriodMonths: 12, // Annual retraining required
        passingScorePercentage: 85,
        estimatedDurationMinutes: 45,
      },
      {
        title: "Up Your Service: Client Excellence Standard",
        code: "SVC-201",
        category: "customer_service",
        isMandatory: true,
        validityPeriodMonths: 12,
        passingScorePercentage: 80,
        estimatedDurationMinutes: 60,
      },
      {
        title: "Global Anti-Money Laundering (AML) & Sanctions",
        code: "COMP-301",
        category: "compliance_mandatory",
        isMandatory: true,
        validityPeriodMonths: 12,
        passingScorePercentage: 90,
        estimatedDurationMinutes: 50,
      },
      {
        title: "Q3 Product Architecture & GTM Playbook",
        code: "PROD-401",
        category: "product_enablement",
        isMandatory: false,
        passingScorePercentage: 75,
        estimatedDurationMinutes: 90,
      },
    ];

    for (const c of courses) {
      await db
        .insert(trainingCourses)
        .values({
          tenantId,
          organizationId: orgId,
          ...c,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Training & Retraining compliance courses seeded.");

    // 11. Seed Survey & eNPS Campaigns
    const surveys = [
      {
        title: "Q3 2026 Workforce Engagement & eNPS Pulse",
        description: "Quarterly anonymous workforce sentiment and culture feedback",
        surveyType: "enps_pulse" as const,
        isAnonymous: true,
        targetScope: "all_company",
        startDate: "2026-09-01",
        endDate: "2026-10-15",
        status: "active" as const,
        totalTargetCount: 50,
        responseCount: 38,
        enpsScore: 68,
        averageRating: "4.75",
      },
      {
        title: "30-Day New Hire Onboarding Experience Survey",
        description: "Confidential feedback on hiring, equipment arrival, and team orientation",
        surveyType: "onboarding_feedback" as const,
        isAnonymous: true,
        targetScope: "all_company",
        startDate: "2026-09-01",
        endDate: "2026-12-31",
        status: "active" as const,
        totalTargetCount: 15,
        responseCount: 12,
        enpsScore: 75,
        averageRating: "4.85",
      },
    ];

    for (const s of surveys) {
      await db
        .insert(surveyCampaigns)
        .values({
          tenantId,
          organizationId: orgId,
          ...s,
        })
        .onConflictDoNothing();
    }
    console.log("✅ HR Survey & eNPS campaigns seeded.");

    // 12. Seed Digital Form Templates
    const forms = [
      {
        title: "Direct Deposit & Bank Mandate Change Form",
        code: "FORM-FIN-001",
        category: "financial_banking",
        description: "Digital authorization to update salary direct deposit bank account details",
        fieldsSchema: [
          { id: "bank_name", type: "text", label: "Bank Name", required: true },
          { id: "bank_branch", type: "text", label: "Bank Branch", required: true },
          { id: "account_number", type: "text", label: "Account Number", required: true },
          { id: "account_name", type: "text", label: "Account Name", required: true },
        ],
        requiresSignature: true,
        requiresCountersign: false,
      },
      {
        title: "Remote Work & Hardware Custody Acknowledgment",
        code: "FORM-IT-002",
        category: "it_security",
        description: "Acknowledgment of company laptop serial numbers and remote work policy",
        fieldsSchema: [
          { id: "device_serial", type: "text", label: "Assigned Laptop Serial Number", required: true },
          { id: "home_address", type: "text", label: "Remote Work Base Address", required: true },
          { id: "internet_speed", type: "text", label: "Internet Bandwidth (Mbps)", required: true },
        ],
        requiresSignature: true,
        requiresCountersign: true,
      },
      {
        title: "Emergency Contact & Next of Kin Declaration",
        code: "FORM-HR-003",
        category: "hr_employment",
        description: "Designation of emergency contacts and primary next of kin",
        fieldsSchema: [
          { id: "contact_name", type: "text", label: "Emergency Contact Full Name", required: true },
          { id: "relationship", type: "text", label: "Relationship", required: true },
          { id: "phone_number", type: "text", label: "Mobile Phone Number", required: true },
        ],
        requiresSignature: true,
        requiresCountersign: false,
      },
    ];

    for (const f of forms) {
      await db
        .insert(formTemplates)
        .values({
          tenantId,
          organizationId: orgId,
          ...f,
          isActive: true,
        })
        .onConflictDoNothing();
    }
    console.log("✅ Digital Form templates seeded.");

    // 13. Seed ISO-4217 Currencies & FX Rates
    const currencyList = [
      { code: "USD", numericCode: "840", name: "United States Dollar", symbol: "$", decimalPlaces: 2, isMajorTradingCurrency: true },
      { code: "EUR", numericCode: "978", name: "Euro", symbol: "€", decimalPlaces: 2, isMajorTradingCurrency: true },
      { code: "GBP", numericCode: "826", name: "British Pound Sterling", symbol: "£", decimalPlaces: 2, isMajorTradingCurrency: true },
      { code: "KES", numericCode: "404", name: "Kenyan Shilling", symbol: "KSh", decimalPlaces: 2, isMajorTradingCurrency: false },
      { code: "UGX", numericCode: "800", name: "Ugandan Shilling", symbol: "USh", decimalPlaces: 0, isMajorTradingCurrency: false },
      { code: "TZS", numericCode: "834", name: "Tanzanian Shilling", symbol: "TSh", decimalPlaces: 0, isMajorTradingCurrency: false },
      { code: "RWF", numericCode: "646", name: "Rwandan Franc", symbol: "FRw", decimalPlaces: 0, isMajorTradingCurrency: false },
    ];

    for (const c of currencyList) {
      await db.insert(currencies).values(c).onConflictDoNothing();
    }

    const fxRates = [
      { baseCurrency: "USD", targetCurrency: "KES", rate: "129.500000", inverseRate: "0.007722", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "Central Bank of Kenya" },
      { baseCurrency: "USD", targetCurrency: "UGX", rate: "3720.000000", inverseRate: "0.000268", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "Bank of Uganda" },
      { baseCurrency: "USD", targetCurrency: "TZS", rate: "2650.000000", inverseRate: "0.000377", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "Bank of Tanzania" },
      { baseCurrency: "USD", targetCurrency: "RWF", rate: "1350.000000", inverseRate: "0.000740", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "National Bank of Rwanda" },
      { baseCurrency: "USD", targetCurrency: "EUR", rate: "0.920000", inverseRate: "1.086956", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "European Central Bank" },
      { baseCurrency: "USD", targetCurrency: "GBP", rate: "0.780000", inverseRate: "1.282051", rateType: "corporate_monthly", effectiveDate: "2026-09-01", source: "Bank of England" },
    ];

    for (const fx of fxRates) {
      await db.insert(currencyExchangeRates).values({ tenantId, ...fx }).onConflictDoNothing();
    }
    console.log("✅ Currencies & FX exchange rates seeded.");

    // 14. Seed Dynamic Geographic Administrative Units
    const geoUnits = [
      { countryCode: "KEN", level: 1, divisionType: "county", name: "Nairobi County", code: "KE-47", defaultCurrency: "KES", defaultTimezone: "Africa/Nairobi", minimumWageMonthlyRate: "18500.00" },
      { countryCode: "KEN", level: 1, divisionType: "county", name: "Mombasa County", code: "KE-01", defaultCurrency: "KES", defaultTimezone: "Africa/Nairobi", minimumWageMonthlyRate: "16800.00" },
      { countryCode: "KEN", level: 1, divisionType: "county", name: "Kisumu County", code: "KE-42", defaultCurrency: "KES", defaultTimezone: "Africa/Nairobi", minimumWageMonthlyRate: "15500.00" },
      { countryCode: "UGA", level: 1, divisionType: "district", name: "Kampala District", code: "UG-102", defaultCurrency: "UGX", defaultTimezone: "Africa/Kampala", minimumWageMonthlyRate: "450000.00" },
      { countryCode: "UGA", level: 1, divisionType: "district", name: "Wakiso District", code: "UG-113", defaultCurrency: "UGX", defaultTimezone: "Africa/Kampala", minimumWageMonthlyRate: "400000.00" },
      { countryCode: "TZA", level: 1, divisionType: "region", name: "Dar es Salaam Region", code: "TZ-02", defaultCurrency: "TZS", defaultTimezone: "Africa/Dar_es_Salaam", minimumWageMonthlyRate: "350000.00" },
      { countryCode: "TZA", level: 1, divisionType: "region", name: "Arusha Region", code: "TZ-01", defaultCurrency: "TZS", defaultTimezone: "Africa/Dar_es_Salaam", minimumWageMonthlyRate: "320000.00" },
      { countryCode: "RWA", level: 1, divisionType: "province", name: "Kigali City", code: "RW-01", defaultCurrency: "RWF", defaultTimezone: "Africa/Kigali", minimumWageMonthlyRate: "150000.00" },
    ];

    for (const g of geoUnits) {
      await db.insert(geoAdministrativeUnits).values({ tenantId, organizationId: orgId, ...g }).onConflictDoNothing();
    }
    console.log("✅ Dynamic Geographic Administrative Units seeded (Kenya, Uganda, TZ, Rwanda).");

    // 15. Seed Global Per Diem Policies
    const perDiemRules = [
      { countryCode: "KEN", cityTier: "tier_1_capital", currency: "KES", dailyMealsAllowance: "4500.00", dailyLodgingAllowance: "12000.00", dailyIncidentalsAllowance: "1500.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
      { countryCode: "UGA", cityTier: "tier_1_capital", currency: "UGX", dailyMealsAllowance: "150000.00", dailyLodgingAllowance: "380000.00", dailyIncidentalsAllowance: "40000.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
      { countryCode: "RWA", cityTier: "tier_1_capital", currency: "RWF", dailyMealsAllowance: "50000.00", dailyLodgingAllowance: "120000.00", dailyIncidentalsAllowance: "15000.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
      { countryCode: "TZA", cityTier: "tier_1_capital", currency: "TZS", dailyMealsAllowance: "90000.00", dailyLodgingAllowance: "220000.00", dailyIncidentalsAllowance: "25000.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
      { countryCode: "GBR", cityTier: "tier_1_capital", currency: "GBP", dailyMealsAllowance: "65.00", dailyLodgingAllowance: "180.00", dailyIncidentalsAllowance: "20.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
      { countryCode: "USA", cityTier: "tier_1_capital", currency: "USD", dailyMealsAllowance: "79.00", dailyLodgingAllowance: "220.00", dailyIncidentalsAllowance: "25.00", receiptPolicy: "scale_rate_no_receipt", effectiveFrom: "2026-01-01" },
    ];

    for (const p of perDiemRules) {
      await db.insert(perDiemPolicies).values({ tenantId, organizationId: orgId, ...p }).onConflictDoNothing();
    }
    console.log("✅ Global Per Diem policies seeded (Scale-Rate No-Receipt compliant).");

    // 16. Seed Continuous 24/7 Shift Patterns
    const shiftPatterns = [
      {
        name: "Continental 24/7 Continuous 3-Shift Pattern",
        code: "SHIFT-CONT-247",
        cycleLengthDays: 28,
        patternCategory: "continuous_24_7",
        description: "7 Days Morning -> 2 Rest -> 7 Days Afternoon -> 2 Rest -> 7 Days Night -> 3 Rest",
        maxConsecutiveWorkDays: 7,
        maxConsecutiveNightShifts: 7,
        minRestHoursBetweenShifts: 12,
      },
      {
        name: "Mining FIFO 14/14 Continuous Roster",
        code: "SHIFT-FIFO-1414",
        cycleLengthDays: 28,
        patternCategory: "mining_fifo",
        description: "14 Days Continuous 12h Mining Shift -> 14 Days Rest & Offsite Leave",
        maxConsecutiveWorkDays: 14,
        maxConsecutiveNightShifts: 7,
        minRestHoursBetweenShifts: 12,
      },
    ];

    for (const sp of shiftPatterns) {
      await db.insert(shiftRotationPatterns).values({ tenantId, organizationId: orgId, ...sp }).onConflictDoNothing();
    }
    console.log("✅ 24/7 Continuous Shift & Mining FIFO patterns seeded.");

    // 17. Seed Universal ERP Connectors
    const connectors = [
      {
        name: "Corporate SAP S/4HANA Finance Hub",
        systemType: "sap_s4hana_bapi",
        baseUrl: "https://sap.mandelaglobal.com:8443/sap/bc/srt/rfc/sap/bapi_acc_document_post",
        authType: "oauth2",
        connectionConfig: { client: "100", sysId: "PRD", companyCode: "MAND_GROUP", documentType: "SA" },
        syncDirection: "outbound_to_erp",
        syncFrequency: "on_event",
      },
      {
        name: "Oracle NetSuite OneWorld Cloud Integration",
        systemType: "oracle_netsuite_rest",
        baseUrl: "https://123456.restlets.api.netsuite.com/app/site/hosting/restlet.nl",
        authType: "oauth2",
        connectionConfig: { accountId: "123456", subsidiaryId: "1" },
        syncDirection: "outbound_to_erp",
        syncFrequency: "on_event",
      },
    ];

    for (const conn of connectors) {
      await db.insert(erpConnectors).values({ tenantId, organizationId: orgId, ...conn }).onConflictDoNothing();
    }
    console.log("✅ Universal ERP Connectors (SAP & NetSuite) seeded.");

    console.log("\n🚀 DATABASE SEED COMPLETE! All enterprise configurations ready.");
  } catch (error: any) {
    console.warn("ℹ️  Database seed warning (Note: If DB is not currently running locally, verify .env credentials):", error.message);
  }
}

if (require.main === module) {
  runDatabaseSeed().then(() => process.exit(0));
}
