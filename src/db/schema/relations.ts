import { relations } from "drizzle-orm";
import {
  tenants,
  organizations,
  branches,
  costCenters,
  departments,
  users,
  roles,
  userRoles,
  auditLogs,
} from "./auth-tenancy";
import {
  designations,
  employees,
  employeeProfiles,
  employmentContracts,
  lifecycleEvents,
} from "./core-hr";
import {
  payGroups,
  salaryComponents,
  employeeSalaryStructures,
  employeeSalaryComponents,
  payrollCycles,
  payrollRuns,
  payslips,
  payslipItems,
  payoutBatches,
  payoutTransactions,
} from "./payroll";
import {
  chartOfAccounts,
  payrollAccountMappings,
  journalEntries,
  journalLines,
  erpIntegrations,
  erpSyncLogs,
} from "./accounting";
import {
  shiftTemplates,
  shiftSchedules,
  attendanceLogs,
  timesheets,
  overtimeRequests,
} from "./time-attendance";
import {
  leaveTypes,
  leavePolicies,
  leaveBalances,
  leaveApplications,
} from "./leave";
import {
  jobOpenings,
  pipelineStages,
  candidates,
  candidateApplications,
  interviewSchedules,
  interviewEvaluations,
  jobOffers,
} from "./recruitment";
import {
  appraisalCycles,
  goals,
  goalKeyResults,
  performanceReviews,
} from "./performance";
import {
  documentCategories,
  employeeDocuments,
  companyPolicies,
  policyAcknowledgements,
} from "./documents";
import {
  workflowDefinitions,
  workflowSteps,
  workflowInstances,
  workflowActions,
} from "./workflows";
import {
  webhookEndpoints,
  webhookDeliveries,
} from "./integrations";
import {
  deviceCatalog,
  hardwareDevices,
  deviceAssignments,
  saasApplications,
  saasAccessGrants,
  itSupportTickets,
} from "./it-assets";
import {
  visaTypes,
  immigrationCases,
  caseDocuments,
  caseDependents,
  physicalPresenceLogs,
} from "./mobility";
import {
  benefitProviders,
  benefitPlans,
  employeeBenefitEnrollments,
  benefitDependents,
  earnedWageAdvances,
} from "./benefits";
import {
  expenseCategories,
  expenseClaims,
  expenseItems,
} from "./claims-and-expenses";
import {
  loanTypes,
  employeeLoans,
  loanRepaymentSchedules,
} from "./loans-and-advances";
import {
  thirdPartyInstitutions,
  cooperativeProducts,
  employeeRemittanceMandates,
  remittanceBatches,
  remittanceBatchItems,
} from "./remittances";
import {
  statutoryAgencies,
  statutoryFilings,
} from "./statutory-filings";
import {
  trainingCourses,
  trainingAssignments,
  trainingRetrainingPolicies,
} from "./learning-training";
import {
  surveyCampaigns,
  surveyQuestions,
  surveyResponses,
  surveyAnswers,
} from "./surveys";
import {
  formTemplates,
  formSubmissions,
  formSignatures,
  formCampaigns,
  formCampaignAssignments,
  formSubmissionReviews,
} from "./forms-and-signatures";
import { companyVehicles, vehicleAssignments } from "./fleet-vehicles";
import { pensionSchemes, employeePensionEnrollments } from "./pension-schemes";
import { jobGrades, benefitGradeEligibility } from "./job-grades";
import {
  geoAdministrativeUnits,
  geoWorkLocations,
} from "./geo-hierarchy";
import {
  currencies,
  currencyExchangeRates,
} from "./currencies-and-fx";
import {
  perDiemPolicies,
  travelRequests,
  travelReconciliations,
} from "./travel-and-perdiem";
import {
  shiftRotationPatterns,
  rotationPatternSteps,
  crewRosters,
} from "./shift-rotations";
import {
  companyLeaveShutdowns,
  leaveCarryoverExceptions,
  leaveLedgerEntries,
} from "./leave-advanced";
import {
  eventsOutbox,
  erpConnectors,
  erpFieldMappings,
  integrationSyncJobs,
} from "./integration-mesh";
import {
  publicHolidays,
  companyEvents,
  announcements,
  announcementReads,
} from "./calendar-comms";
import {
  notificationTemplates,
  notificationPreferences,
  notifications,
  notificationDispatches,
} from "./notifications";
import {
  conversations,
  conversationParticipants,
  chatMessages,
  chatReactions,
  chatMentions,
} from "./chat-and-inbox";
import {
  comments,
  commentMentions,
  commentReactions,
} from "./comments-and-mentions";
import {
  delegationRules,
  delegationAuditLogs,
} from "./delegations";
import {
  grievanceCases,
  grievanceMessages,
} from "./grievances-whistleblowing";
import {
  kudosAwards,
  kudosReactions,
} from "./recognition-kudos";
import { employeeReportingLines } from "./core-hr";
import {
  namingSeriesDefinitions,
  namingSeriesAuditLogs,
} from "./naming-series";
import { workingCalendars } from "./global-calendars";
import { employeeTaxReliefs } from "./payroll-exemptions";
import { entityTranslations } from "./localization";
import { positions, headcountBudgets } from "./positions";

