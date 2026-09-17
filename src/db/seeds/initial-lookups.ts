/**
 * Pre-Seeded Global Enterprise Reference Lookups
 * 
 * Global system defaults (tenantId = null, isSystem = true) available
 * out-of-the-box to all tenants without requiring database migrations.
 */

export interface SeedLookupItem {
  category: string;
  code: string;
  label: string;
  description?: string;
  displayOrder: number;
  metadata?: Record<string, any>;
}

export const INITIAL_REFERENCE_LOOKUPS: SeedLookupItem[] = [
  // 1. Benefit Categories
  { category: "benefit_category", code: "health_insurance", label: "Health & Medical Insurance (Inpatient/Outpatient)", displayOrder: 1 },
  { category: "benefit_category", code: "dental_and_vision", label: "Dental & Vision Care", displayOrder: 2 },
  { category: "benefit_category", code: "pension_retirement", label: "Pension & Retirement 401(k) / Provident Fund", displayOrder: 3 },
  { category: "benefit_category", code: "life_insurance", label: "Group Life & Disability Insurance", displayOrder: 4 },
  { category: "benefit_category", code: "wellness_stipend", label: "Wellness & Mental Health Allowance", displayOrder: 5 },
  { category: "benefit_category", code: "remote_work_stipend", label: "Remote Office & Home Setup Allowance", displayOrder: 6 },
  { category: "benefit_category", code: "learning_stipend", label: "Learning, Conferences & Education Fund", displayOrder: 7 },
  { category: "benefit_category", code: "commuter_meals", label: "Commuter & Daily Meal Allowance", displayOrder: 8 },
  { category: "benefit_category", code: "earned_wage_access", label: "Earned Wage Access (On-Demand Pay)", displayOrder: 9 },
  { category: "benefit_category", code: "chama_sacco_welfare", label: "Staff SACCO & Welfare Association Fund", displayOrder: 10 },
  { category: "benefit_category", code: "fertility_family", label: "Fertility, Paternity & Family Planning Support", displayOrder: 11 },

  // 2. Insurance Coverage Tiers
  { category: "coverage_tier", code: "employee_only", label: "Employee Only (Individual)", displayOrder: 1 },
  { category: "coverage_tier", code: "employee_plus_spouse", label: "Employee + Spouse / Partner", displayOrder: 2 },
  { category: "coverage_tier", code: "employee_plus_children", label: "Employee + Children", displayOrder: 3 },
  { category: "coverage_tier", code: "full_family", label: "Full Family (Spouse + Children)", displayOrder: 4 },
  { category: "coverage_tier", code: "employee_plus_parents", label: "Employee + Parents / Extended Family", displayOrder: 5 },
  { category: "coverage_tier", code: "executive_tier", label: "Executive VIP Worldwide Coverage", displayOrder: 6 },

  // 3. Hardware Device Categories (Workforce IT Fleet)
  { category: "device_category", code: "laptop", label: "Laptop / Notebook", displayOrder: 1 },
  { category: "device_category", code: "desktop", label: "Desktop Workstation", displayOrder: 2 },
  { category: "device_category", code: "monitor", label: "External Display / Monitor", displayOrder: 3 },
  { category: "device_category", code: "phone", label: "Mobile Smartphone", displayOrder: 4 },
  { category: "device_category", code: "tablet", label: "Tablet Computer", displayOrder: 5 },
  { category: "device_category", code: "yubikey", label: "Hardware Security Key (YubiKey / FIDO2)", displayOrder: 6 },
  { category: "device_category", code: "accessory", label: "Docking Station, Keyboard & Mouse", displayOrder: 7 },
  { category: "device_category", code: "starlink_terminal", label: "Satellite Internet Terminal (Starlink / Remote Kit)", displayOrder: 8 },
  { category: "device_category", code: "vr_headset", label: "Spatial / VR Headset", displayOrder: 9 },

  // 4. Visa & Immigration Categories (Global Mobility Hub)
  { category: "visa_category", code: "skilled_worker", label: "Skilled Worker / Employment Visa", displayOrder: 1 },
  { category: "visa_category", code: "digital_nomad", label: "Digital Nomad / Remote Worker Visa", displayOrder: 2 },
  { category: "visa_category", code: "intra_company_transfer", label: "Intra-Company Transfer (ICT)", displayOrder: 3 },
  { category: "visa_category", code: "permanent_residence", label: "Permanent Residence / Green Card", displayOrder: 4 },
  { category: "visa_category", code: "founder_startup", label: "Founder / Entrepreneur Startup Visa", displayOrder: 5 },
  { category: "visa_category", code: "business_visitor", label: "Short-Term Business Visitor Visa", displayOrder: 6 },
  { category: "visa_category", code: "golden_visa", label: "Investor / Golden Visa", displayOrder: 7 },

  // 5. Employment Types
  { category: "employment_type", code: "full_time", label: "Full-Time Employee", displayOrder: 1 },
  { category: "employment_type", code: "part_time", label: "Part-Time Employee", displayOrder: 2 },
  { category: "employment_type", code: "contractor", label: "Independent Contractor (1099 / Sole Trader)", displayOrder: 3 },
  { category: "employment_type", code: "b2b_consultant", label: "B2B Corporate Contractor", displayOrder: 4 },
  { category: "employment_type", code: "intern", label: "Intern / Graduate Trainee", displayOrder: 5 },
  { category: "employment_type", code: "eor_employee", label: "Employer of Record (EOR) International Hire", displayOrder: 6 },
  { category: "employment_type", code: "shift_worker", label: "Shift / Hourly Worker", displayOrder: 7 },

  // 6. Identification & Compliance Document Types
  { category: "document_type", code: "national_id", label: "National Identification Card", displayOrder: 1 },
  { category: "document_type", code: "passport", label: "International Passport", displayOrder: 2 },
  { category: "document_type", code: "tax_pin", label: "Tax Identification Number (KRA PIN / TIN / SSN)", displayOrder: 3 },
  { category: "document_type", code: "social_security", label: "Social Security / Pension ID (NSSF / Social Security)", displayOrder: 4 },
  { category: "document_type", code: "health_card", label: "Health Insurance Card (SHIF / Private HMO)", displayOrder: 5 },
  { category: "document_type", code: "work_permit", label: "Alien Card / Work Permit", displayOrder: 6 },
  { category: "document_type", code: "police_clearance", label: "Certificate of Good Conduct / Police Clearance", displayOrder: 7 },
  { category: "document_type", code: "degree_certificate", label: "Apostilled Degree / Academic Credentials", displayOrder: 8 },

  // 7. Training & Learning Categories
  { category: "course_category", code: "onboarding_orientation", label: "New Hire Orientation & Code of Conduct", displayOrder: 1 },
  { category: "course_category", code: "compliance_mandatory", label: "Mandatory Regulatory Compliance & Ethics", displayOrder: 2 },
  { category: "course_category", code: "cybersecurity_it", label: "Workplace Cybersecurity & Phishing Defense", displayOrder: 3 },
  { category: "course_category", code: "customer_service", label: "Service Excellence & Client Relations (Up Your Service)", displayOrder: 4 },
  { category: "course_category", code: "product_enablement", label: "Product Management & Go-To-Market Enablement", displayOrder: 5 },
  { category: "course_category", code: "workplace_safety_osha", label: "Occupational Safety, Health & First Aid", displayOrder: 6 },
  { category: "course_category", code: "leadership_management", label: "Executive Leadership & People Management", displayOrder: 7 },

  // 8. Survey & Feedback Campaign Types
  { category: "survey_type", code: "enps_pulse", label: "Employee Net Promoter Score (eNPS) Pulse", displayOrder: 1 },
  { category: "survey_type", code: "onboarding_feedback", label: "30/60/90 Day New Hire Onboarding Experience", displayOrder: 2 },
  { category: "survey_type", code: "engagement_climate", label: "Annual Workplace Engagement & Culture Climate", displayOrder: 3 },
  { category: "survey_type", code: "manager_360", label: "Manager 360 Leadership Effectiveness Feedback", displayOrder: 4 },
  { category: "survey_type", code: "benefits_satisfaction", label: "Workforce Benefits & Healthcare Satisfaction", displayOrder: 5 },
  { category: "survey_type", code: "exit_interview", label: "Offboarding & Exit Interview Insights", displayOrder: 6 },

  // 9. Digital Form Categories
  { category: "form_category", code: "financial_banking", label: "Banking, Direct Deposit & Payroll Mandates", displayOrder: 1 },
  { category: "form_category", code: "hr_employment", label: "HR Employment, Next of Kin & Benefits Selection", displayOrder: 2 },
  { category: "form_category", code: "it_security", label: "IT Hardware Custody, Access & Security Declarations", displayOrder: 3 },
  { category: "form_category", code: "compliance_legal", label: "Non-Disclosure (NDA), Conflict of Interest & IP Assignment", displayOrder: 4 },
  { category: "form_category", code: "health_safety", label: "Medical Fitness, Remote Work Ergonomics & Safety", displayOrder: 5 },

  // 10. Travel Trip Types
  { category: "trip_type", code: "domestic_local", label: "Domestic / Local Travel", displayOrder: 1 },
  { category: "trip_type", code: "regional_cross_border", label: "Regional Cross-Border (e.g. East Africa EAC)", displayOrder: 2 },
  { category: "trip_type", code: "international", label: "Global / International Long-Haul Travel", displayOrder: 3 },

  // 11. Universal Fiscal Compliance Regimes
  { category: "fiscal_regime", code: "etims_ke", label: "Kenya ETIMS (Electronic Tax Invoice Management System)", displayOrder: 1 },
  { category: "fiscal_regime", code: "vfd_tz", label: "Tanzania TRA Virtual / Electronic Fiscal Device (VFD/EFD)", displayOrder: 2 },
  { category: "fiscal_regime", code: "ebm_rw", label: "Rwanda RRA Electronic Billing Machine (EBM v2)", displayOrder: 3 },
  { category: "fiscal_regime", code: "efris_ug", label: "Uganda URA Electronic Fiscal Receipting & Invoicing (EFRIS)", displayOrder: 4 },
  { category: "fiscal_regime", code: "zatca_sa", label: "Saudi Arabia ZATCA Fatoora Phase 2 e-Invoice", displayOrder: 5 },
  { category: "fiscal_regime", code: "peppol_eu", label: "European Peppol / XRechnung E-Invoicing", displayOrder: 6 },
  { category: "fiscal_regime", code: "scale_rate_per_diem", label: "Statutory Scale Rate Per Diem (No Receipt Required - US IRS / UK HMRC)", displayOrder: 7 },
  { category: "fiscal_regime", code: "standard_receipt", label: "Standard Commercial Invoice / Receipt", displayOrder: 8 },

  // 12. Shift Pattern Categories
  { category: "shift_pattern_category", code: "continuous_24_7", label: "Continuous 24/7 Multi-Shift Rotation (Continental / 3-Shift)", displayOrder: 1 },
  { category: "shift_pattern_category", code: "mining_fifo", label: "Heavy Industrial / Mining FIFO (Fly-In / Fly-Out)", displayOrder: 2 },
  { category: "shift_pattern_category", code: "manufacturing_twelve_hour", label: "12-Hour DuPont / 4-on-4-off Manufacturing Cycle", displayOrder: 3 },
  { category: "shift_pattern_category", code: "flexible_office", label: "Standard Office Shift (Daytime with Flexible Lunch)", displayOrder: 4 },

  // 13. ERP & External Financial Systems
  { category: "erp_system", code: "sap_s4hana_bapi", label: "SAP S/4HANA & ECC (BAPI / RFC Journal Posting)", displayOrder: 1 },
  { category: "erp_system", code: "oracle_netsuite_rest", label: "Oracle NetSuite OneWorld (REST Web Services)", displayOrder: 2 },
  { category: "erp_system", code: "microsoft_dynamics_365", label: "Microsoft Dynamics 365 Business Central / Finance", displayOrder: 3 },
  { category: "erp_system", code: "erpnext_rest", label: "ERPNext Accounting (REST API v2)", displayOrder: 4 },
  { category: "erp_system", code: "quickbooks_online", label: "Intuit QuickBooks Online Accounting", displayOrder: 5 },
  { category: "erp_system", code: "xero", label: "Xero Cloud Accounting", displayOrder: 6 },
];

