/**
 * =========================================================================================
 * CORE API TYPES & MULTI-TENANCY CONTEXT
 * =========================================================================================
 */

export type AppVariables = {
  tenantId: string;
  organizationId?: string;
  userId?: string;
  userRole?: string;
};

export type AppEnv = {
  Variables: AppVariables;
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  error?: string;
  details?: any;
}