// Tenants Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  organizations: many(organizations),
  branches: many(branches),
  departments: many(departments),
  costCenters: many(costCenters),
  users: many(users),
  roles: many(roles),
  employees: many(employees),
  hardwareDevices: many(hardwareDevices),
  immigrationCases: many(immigrationCases),
  benefitPlans: many(benefitPlans),
  expenseClaims: many(expenseClaims),
  employeeLoans: many(employeeLoans),
  remittanceBatches: many(remittanceBatches),
  statutoryFilings: many(statutoryFilings),
}));

// Organizations Relations
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [organizations.tenantId],
    references: [tenants.id],
  }),
  parentOrg: one(organizations, {
    fields: [organizations.parentOrgId],
    references: [organizations.id],
    relationName: "subsidiary_hierarchy",
  }),
  subsidaries: many(organizations, { relationName: "subsidiary_hierarchy" }),
  branches: many(branches),
  costCenters: many(costCenters),
  departments: many(departments),
  employees: many(employees),
  payGroups: many(payGroups),
  payrollRuns: many(payrollRuns),
  chartOfAccounts: many(chartOfAccounts),
  journalEntries: many(journalEntries),
  hardwareDevices: many(hardwareDevices),
  immigrationCases: many(immigrationCases),
  benefitPlans: many(benefitPlans),
  expenseClaims: many(expenseClaims),
  employeeLoans: many(employeeLoans),
  remittanceBatches: many(remittanceBatches),
  statutoryFilings: many(statutoryFilings),
}));

// Employees Relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [employees.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [employees.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  designation: one(designations, {
    fields: [employees.designationId],
    references: [designations.id],
  }),
  branch: one(branches, {
    fields: [employees.branchId],
    references: [branches.id],
  }),
  costCenter: one(costCenters, {
    fields: [employees.costCenterId],
    references: [costCenters.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "manager_subordinate",
  }),
  subordinates: many(employees, { relationName: "manager_subordinate" }),
  profile: one(employeeProfiles),
  contracts: many(employmentContracts),
  lifecycleEvents: many(lifecycleEvents),
  salaryStructures: many(employeeSalaryStructures),
  salaryComponents: many(employeeSalaryComponents),
  payslips: many(payslips),
  timesheets: many(timesheets),
  attendanceLogs: many(attendanceLogs),
  leaveBalances: many(leaveBalances),
  leaveApplications: many(leaveApplications),
  shiftSchedules: many(shiftSchedules),
  overtimeRequests: many(overtimeRequests),
  documents: many(employeeDocuments),
  
  // Workforce IT Fleet & Access
  devices: many(hardwareDevices),
  deviceAssignments: many(deviceAssignments),
  saasGrants: many(saasAccessGrants),
  itTickets: many(itSupportTickets),

  // Global Mobility & Immigration
  immigrationCases: many(immigrationCases),
  physicalPresenceLogs: many(physicalPresenceLogs),

  // Benefits & Financial Wellness
  benefitEnrollments: many(employeeBenefitEnrollments),
  earnedWageAdvances: many(earnedWageAdvances),

  // Claims & Expenses
  expenseClaims: many(expenseClaims),

  // Loans & Advances
  loans: many(employeeLoans),

  // Third-Party Remittances
  remittanceMandates: many(employeeRemittanceMandates),
}));

// Employee Profiles Relations
export const employeeProfilesRelations = relations(employeeProfiles, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeProfiles.employeeId],
    references: [employees.id],
  }),
}));

// Payroll Relations
export const payrollRunsRelations = relations(payrollRuns, ({ one, many }) => ({
  cycle: one(payrollCycles, {
    fields: [payrollRuns.payrollCycleId],
    references: [payrollCycles.id],
  }),
  organization: one(organizations, {
    fields: [payrollRuns.organizationId],
    references: [organizations.id],
  }),
  payslips: many(payslips),
  payoutBatches: many(payoutBatches),
  advancesDeducted: many(earnedWageAdvances),
  expenseClaimsPaid: many(expenseClaims),
  loanRepaymentsDeducted: many(loanRepaymentSchedules),
  remittanceBatches: many(remittanceBatches),
  statutoryFilings: many(statutoryFilings),
}));

export const payslipsRelations = relations(payslips, ({ one, many }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payslips.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(employees, {
    fields: [payslips.employeeId],
    references: [employees.id],
  }),
  items: many(payslipItems),
  payoutTransactions: many(payoutTransactions),
}));

export const payslipItemsRelations = relations(payslipItems, ({ one }) => ({
  payslip: one(payslips, {
    fields: [payslipItems.payslipId],
    references: [payslips.id],
  }),
  component: one(salaryComponents, {
    fields: [payslipItems.componentId],
    references: [salaryComponents.id],
  }),
}));

// Accounting Sub-Ledger Relations
export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [journalEntries.organizationId],
    references: [organizations.id],
  }),
  lines: many(journalLines),
  syncLogs: many(erpSyncLogs),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(chartOfAccounts, {
    fields: [journalLines.accountId],
    references: [chartOfAccounts.id],
  }),
  costCenter: one(costCenters, {
    fields: [journalLines.costCenterId],
    references: [costCenters.id],
  }),
  department: one(departments, {
    fields: [journalLines.departmentId],
    references: [departments.id],
  }),
}));

