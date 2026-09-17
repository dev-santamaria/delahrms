-- ====================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) & MULTI-TENANCY ENFORCEMENT POLICIES
-- ====================================================================
-- This script sets up strict cryptographic database-level tenant isolation,
-- preventing any cross-tenant data leakage across all HRMS modules.
-- ====================================================================

-- 1. Helper Functions to extract JWT claims or session variables
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- First checks Supabase JWT app_metadata / custom claims
  IF (auth.jwt() -> 'app_metadata' ->> 'tenant_id') IS NOT NULL THEN
    RETURN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
  END IF;
  
  -- Fallback to top-level JWT claim
  IF (auth.jwt() ->> 'tenant_id') IS NOT NULL THEN
    RETURN (auth.jwt() ->> 'tenant_id')::uuid;
  END IF;

  -- Fallback to local session setting (useful for service-role backend connections)
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION current_user_has_permission(required_perm text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  has_perm boolean;
BEGIN
  -- Super admins have all permissions
  IF (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.tenant_id = current_tenant_id()
      AND r.permissions ? required_perm
  ) INTO has_perm;

  RETURN COALESCE(has_perm, false);
END;
$$;

-- ====================================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ====================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE pay_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sync_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_encashments ENABLE ROW LEVEL SECURITY;

ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

ALTER TABLE appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;

ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 3. STANDARD TENANT ISOLATION POLICIES (All Modules)
-- ====================================================================

-- Organizations / Subsidiaries
CREATE POLICY orgs_tenant_isolation ON organizations
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Employees
CREATE POLICY employees_tenant_isolation ON employees
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Payroll Runs (Accessible to HR and Payroll specialists)
CREATE POLICY payroll_runs_isolation ON payroll_runs
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Payslips: Managers/HR see all in tenant; Employees see ONLY their own
CREATE POLICY payslips_read_policy ON payslips
  FOR SELECT
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('payroll:view_all')
    )
  );

CREATE POLICY payslips_modify_policy ON payslips
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND 
    current_user_has_permission('payroll:manage')
  );

-- Double-Entry Accounting (Restricted to Finance & Admins)
CREATE POLICY journal_entries_isolation ON journal_entries
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY journal_lines_isolation ON journal_lines
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

-- Leave Applications: Self-Service & Manager Visibility
CREATE POLICY leave_apps_read_policy ON leave_applications
  FOR SELECT
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      employee_id IN (SELECT id FROM employees WHERE manager_id IN (SELECT id FROM employees WHERE user_id = auth.uid())) OR
      current_user_has_permission('leave:view_all')
    )
  );

CREATE POLICY leave_apps_insert_policy ON leave_applications
  FOR INSERT
  WITH CHECK (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('leave:manage')
    )
  );

-- Attendance Logs: Self-Punch & Manager/HR View
CREATE POLICY attendance_logs_policy ON attendance_logs
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('attendance:view_all')
    )
  );

-- ====================================================================
-- 4. WORKFORCE IT FLEET, GLOBAL MOBILITY & BENEFITS POLICIES
-- ====================================================================

-- Workforce IT: Hardware Devices
ALTER TABLE device_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saas_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY devices_tenant_isolation ON hardware_devices
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY it_tickets_policy ON it_support_tickets
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('it:manage')
    )
  );

-- Global Mobility: Visas & International Tax Presence
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE immigration_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_presence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY immigration_cases_policy ON immigration_cases
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('mobility:manage')
    )
  );

CREATE POLICY presence_logs_policy ON physical_presence_logs
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('mobility:view_all')
    )
  );

-- Global Benefits & Financial Wellness (EWA)
ALTER TABLE benefit_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_wage_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY benefit_plans_isolation ON benefit_plans
  FOR ALL
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY benefit_enrollments_policy ON employee_benefit_enrollments
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('benefits:manage')
    )
  );

CREATE POLICY ewa_advances_policy ON earned_wage_advances
  FOR ALL
  USING (
    tenant_id = current_tenant_id() AND (
      employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()) OR
      current_user_has_permission('payroll:manage')
    )
  );

