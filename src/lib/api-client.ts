/**
 * DelaHR Universal Enterprise API Client
 *
 * Strongly-typed client wrapper for all 39 Hono backend domain routers mounted on `/api/v1/*`.
 * Automatically manages:
 * - Multi-tenant isolation headers (X-Tenant-ID, X-Organization-ID)
 * - User RBAC context headers (X-User-ID, X-User-Role)
 * - Structured JSON parsing and standardized ApiResponse envelopes
 * - Comprehensive endpoint accessors for all enterprise modules
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
  status: number;
  [key: string]: any;
}

export interface ApiClientConfig {
  baseUrl?: string;
  tenantId?: string;
  organizationId?: string;
  userId?: string;
  userRole?: string;
}

class ApiClient {
  private baseUrl: string;
  private tenantId: string = "tenant-default";
  private organizationId: string = "org-kenya";
  private userId: string = "usr-nelson-mandela";
  private userRole: string = "super_admin";

  private customFetch?: (url: string, options: RequestInit) => Promise<Response> | Response;

  constructor(config?: ApiClientConfig) {
    this.baseUrl = config?.baseUrl || (typeof window !== "undefined" ? "" : "http://localhost:3000");
    if (config?.tenantId) this.tenantId = config.tenantId;
    if (config?.organizationId) this.organizationId = config.organizationId;
    if (config?.userId) this.userId = config.userId;
    if (config?.userRole) this.userRole = config.userRole;
  }

  public setCustomFetch(fetcher?: (url: string, options: RequestInit) => Promise<Response> | Response) {
    this.customFetch = fetcher;
  }

  public setContext(context: {
    tenantId?: string;
    organizationId?: string;
    userId?: string;
    userRole?: string;
  }) {
    if (context.tenantId) this.tenantId = context.tenantId;
    if (context.organizationId) this.organizationId = context.organizationId;
    if (context.userId) this.userId = context.userId;
    if (context.userRole) this.userRole = context.userRole;
  }

  public getContext() {
    return {
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      userId: this.userId,
      userRole: this.userRole,
    };
  }

  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "X-Tenant-ID": this.tenantId,
      "X-Organization-ID": this.organizationId,
      "X-User-ID": this.userId,
      "X-User-Role": this.userRole,
      ...customHeaders,
    };
  }

  public async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    try {
      const fetchFn = this.customFetch || fetch;
      const response = await fetchFn(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
      });

      const contentType = response.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { raw: text } : null;
      }

      if (!response.ok) {
        return {
          ...data,
          success: false,
          status: response.status,
          error: data?.error || data?.message || `Request failed with HTTP status ${response.status}`,
          data: data?.data || data,
          metadata: data?.metadata,
        };
      }

      return {
        ...data,
        success: true,
        status: response.status,
        data: (data && "data" in data) ? data.data : data,
        metadata: data?.metadata,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 500,
        error: err?.message || "Network error occurred connecting to DelaHR API",
      };
    }
  }

  public get<T = any>(path: string, queryParams?: Record<string, any>): Promise<ApiResponse<T>> {
    let fullPath = path;
    if (queryParams) {
      const filteredParams = Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== null);
      if (filteredParams.length > 0) {
        const qs = new URLSearchParams(
          filteredParams.map(([k, v]) => [k, String(v)])
        ).toString();
        fullPath = `${path}${path.includes("?") ? "&" : "?"}${qs}`;
      }
    }
    return this.request<T>(fullPath, { method: "GET" });
  }

  public post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" });
  }

  // ==========================================
  // Domain Specific Endpoints Accessors
  // ==========================================

  public readonly auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post("/api/v1/auth/login", credentials),
    registerTenant: (formData: any) =>
      this.post("/api/v1/auth/register-tenant", formData),
    setupMfa: (email: string) =>
      this.post("/api/v1/auth/mfa/setup", { email }),
    verifyMfa: (data: { email: string; code: string; isBackupCode?: boolean; tempToken?: string }) =>
      this.post("/api/v1/auth/mfa/verify", data),
    getMe: () => this.get("/api/v1/auth/me"),
    getPendingTenants: () => this.get("/api/v1/auth/pending-tenants"),
  };

  public readonly saas = {
    getTenants: (params?: any) => this.get("/api/v1/saas/tenants", params),
    getTenant: (id: string) => this.get(`/api/v1/saas/tenants/${id}`),
    onboardTenant: (data: any) => this.post("/api/v1/saas/tenants/onboard", data),
    performAction: (id: string, action: string, payload?: any) =>
      this.post(`/api/v1/saas/tenants/${id}/actions`, { action, ...payload }),
    approveTenant: (id: string) =>
      this.post(`/api/v1/saas/tenants/${id}/actions`, { action: "approve" }),
    rejectTenant: (id: string, reason?: string) =>
      this.post(`/api/v1/saas/tenants/${id}/actions`, { action: "reject", reason }),
    tenantAction: (id: string, actionData: any) => this.post(`/api/v1/saas/tenants/${id}/actions`, actionData),
    getSubscriptions: () => this.get("/api/v1/saas/billing/subscriptions"),
    generateInvoice: (data: any) => this.post("/api/v1/saas/billing/invoices/generate", data),
    getUsage: (id: string) => this.get(`/api/v1/saas/tenants/${id}/usage`),
  };

  public readonly users = {
    getUsers: () => this.get("/api/v1/users"),
    listUsers: (params?: any) => this.get("/api/v1/users", params),
    inviteUser: (data: any) => this.post("/api/v1/users/invite", data),
    getInvitations: () => this.get("/api/v1/users/invitations"),
    updateRole: (id: string, roleSlug: string, organizationId?: string) =>
      this.patch(`/api/v1/users/${id}/role`, { roleSlug, organizationId }),
    updateStatus: (id: string, statusOrIsActive: string | boolean) => {
      const isActive = typeof statusOrIsActive === "boolean" ? statusOrIsActive : statusOrIsActive === "active";
      return this.patch(`/api/v1/users/${id}/status`, { isActive });
    },
    syncSupabase: (event: string, record: any) => this.post("/api/v1/users/supabase-sync", { event, record }),
    syncSupabaseUser: (data: any) => this.post("/api/v1/users/supabase-sync", data),
  };

  public readonly documents = {
    presignUpload: (data: {
      fileName: string;
      mimeType: string;
      fileSizeBytes?: number;
      sizeBytes?: number;
      category?: string;
      documentType?: string;
      magicBytesHex?: string;
    }) =>
      this.post("/api/v1/documents/presign-upload", {
        fileName: data.fileName,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes || data.sizeBytes || 1024000,
        documentType: data.documentType || (["contract", "identification", "certificate", "receipt", "policy"].includes(data.category || "") ? data.category : "other"),
        magicBytesHex: data.magicBytesHex,
      }),
    optimize: (data: { documentId?: string; originalFileName?: string; fileName?: string; fileType?: string; mimeType?: string; originalFileSizeBytes?: number; originalSizeBytes?: number }) =>
      this.post("/api/v1/documents/optimize", {
        documentId: data.documentId,
        originalFileName: data.originalFileName || data.fileName || "document.pdf",
        originalFileSizeBytes: data.originalFileSizeBytes || data.originalSizeBytes || 1024000,
        mimeType: data.mimeType || data.fileType || "application/pdf",
      }),
    getStorageMetrics: () => this.get("/api/v1/documents/storage-metrics"),
    listDocuments: (params?: any) => this.get("/api/v1/documents", params),
    getCategories: () => this.get("/api/v1/documents/categories"),
    getPolicies: () => this.get("/api/v1/documents/policies"),
    acknowledgePolicy: (id: string, data: any) => this.post(`/api/v1/documents/policies/${id}/acknowledge`, data),
  };

  public readonly social = {
    getConversations: () => this.get("/api/v1/social/conversations"),
    getMessages: (conversationId: string) => this.get(`/api/v1/social/conversations/${conversationId}/messages`),
    postMessage: (conversationId: string, data: any) => this.post(`/api/v1/social/conversations/${conversationId}/messages`, data),
    getKudos: () => this.get("/api/v1/social/kudos"),
    awardKudos: (data: any) => this.post("/api/v1/social/kudos", data),
    getAnnouncements: () => this.get("/api/v1/social/announcements"),
  };

  public readonly station = {
    getStations: (params?: any) => this.get("/api/v1/geo-hierarchy/work-locations", params),
    getStation: (id: string) => this.get(`/api/v1/geo-hierarchy/work-locations/${id}`),
    getTransfers: (params?: any) => this.get("/api/v1/mobility/transfers/domestic", params),
    createTransfer: (data: any) => this.post("/api/v1/mobility/transfers/domestic", data),
    getRotations: () => this.get("/api/v1/shifts/patterns"),
    createRotation: (data: any) => this.post("/api/v1/attendance/shifts", data),
    getFleet: (params?: any) => this.get("/api/v1/fleet/vehicles", params),
    logFleetTrip: (data: any) => this.post("/api/v1/fleet/vehicles", data),
  };

  public readonly workforce = {
    getEmployees: (params?: any) => this.get("/api/v1/employees", params),
    getEmployee: (id: string) => this.get(`/api/v1/employees/${id}`),
    createEmployee: (data: any) => this.post("/api/v1/employees", data),
    updateEmployee: (id: string, data: any) => this.put(`/api/v1/employees/${id}`, data),
    updateBanking: (id: string, data: any) => this.patch(`/api/v1/employees/${id}/banking`, data),
    recordLifecycle: (id: string, data: any) => this.post(`/api/v1/employees/${id}/lifecycle`, data),
    getLifecycles: (id: string) => this.get(`/api/v1/employees/${id}/lifecycles`),
    getOrganization: () => this.get("/api/v1/organization/structure"),
  };

  public readonly organization = {
    getDepartments: () => this.get("/api/v1/organization/departments"),
    createDepartment: (data: any) => this.post("/api/v1/organization/departments", data),
    getBranches: () => this.get("/api/v1/organization/branches"),
    createBranch: (data: any) => this.post("/api/v1/organization/branches", data),
    getDesignations: () => this.get("/api/v1/organization/designations"),
    createDesignation: (data: any) => this.post("/api/v1/organization/designations", data),
    getHierarchy: () => this.get("/api/v1/organization/hierarchy"),
    getReportingLines: (params?: any) => this.get("/api/v1/organization/reporting-lines", params),
    assignReportingLine: (data: any) => this.post("/api/v1/organization/reporting-lines", data),
    getRoles: () => this.get("/api/v1/organization/roles"),
  };

  public readonly jobGrades = {
    getGrades: () => this.get("/api/v1/job-grades/grades"),
    createGrade: (data: any) => this.post("/api/v1/job-grades/grades", data),
    getBenefitMatrix: () => this.get("/api/v1/job-grades/benefit-matrix"),
    configureBenefitMatrix: (data: any) => this.post("/api/v1/job-grades/benefit-matrix", data),
    getEntitlements: (id: string) => this.get(`/api/v1/job-grades/grades/${id}/entitlements`),
  };

  public readonly recruitment = {
    getOpenings: (params?: any) => this.get("/api/v1/recruitment/openings", params),
    createOpening: (data: any) => this.post("/api/v1/recruitment/openings", data),
    getCandidates: (params?: any) => this.get("/api/v1/recruitment/candidates", params),
    createCandidate: (data: any) => this.post("/api/v1/recruitment/candidates", data),
    getApplications: (params?: any) => this.get("/api/v1/recruitment/applications", params),
    submitApplication: (data: any) => this.post("/api/v1/recruitment/applications", data),
    scheduleInterview: (data: any) => this.post("/api/v1/recruitment/interviews/schedule", data),
    submitEvaluation: (data: any) => this.post("/api/v1/recruitment/interviews/evaluate", data),
    getOffers: () => this.get("/api/v1/recruitment/offers"),
    generateOffer: (data: any) => this.post("/api/v1/recruitment/offers", data),
  };

  public readonly learning = {
    getCourses: (params?: any) => this.get("/api/v1/learning/courses", params),
    createCourse: (data: any) => this.post("/api/v1/learning/courses", data),
    getAssignments: (params?: any) => this.get("/api/v1/learning/assignments", params),
    assignCourse: (data: any) => this.post("/api/v1/learning/assignments", data),
    completeAssignment: (id: string, data: any) => this.patch(`/api/v1/learning/assignments/${id}/complete`, data),
    getComplianceMatrix: () => this.get("/api/v1/learning/compliance/retraining-matrix"),
    getEmployeeAssignments: (empId: string) => this.get(`/api/v1/learning/assignments/employee/${empId}`),
  };

  public readonly ethics = {
    getCases: (params?: any) => this.get("/api/v1/grievances/cases", params),
    getCase: (id: string) => this.get(`/api/v1/grievances/cases/${id}`),
    fileCase: (data: any) => this.post("/api/v1/grievances/cases", data),
    trackCase: (caseNumber: string, accessPasscode: string) =>
      this.post("/api/v1/grievances/cases/track", { caseNumber, accessPasscode }),
    assignInvestigator: (id: string, data: any) => this.post(`/api/v1/grievances/cases/${id}/assign`, data),
    getMessages: (id: string) => this.get(`/api/v1/grievances/cases/${id}/messages`),
    postMessage: (id: string, data: any) => this.post(`/api/v1/grievances/cases/${id}/messages`, data),
    resolveCase: (id: string, data: any) => this.post(`/api/v1/grievances/cases/${id}/resolve`, data),
  };

  public readonly mobility = {
    getCases: (params?: any) => this.get("/api/v1/mobility/cases", params),
    getCase: (id: string) => this.get(`/api/v1/mobility/cases/${id}`),
    createCase: (data: any) => this.post("/api/v1/mobility/cases", data),
    getPresenceStatus: (employeeId: string) => this.get(`/api/v1/mobility/presence/${employeeId}/status`),
    logPresence: (data: any) => this.post("/api/v1/mobility/presence/log", data),
    getVisas: () => this.get("/api/v1/mobility/visas"),
    getExpatTaxStatus: (id: string) => this.get(`/api/v1/mobility/expat-tax/${id}`),
    trackResidency: (employeeId: string) => this.get(`/api/v1/mobility/residency-tracker/${employeeId}`),
  };

  public readonly payroll = {
    preview: (data: any) => this.post("/api/v1/payroll/preview", data),
    getPayRuns: (params?: any) => this.get("/api/v1/payroll/runs", params),
    createPayRun: (data: any) => this.post("/api/v1/payroll/runs", data),
    approvePayRun: (id: string) => this.post(`/api/v1/payroll/runs/${id}/approve`, {}),
    getStatutoryFiles: (runId: string, params?: any) => this.get(`/api/v1/payroll/runs/${runId}/statutory-files`, params),
    getPayGroups: () => this.get("/api/v1/payroll/pay-groups"),
    getSalaryComponents: () => this.get("/api/v1/payroll/salary-components"),
    getTaxReliefs: (empId: string) => this.get(`/api/v1/payroll/tax-reliefs/${empId}`),
    registerTaxRelief: (data: any) => this.post("/api/v1/payroll/tax-reliefs", data),
  };

  public readonly statutory = {
    getAgencies: (countryCode?: string) => this.get("/api/v1/statutory/agencies", countryCode ? { countryCode } : undefined),
    getFilings: (params?: any) => this.get("/api/v1/statutory/filings", params),
    generateFilingBatch: (data: any) => this.post("/api/v1/statutory/filings/generate-batch", data),
    markPaid: (id: string, data: any) => this.patch(`/api/v1/statutory/filings/${id}/pay`, data),
    getRemittanceBatches: (params?: any) => this.get("/api/v1/statutory/remittances/batches", params),
  };

  public readonly loans = {
    getLoans: () => this.get("/api/v1/loans"),
    applyLoan: (data: any) => this.post("/api/v1/loans/apply", data),
    approveLoan: (id: string) => this.post(`/api/v1/loans/${id}/approve`, {}),
  };

  public readonly subledger = {
    generateJournal: (data: any) => this.post("/api/v1/accounting/generate-journal", data),
    exportErp: (data: { targetErp: "sap_s4hana" | "erpnext" | "oracle_netsuite"; journalVoucher: any }) =>
      this.post("/api/v1/accounting/export-erp", data),
    getChartOfAccounts: () => this.get("/api/v1/accounting/chart-of-accounts"),
    getJournalEntries: (params?: any) => this.get("/api/v1/subledger/entries", params),
    postVoucher: (data: any) => this.post("/api/v1/subledger/vouchers", data),
    syncErp: (data: { erpSystem: "SAP" | "ERPNEXT"; voucherId: string }) =>
      this.post("/api/v1/subledger/erp-sync", data),
  };

  public readonly treasury = {
    getCurrencies: () => this.get("/api/v1/localization/currencies"),
    getFxRates: (params?: any) => this.get("/api/v1/localization/fx-rates", params),
    recordFxRate: (data: any) => this.post("/api/v1/localization/fx-rates", data),
    convertFx: (data: { amount: number; fromCurrency: string; toCurrency: string }) =>
      this.post("/api/v1/localization/convert", data),
    getTranslations: (languageCode?: string) =>
      this.get("/api/v1/localization/translations", languageCode ? { languageCode } : undefined),
  };

  public readonly notifications = {
    getInbox: (userId?: string) => this.get(`/api/v1/notifications/inbox/${userId || this.userId}`),
    markAsRead: (id: string) => this.patch(`/api/v1/notifications/${id}/read`, {}),
    sendNotification: (data: any) => this.post("/api/v1/notifications/send", data),
  };

  public readonly approvals = {
    getPending: (params?: any) => this.get("/api/v1/approvals/pending", params),
    decide: (id: string, action: "APPROVE" | "REJECT", comment?: string) =>
      this.post(`/api/v1/approvals/${id}/action`, { action, comment }),
  };

  public readonly timeShifts = {
    getPunches: (params?: any) => this.get("/api/v1/time-tracking/punches", params),
    recordPunch: (data: { employeeId: string; type: "CLOCK_IN" | "CLOCK_OUT"; latitude?: number; longitude?: number; stationId?: string }) =>
      this.post("/api/v1/time-tracking/punch", data),
    getTimesheets: (params?: any) => this.get("/api/v1/time-tracking/timesheets", params),
  };

  public readonly assets = {
    getDevices: (params?: any) => this.get("/api/v1/assets/devices", params),
    registerDevice: (data: any) => this.post("/api/v1/assets/devices", data),
    assignDevice: (data: any) => this.post("/api/v1/assets/assignments", data),
    provisionSaas: (data: any) => this.post("/api/v1/assets/saas-grants", data),
    getTickets: (params?: any) => this.get("/api/v1/assets/tickets", params),
    createTicket: (data: any) => this.post("/api/v1/assets/tickets", data),
  };

  public readonly audit = {
    getLogs: (params?: any) => this.get("/api/v1/audit/logs", params),
    getCustomFields: (params?: any) => this.get("/api/v1/audit/custom-fields", params),
    getTaxonomies: (params?: any) => this.get("/api/v1/audit/taxonomies", params),
  };

  public readonly developer = {
    getEndpoints: () => this.get("/api/v1/webhooks/endpoints"),
    createEndpoint: (data: any) => this.post("/api/v1/webhooks/endpoints", data),
    getDeliveries: () => this.get("/api/v1/webhooks/deliveries"),
    getOutbox: () => this.get("/api/v1/webhooks/outbox"),
    getApiKeys: () => this.get("/api/v1/webhooks/api-keys"),
    createApiKey: (data: any) => this.post("/api/v1/webhooks/api-keys", data),
    getIntegrations: () => this.get("/api/v1/integrations/connectors"),
  };

  public readonly governance = {
    getWorkflows: () => this.get("/api/v1/workflows/definitions"),
    createWorkflow: (data: any) => this.post("/api/v1/workflows/definitions", data),
    getSeries: () => this.get("/api/v1/naming-series/series"),
    generateSeriesNext: (data: any) => this.post("/api/v1/naming-series/next", data),
    getGeoCountries: () => this.get("/api/v1/geo-hierarchy/countries"),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