// Recruitment Relations
export const jobOpeningsRelations = relations(jobOpenings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [jobOpenings.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [jobOpenings.departmentId],
    references: [departments.id],
  }),
  stages: many(pipelineStages),
  applications: many(candidateApplications),
}));

export const candidateApplicationsRelations = relations(candidateApplications, ({ one, many }) => ({
  jobOpening: one(jobOpenings, {
    fields: [candidateApplications.jobOpeningId],
    references: [jobOpenings.id],
  }),
  candidate: one(candidates, {
    fields: [candidateApplications.candidateId],
    references: [candidates.id],
  }),
  stage: one(pipelineStages, {
    fields: [candidateApplications.stageId],
    references: [pipelineStages.id],
  }),
  interviews: many(interviewSchedules),
  evaluations: many(interviewEvaluations),
  offers: many(jobOffers),
}));

// Leave Relations
export const leaveTypesRelations = relations(leaveTypes, ({ many }) => ({
  policies: many(leavePolicies),
  balances: many(leaveBalances),
  applications: many(leaveApplications),
}));

export const leaveApplicationsRelations = relations(leaveApplications, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveApplications.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveApplications.leaveTypeId],
    references: [leaveTypes.id],
  }),
}));

// Performance Relations
export const appraisalCyclesRelations = relations(appraisalCycles, ({ many }) => ({
  goals: many(goals),
  reviews: many(performanceReviews),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  employee: one(employees, {
    fields: [goals.employeeId],
    references: [employees.id],
  }),
  keyResults: many(goalKeyResults),
}));

// Workflows Relations
export const workflowDefinitionsRelations = relations(workflowDefinitions, ({ many }) => ({
  steps: many(workflowSteps),
  instances: many(workflowInstances),
}));

export const workflowInstancesRelations = relations(workflowInstances, ({ one, many }) => ({
  definition: one(workflowDefinitions, {
    fields: [workflowInstances.workflowDefinitionId],
    references: [workflowDefinitions.id],
  }),
  actions: many(workflowActions),
}));

// Webhook Relations
export const webhookEndpointsRelations = relations(webhookEndpoints, ({ many }) => ({
  deliveries: many(webhookDeliveries),
}));

// Workforce IT Fleet Relations
export const hardwareDevicesRelations = relations(hardwareDevices, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [hardwareDevices.organizationId],
    references: [organizations.id],
  }),
  catalogItem: one(deviceCatalog, {
    fields: [hardwareDevices.catalogId],
    references: [deviceCatalog.id],
  }),
  assignedEmployee: one(employees, {
    fields: [hardwareDevices.assignedEmployeeId],
    references: [employees.id],
  }),
  assignments: many(deviceAssignments),
  tickets: many(itSupportTickets),
}));

export const deviceCatalogRelations = relations(deviceCatalog, ({ many }) => ({
  devices: many(hardwareDevices),
}));

export const saasApplicationsRelations = relations(saasApplications, ({ many }) => ({
  accessGrants: many(saasAccessGrants),
}));

export const saasAccessGrantsRelations = relations(saasAccessGrants, ({ one }) => ({
  employee: one(employees, {
    fields: [saasAccessGrants.employeeId],
    references: [employees.id],
  }),
  application: one(saasApplications, {
    fields: [saasAccessGrants.saasApplicationId],
    references: [saasApplications.id],
  }),
}));

export const itSupportTicketsRelations = relations(itSupportTickets, ({ one }) => ({
  employee: one(employees, {
    fields: [itSupportTickets.employeeId],
    references: [employees.id],
  }),
  device: one(hardwareDevices, {
    fields: [itSupportTickets.deviceId],
    references: [hardwareDevices.id],
  }),
}));

// Global Mobility Relations
export const visaTypesRelations = relations(visaTypes, ({ many }) => ({
  cases: many(immigrationCases),
}));

export const immigrationCasesRelations = relations(immigrationCases, ({ one, many }) => ({
  employee: one(employees, {
    fields: [immigrationCases.employeeId],
    references: [employees.id],
  }),
  visaType: one(visaTypes, {
    fields: [immigrationCases.visaTypeId],
    references: [visaTypes.id],
  }),
  documents: many(caseDocuments),
  dependents: many(caseDependents),
}));

export const caseDocumentsRelations = relations(caseDocuments, ({ one }) => ({
  case: one(immigrationCases, {
    fields: [caseDocuments.caseId],
    references: [immigrationCases.id],
  }),
}));

export const caseDependentsRelations = relations(caseDependents, ({ one }) => ({
  case: one(immigrationCases, {
    fields: [caseDependents.caseId],
    references: [immigrationCases.id],
  }),
}));

export const physicalPresenceLogsRelations = relations(physicalPresenceLogs, ({ one }) => ({
  employee: one(employees, {
    fields: [physicalPresenceLogs.employeeId],
    references: [employees.id],
  }),
}));

// Benefits Relations
export const benefitProvidersRelations = relations(benefitProviders, ({ many }) => ({
  plans: many(benefitPlans),
}));

export const benefitPlansRelations = relations(benefitPlans, ({ one, many }) => ({
  provider: one(benefitProviders, {
    fields: [benefitPlans.providerId],
    references: [benefitProviders.id],
  }),
  organization: one(organizations, {
    fields: [benefitPlans.organizationId],
    references: [organizations.id],
  }),
  enrollments: many(employeeBenefitEnrollments),
}));

export const employeeBenefitEnrollmentsRelations = relations(employeeBenefitEnrollments, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employeeBenefitEnrollments.employeeId],
    references: [employees.id],
  }),
  plan: one(benefitPlans, {
    fields: [employeeBenefitEnrollments.benefitPlanId],
    references: [benefitPlans.id],
  }),
  dependents: many(benefitDependents),
}));

export const benefitDependentsRelations = relations(benefitDependents, ({ one }) => ({
  enrollment: one(employeeBenefitEnrollments, {
    fields: [benefitDependents.enrollmentId],
    references: [employeeBenefitEnrollments.id],
  }),
}));

export const earnedWageAdvancesRelations = relations(earnedWageAdvances, ({ one }) => ({
  employee: one(employees, {
    fields: [earnedWageAdvances.employeeId],
    references: [employees.id],
  }),
  payrollRun: one(payrollRuns, {
    fields: [earnedWageAdvances.deductedInPayrollRunId],
    references: [payrollRuns.id],
  }),
}));

// Claims & Expenses Relations
export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  items: many(expenseItems),
}));

export const expenseClaimsRelations = relations(expenseClaims, ({ one, many }) => ({
  employee: one(employees, {
    fields: [expenseClaims.employeeId],
    references: [employees.id],
  }),
  organization: one(organizations, {
    fields: [expenseClaims.organizationId],
    references: [organizations.id],
  }),
  payrollRun: one(payrollRuns, {
    fields: [expenseClaims.paidInPayrollRunId],
    references: [payrollRuns.id],
  }),
  items: many(expenseItems),
}));

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  claim: one(expenseClaims, {
    fields: [expenseItems.claimId],
    references: [expenseClaims.id],
  }),
  category: one(expenseCategories, {
    fields: [expenseItems.expenseCategoryId],
    references: [expenseCategories.id],
  }),
}));

// Loans & Advances Relations
export const loanTypesRelations = relations(loanTypes, ({ many }) => ({
  loans: many(employeeLoans),
}));

export const employeeLoansRelations = relations(employeeLoans, ({ one, many }) => ({
  employee: one(employees, {
    fields: [employeeLoans.employeeId],
    references: [employees.id],
  }),
  organization: one(organizations, {
    fields: [employeeLoans.organizationId],
    references: [organizations.id],
  }),
  loanType: one(loanTypes, {
    fields: [employeeLoans.loanTypeId],
    references: [loanTypes.id],
  }),
  schedules: many(loanRepaymentSchedules),
}));

export const loanRepaymentSchedulesRelations = relations(loanRepaymentSchedules, ({ one }) => ({
  loan: one(employeeLoans, {
    fields: [loanRepaymentSchedules.loanId],
    references: [employeeLoans.id],
  }),
  payrollRun: one(payrollRuns, {
    fields: [loanRepaymentSchedules.deductedInPayrollRunId],
    references: [payrollRuns.id],
  }),
}));

// Remittances Relations
export const thirdPartyInstitutionsRelations = relations(thirdPartyInstitutions, ({ many }) => ({
  mandates: many(employeeRemittanceMandates),
  batches: many(remittanceBatches),
}));

export const employeeRemittanceMandatesRelations = relations(employeeRemittanceMandates, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeRemittanceMandates.employeeId],
    references: [employees.id],
  }),
  institution: one(thirdPartyInstitutions, {
    fields: [employeeRemittanceMandates.institutionId],
    references: [thirdPartyInstitutions.id],
  }),
}));

export const remittanceBatchesRelations = relations(remittanceBatches, ({ one, many }) => ({
  payrollRun: one(payrollRuns, {
    fields: [remittanceBatches.payrollRunId],
    references: [payrollRuns.id],
  }),
  institution: one(thirdPartyInstitutions, {
    fields: [remittanceBatches.institutionId],
    references: [thirdPartyInstitutions.id],
  }),
  items: many(remittanceBatchItems),
}));

export const remittanceBatchItemsRelations = relations(remittanceBatchItems, ({ one }) => ({
  batch: one(remittanceBatches, {
    fields: [remittanceBatchItems.batchId],
    references: [remittanceBatches.id],
  }),
  employee: one(employees, {
    fields: [remittanceBatchItems.employeeId],
    references: [employees.id],
  }),
}));

// Statutory Filings Relations
export const statutoryAgenciesRelations = relations(statutoryAgencies, ({ many }) => ({
  filings: many(statutoryFilings),
}));

export const statutoryFilingsRelations = relations(statutoryFilings, ({ one }) => ({
  agency: one(statutoryAgencies, {
    fields: [statutoryFilings.agencyId],
    references: [statutoryAgencies.id],
  }),
  payrollRun: one(payrollRuns, {
    fields: [statutoryFilings.payrollRunId],
    references: [payrollRuns.id],
  }),
  organization: one(organizations, {
    fields: [statutoryFilings.organizationId],
    references: [organizations.id],
  }),
}));

// Learning & Training Relations
export const trainingCoursesRelations = relations(trainingCourses, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainingCourses.organizationId],
    references: [organizations.id],
  }),
  publishingDepartment: one(departments, {
    fields: [trainingCourses.publishingDepartmentId],
    references: [departments.id],
  }),
  assignments: many(trainingAssignments),
  retrainingPolicies: many(trainingRetrainingPolicies),
}));

export const trainingAssignmentsRelations = relations(trainingAssignments, ({ one }) => ({
  course: one(trainingCourses, {
    fields: [trainingAssignments.courseId],
    references: [trainingCourses.id],
  }),
  employee: one(employees, {
    fields: [trainingAssignments.employeeId],
    references: [employees.id],
  }),
  assignedByUser: one(users, {
    fields: [trainingAssignments.assignedByUserId],
    references: [users.id],
  }),
}));

export const trainingRetrainingPoliciesRelations = relations(trainingRetrainingPolicies, ({ one }) => ({
  course: one(trainingCourses, {
    fields: [trainingRetrainingPolicies.courseId],
    references: [trainingCourses.id],
  }),
}));

// Surveys & Pulse Feedback Relations
export const surveyCampaignsRelations = relations(surveyCampaigns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [surveyCampaigns.organizationId],
    references: [organizations.id],
  }),
  questions: many(surveyQuestions),
  responses: many(surveyResponses),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  campaign: one(surveyCampaigns, {
    fields: [surveyQuestions.campaignId],
    references: [surveyCampaigns.id],
  }),
  answers: many(surveyAnswers),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one, many }) => ({
  campaign: one(surveyCampaigns, {
    fields: [surveyResponses.campaignId],
    references: [surveyCampaigns.id],
  }),
  employee: one(employees, {
    fields: [surveyResponses.employeeId],
    references: [employees.id],
  }),
  answers: many(surveyAnswers),
}));

export const surveyAnswersRelations = relations(surveyAnswers, ({ one }) => ({
  response: one(surveyResponses, {
    fields: [surveyAnswers.responseId],
    references: [surveyResponses.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyAnswers.questionId],
    references: [surveyQuestions.id],
  }),
}));

// Digital Forms & E-Signatures Relations
export const formTemplatesRelations = relations(formTemplates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [formTemplates.organizationId],
    references: [organizations.id],
  }),
  submissions: many(formSubmissions),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one, many }) => ({
  template: one(formTemplates, {
    fields: [formSubmissions.templateId],
    references: [formTemplates.id],
  }),
  employee: one(employees, {
    fields: [formSubmissions.employeeId],
    references: [employees.id],
  }),
  signatures: many(formSignatures),
}));

export const formSignaturesRelations = relations(formSignatures, ({ one }) => ({
  submission: one(formSubmissions, {
    fields: [formSignatures.submissionId],
    references: [formSubmissions.id],
  }),
  signerUser: one(users, {
    fields: [formSignatures.signerUserId],
    references: [users.id],
  }),
}));

// Dynamic Geographic Hierarchy Relations
export const geoAdministrativeUnitsRelations = relations(geoAdministrativeUnits, ({ one, many }) => ({
  parent: one(geoAdministrativeUnits, {
    fields: [geoAdministrativeUnits.parentId],
    references: [geoAdministrativeUnits.id],
    relationName: "parent_child_geo",
  }),
  children: many(geoAdministrativeUnits, { relationName: "parent_child_geo" }),
  workLocations: many(geoWorkLocations),
}));

export const geoWorkLocationsRelations = relations(geoWorkLocations, ({ one }) => ({
  organization: one(organizations, {
    fields: [geoWorkLocations.organizationId],
    references: [organizations.id],
  }),
  administrativeUnit: one(geoAdministrativeUnits, {
    fields: [geoWorkLocations.administrativeUnitId],
    references: [geoAdministrativeUnits.id],
  }),
}));

// Travel & Per Diem Relations
export const perDiemPoliciesRelations = relations(perDiemPolicies, ({ one }) => ({
  organization: one(organizations, {
    fields: [perDiemPolicies.organizationId],
    references: [organizations.id],
  }),
}));

export const travelRequestsRelations = relations(travelRequests, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [travelRequests.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [travelRequests.employeeId],
    references: [employees.id],
  }),
  approver: one(users, {
    fields: [travelRequests.approvedByUserId],
    references: [users.id],
  }),
  reconciliations: many(travelReconciliations),
}));

export const travelReconciliationsRelations = relations(travelReconciliations, ({ one }) => ({
  travelRequest: one(travelRequests, {
    fields: [travelReconciliations.travelRequestId],
    references: [travelRequests.id],
  }),
  employee: one(employees, {
    fields: [travelReconciliations.employeeId],
    references: [employees.id],
  }),
  auditor: one(users, {
    fields: [travelReconciliations.auditedByUserId],
    references: [users.id],
  }),
}));

// Shift Rotations Relations
export const shiftRotationPatternsRelations = relations(shiftRotationPatterns, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [shiftRotationPatterns.organizationId],
    references: [organizations.id],
  }),
  steps: many(rotationPatternSteps),
  crews: many(crewRosters),
}));

export const rotationPatternStepsRelations = relations(rotationPatternSteps, ({ one }) => ({
  pattern: one(shiftRotationPatterns, {
    fields: [rotationPatternSteps.patternId],
    references: [shiftRotationPatterns.id],
  }),
  shiftTemplate: one(shiftTemplates, {
    fields: [rotationPatternSteps.shiftTemplateId],
    references: [shiftTemplates.id],
  }),
}));

export const crewRostersRelations = relations(crewRosters, ({ one }) => ({
  organization: one(organizations, {
    fields: [crewRosters.organizationId],
    references: [organizations.id],
  }),
  pattern: one(shiftRotationPatterns, {
    fields: [crewRosters.patternId],
    references: [shiftRotationPatterns.id],
  }),
}));

// Corporate Holiday Shutdowns & Leave Ledger Relations
export const companyLeaveShutdownsRelations = relations(companyLeaveShutdowns, ({ one }) => ({
  organization: one(organizations, {
    fields: [companyLeaveShutdowns.organizationId],
    references: [organizations.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [companyLeaveShutdowns.leaveTypeId],
    references: [leaveTypes.id],
  }),
  executor: one(users, {
    fields: [companyLeaveShutdowns.executedByUserId],
    references: [users.id],
  }),
}));

export const leaveCarryoverExceptionsRelations = relations(leaveCarryoverExceptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [leaveCarryoverExceptions.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [leaveCarryoverExceptions.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveCarryoverExceptions.leaveTypeId],
    references: [leaveTypes.id],
  }),
  approver: one(users, {
    fields: [leaveCarryoverExceptions.approvedByUserId],
    references: [users.id],
  }),
}));

export const leaveLedgerEntriesRelations = relations(leaveLedgerEntries, ({ one }) => ({
  organization: one(organizations, {
    fields: [leaveLedgerEntries.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [leaveLedgerEntries.employeeId],
    references: [employees.id],
  }),
  leaveType: one(leaveTypes, {
    fields: [leaveLedgerEntries.leaveTypeId],
    references: [leaveTypes.id],
  }),
  recorder: one(users, {
    fields: [leaveLedgerEntries.recordedByUserId],
    references: [users.id],
  }),
}));

// Enterprise Integration Mesh Relations
export const erpConnectorsRelations = relations(erpConnectors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [erpConnectors.organizationId],
    references: [organizations.id],
  }),
  fieldMappings: many(erpFieldMappings),
  syncJobs: many(integrationSyncJobs),
}));

export const erpFieldMappingsRelations = relations(erpFieldMappings, ({ one }) => ({
  connector: one(erpConnectors, {
    fields: [erpFieldMappings.connectorId],
    references: [erpConnectors.id],
  }),
}));

export const integrationSyncJobsRelations = relations(integrationSyncJobs, ({ one }) => ({
  connector: one(erpConnectors, {
    fields: [integrationSyncJobs.connectorId],
    references: [erpConnectors.id],
  }),
}));

// Communications & Calendar Relations
export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [announcements.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [announcements.authorUserId],
    references: [users.id],
  }),
  reads: many(announcementReads),
}));

export const announcementReadsRelations = relations(announcementReads, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementReads.announcementId],
    references: [announcements.id],
  }),
  user: one(users, {
    fields: [announcementReads.userId],
    references: [users.id],
  }),
}));

// Multi-Channel Notification Engine Relations
export const notificationTemplatesRelations = relations(notificationTemplates, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notificationTemplates.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [notificationTemplates.organizationId],
    references: [organizations.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
  recipient: one(users, {
    fields: [notifications.recipientUserId],
    references: [users.id],
  }),
  sender: one(users, {
    fields: [notifications.senderUserId],
    references: [users.id],
  }),
  dispatches: many(notificationDispatches),
}));

export const notificationDispatchesRelations = relations(notificationDispatches, ({ one }) => ({
  notification: one(notifications, {
    fields: [notificationDispatches.notificationId],
    references: [notifications.id],
  }),
  recipient: one(users, {
    fields: [notificationDispatches.recipientUserId],
    references: [users.id],
  }),
}));

// Real-Time Chat & Inbox Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [conversations.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [conversations.createdById],
    references: [users.id],
  }),
  participants: many(conversationParticipants),
  messages: many(chatMessages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [chatMessages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderUserId],
    references: [users.id],
  }),
  parentMessage: one(chatMessages, {
    fields: [chatMessages.parentMessageId],
    references: [chatMessages.id],
    relationName: "chatThreadReplies",
  }),
  replies: many(chatMessages, {
    relationName: "chatThreadReplies",
  }),
  reactions: many(chatReactions),
  mentions: many(chatMentions),
}));

export const chatReactionsRelations = relations(chatReactions, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatReactions.messageId],
    references: [chatMessages.id],
  }),
  user: one(users, {
    fields: [chatReactions.userId],
    references: [users.id],
  }),
}));

export const chatMentionsRelations = relations(chatMentions, ({ one }) => ({
  message: one(chatMessages, {
    fields: [chatMentions.messageId],
    references: [chatMessages.id],
  }),
  mentionedUser: one(users, {
    fields: [chatMentions.mentionedUserId],
    references: [users.id],
  }),
}));

// Universal Comments & Mentions Relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [comments.tenantId],
    references: [tenants.id],
  }),
  author: one(users, {
    fields: [comments.authorUserId],
    references: [users.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "nestedCommentReplies",
  }),
  replies: many(comments, {
    relationName: "nestedCommentReplies",
  }),
  mentions: many(commentMentions),
  reactions: many(commentReactions),
}));

export const commentMentionsRelations = relations(commentMentions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentMentions.commentId],
    references: [comments.id],
  }),
  mentionedUser: one(users, {
    fields: [commentMentions.mentionedUserId],
    references: [users.id],
  }),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
}));

// Delegation of Authority Relations
export const delegationRulesRelations = relations(delegationRules, ({ one, many }) => ({
  delegator: one(users, {
    fields: [delegationRules.delegatorUserId],
    references: [users.id],
    relationName: "delegatorUser",
  }),
  delegatee: one(users, {
    fields: [delegationRules.delegateeUserId],
    references: [users.id],
    relationName: "delegateeUser",
  }),
  auditLogs: many(delegationAuditLogs),
}));

export const delegationAuditLogsRelations = relations(delegationAuditLogs, ({ one }) => ({
  rule: one(delegationRules, {
    fields: [delegationAuditLogs.delegationRuleId],
    references: [delegationRules.id],
  }),
  actedBy: one(users, {
    fields: [delegationAuditLogs.actedByUserId],
    references: [users.id],
  }),
  onBehalfOf: one(users, {
    fields: [delegationAuditLogs.onBehalfOfUserId],
    references: [users.id],
  }),
}));

// Grievances & Whistleblowing Relations
export const grievanceCasesRelations = relations(grievanceCases, ({ one, many }) => ({
  reporter: one(users, {
    fields: [grievanceCases.reporterUserId],
    references: [users.id],
  }),
  assignedInvestigator: one(users, {
    fields: [grievanceCases.assignedInvestigatorUserId],
    references: [users.id],
  }),
  messages: many(grievanceMessages),
}));

export const grievanceMessagesRelations = relations(grievanceMessages, ({ one }) => ({
  case: one(grievanceCases, {
    fields: [grievanceMessages.caseId],
    references: [grievanceCases.id],
  }),
  sender: one(users, {
    fields: [grievanceMessages.senderUserId],
    references: [users.id],
  }),
}));

// Employee Recognition & Kudos Relations
export const kudosAwardsRelations = relations(kudosAwards, ({ one, many }) => ({
  sender: one(users, {
    fields: [kudosAwards.senderUserId],
    references: [users.id],
    relationName: "kudosSender",
  }),
  receiver: one(users, {
    fields: [kudosAwards.receiverUserId],
    references: [users.id],
    relationName: "kudosReceiver",
  }),
  reactions: many(kudosReactions),
}));

export const kudosReactionsRelations = relations(kudosReactions, ({ one }) => ({
  kudos: one(kudosAwards, {
    fields: [kudosReactions.kudosId],
    references: [kudosAwards.id],
  }),
  user: one(users, {
    fields: [kudosReactions.userId],
    references: [users.id],
  }),
}));

// Naming Series Relations
export const namingSeriesDefinitionsRelations = relations(namingSeriesDefinitions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [namingSeriesDefinitions.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [namingSeriesDefinitions.organizationId],
    references: [organizations.id],
  }),
  auditLogs: many(namingSeriesAuditLogs),
}));

export const namingSeriesAuditLogsRelations = relations(namingSeriesAuditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [namingSeriesAuditLogs.tenantId],
    references: [tenants.id],
  }),
  seriesDefinition: one(namingSeriesDefinitions, {
    fields: [namingSeriesAuditLogs.seriesDefinitionId],
    references: [namingSeriesDefinitions.id],
  }),
  user: one(users, {
    fields: [namingSeriesAuditLogs.generatedByUserId],
    references: [users.id],
  }),
}));

// Global Calendars Relations
export const workingCalendarsRelations = relations(workingCalendars, ({ one }) => ({
  tenant: one(tenants, {
    fields: [workingCalendars.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [workingCalendars.organizationId],
    references: [organizations.id],
  }),
}));

export const publicHolidaysRelations = relations(publicHolidays, ({ one }) => ({
  tenant: one(tenants, {
    fields: [publicHolidays.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [publicHolidays.organizationId],
    references: [organizations.id],
  }),
  administrativeUnit: one(geoAdministrativeUnits, {
    fields: [publicHolidays.administrativeUnitId],
    references: [geoAdministrativeUnits.id],
  }),
}));

// Employee Tax Reliefs Relations
export const employeeTaxReliefsRelations = relations(employeeTaxReliefs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [employeeTaxReliefs.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [employeeTaxReliefs.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [employeeTaxReliefs.employeeId],
    references: [employees.id],
  }),
  verifiedByUser: one(users, {
    fields: [employeeTaxReliefs.verifiedByUserId],
    references: [users.id],
  }),
}));

// Position Management Relations
export const positionsRelations = relations(positions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [positions.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [positions.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [positions.departmentId],
    references: [departments.id],
  }),
  designation: one(designations, {
    fields: [positions.designationId],
    references: [designations.id],
  }),
  costCenter: one(costCenters, {
    fields: [positions.costCenterId],
    references: [costCenters.id],
  }),
  branch: one(branches, {
    fields: [positions.branchId],
    references: [branches.id],
  }),
  parentPosition: one(positions, {
    fields: [positions.parentPositionId],
    references: [positions.id],
    relationName: "positionHierarchy",
  }),
  childPositions: many(positions, {
    relationName: "positionHierarchy",
  }),
}));

export const headcountBudgetsRelations = relations(headcountBudgets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [headcountBudgets.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [headcountBudgets.organizationId],
    references: [organizations.id],
  }),
  department: one(departments, {
    fields: [headcountBudgets.departmentId],
    references: [departments.id],
  }),
}));

// Matrix Reporting Lines Relations
export const employeeReportingLinesRelations = relations(employeeReportingLines, ({ one }) => ({
  tenant: one(tenants, {
    fields: [employeeReportingLines.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [employeeReportingLines.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [employeeReportingLines.employeeId],
    references: [employees.id],
    relationName: "employeeReporting",
  }),
  manager: one(employees, {
    fields: [employeeReportingLines.managerEmployeeId],
    references: [employees.id],
    relationName: "managerReporting",
  }),
}));

// Entity Translations Relations
export const entityTranslationsRelations = relations(entityTranslations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [entityTranslations.tenantId],
    references: [tenants.id],
  }),
}));

// Cooperative Products Relations
export const cooperativeProductsRelations = relations(cooperativeProducts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [cooperativeProducts.tenantId],
    references: [tenants.id],
  }),
  institution: one(thirdPartyInstitutions, {
    fields: [cooperativeProducts.institutionId],
    references: [thirdPartyInstitutions.id],
  }),
  mandates: many(employeeRemittanceMandates),
}));

// Fleet & Vehicle Relations
export const companyVehiclesRelations = relations(companyVehicles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companyVehicles.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [companyVehicles.organizationId],
    references: [organizations.id],
  }),
  assignedEmployee: one(employees, {
    fields: [companyVehicles.assignedEmployeeId],
    references: [employees.id],
    relationName: "vehicleCustodian",
  }),
  assignedDriver: one(employees, {
    fields: [companyVehicles.assignedDriverEmployeeId],
    references: [employees.id],
    relationName: "vehicleDriver",
  }),
  assignments: many(vehicleAssignments),
}));

export const vehicleAssignmentsRelations = relations(vehicleAssignments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [vehicleAssignments.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [vehicleAssignments.organizationId],
    references: [organizations.id],
  }),
  vehicle: one(companyVehicles, {
    fields: [vehicleAssignments.vehicleId],
    references: [companyVehicles.id],
  }),
  employee: one(employees, {
    fields: [vehicleAssignments.employeeId],
    references: [employees.id],
  }),
  approvedByUser: one(users, {
    fields: [vehicleAssignments.approvedByUserId],
    references: [users.id],
  }),
}));

// Generic Pension Schemes Relations
export const pensionSchemesRelations = relations(pensionSchemes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [pensionSchemes.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [pensionSchemes.organizationId],
    references: [organizations.id],
  }),
  enrollments: many(employeePensionEnrollments),
}));

export const employeePensionEnrollmentsRelations = relations(employeePensionEnrollments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [employeePensionEnrollments.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [employeePensionEnrollments.organizationId],
    references: [organizations.id],
  }),
  employee: one(employees, {
    fields: [employeePensionEnrollments.employeeId],
    references: [employees.id],
  }),
  pensionScheme: one(pensionSchemes, {
    fields: [employeePensionEnrollments.pensionSchemeId],
    references: [pensionSchemes.id],
  }),
}));

// Job Grades Relations
export const jobGradesRelations = relations(jobGrades, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [jobGrades.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [jobGrades.organizationId],
    references: [organizations.id],
  }),
  benefitEligibilities: many(benefitGradeEligibility),
}));

export const benefitGradeEligibilityRelations = relations(benefitGradeEligibility, ({ one }) => ({
  tenant: one(tenants, {
    fields: [benefitGradeEligibility.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [benefitGradeEligibility.organizationId],
    references: [organizations.id],
  }),
  grade: one(jobGrades, {
    fields: [benefitGradeEligibility.gradeId],
    references: [jobGrades.id],
  }),
  benefitPlan: one(benefitPlans, {
    fields: [benefitGradeEligibility.benefitPlanId],
    references: [benefitPlans.id],
  }),
}));

// Universal Form Campaigns & Reviews Relations
export const formCampaignsRelations = relations(formCampaigns, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [formCampaigns.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [formCampaigns.organizationId],
    references: [organizations.id],
  }),
  template: one(formTemplates, {
    fields: [formCampaigns.templateId],
    references: [formTemplates.id],
  }),
  launchedByUser: one(users, {
    fields: [formCampaigns.launchedByUserId],
    references: [users.id],
  }),
  assignments: many(formCampaignAssignments),
}));

export const formCampaignAssignmentsRelations = relations(formCampaignAssignments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [formCampaignAssignments.tenantId],
    references: [tenants.id],
  }),
  campaign: one(formCampaigns, {
    fields: [formCampaignAssignments.campaignId],
    references: [formCampaigns.id],
  }),
  employee: one(employees, {
    fields: [formCampaignAssignments.employeeId],
    references: [employees.id],
  }),
  submission: one(formSubmissions, {
    fields: [formCampaignAssignments.submissionId],
    references: [formSubmissions.id],
  }),
}));

export const formSubmissionReviewsRelations = relations(formSubmissionReviews, ({ one }) => ({
  tenant: one(tenants, {
    fields: [formSubmissionReviews.tenantId],
    references: [tenants.id],
  }),
  submission: one(formSubmissions, {
    fields: [formSubmissionReviews.submissionId],
    references: [formSubmissions.id],
  }),
  assignedReviewerUser: one(users, {
    fields: [formSubmissionReviews.assignedReviewerUserId],
    references: [users.id],
  }),
}));



