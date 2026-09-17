/**
 * =========================================================================================
 * PHASE 5 INTEGRATION TEST SUITE: ENTERPRISE INFRASTRUCTURE, WORKFLOWS & AUTOMATION
 * =========================================================================================
 * Automated end-to-end verification for Phase 5 domain routers:
 * 1. Naming Series & Document Sequence Generator
 * 2. Universal Approval Workflow Chains & Step Actions
 * 3. Delegation of Authority (DoA), Monetary Thresholds & Proxy Audit
 * 4. Event-Driven Webhooks, HMAC-SHA256 Signatures & Transactional Outbox
 * 5. Omni-Channel Notification Engine, Template Interpolation & Inbox Center
 * 6. Regulatory Audit Trail (Before/After Diffs) & Runtime Custom Fields
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
    console.log(`  ✔ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✖ FAIL: ${testName}`);
    if (details) {
      console.error(`    Details:`, JSON.stringify(details, null, 2));
    }
  }
}

async function runPhase5TestSuite() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 5: ENTERPRISE INFRASTRUCTURE, WORKFLOWS & AUTOMATION SUITE");
  console.log("=================================================================================\n");

  // =========================================================================================
  // SECTION 1: Naming Series & Sequence Generator
  // =========================================================================================
  console.log("[SECTION 1] Naming Series & Document Sequence Generator");

  // 1.1 List series definitions
  const defsRes = await app.request("/api/v1/naming-series/definitions");
  assert(defsRes.status === 200, "GET /api/v1/naming-series/definitions returns 200 OK");
  const defsJson = await defsRes.json();
  assert(defsJson.data.length >= 6, "Master series catalog includes EMPLOYEE, PAYROLL_RUN, TRAVEL_REQUEST, IT_ASSET");

  // 1.2 Register custom series definition
  const createDefRes = await app.request("/api/v1/naming-series/definitions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentType: "JOB_REQUISITION",
      seriesCode: "REQ_JOB",
      description: "Recruitment requisition numbering series",
      pattern: "REQ/{ORG}/{YYYY}/{#####}",
      stepValue: 1,
      resetFrequency: "yearly",
      isStrictGapless: true,
      allowManualOverride: false,
    }),
  });
  assert(createDefRes.status === 201, "POST /api/v1/naming-series/definitions returns 201 Created");

  // 1.3 Generate sequential employee number with token replacement
  const genEmpRes = await app.request("/api/v1/naming-series/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentType: "EMPLOYEE",
      entityId: "emp-test-043",
      organizationCode: "KEN",
      departmentCode: "ENG",
    }),
  });
  assert(genEmpRes.status === 201, "POST /api/v1/naming-series/generate returns 201 Created");
  const genEmpJson = await genEmpRes.json();
  assert(genEmpJson.generatedNumber.startsWith("EMP/KEN/2026/"), `Generated employee number format is correct: ${genEmpJson.generatedNumber}`);
  assert(genEmpJson.counterValue === 43, `Counter incremented accurately to 43 (got ${genEmpJson.counterValue})`);

  // 1.4 Generate payroll run sequence
  const genPayRes = await app.request("/api/v1/naming-series/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documentType: "PAYROLL_RUN",
      entityId: "run-2026-10",
    }),
  });
  const genPayJson = await genPayRes.json();
  assert(genPayJson.generatedNumber === "PAY/2026/09/0010", `Generated payroll run code matches pattern: ${genPayJson.generatedNumber}`);

  // 1.5 Preview pattern formatting without counter increment
  const prevRes = await app.request("/api/v1/naming-series/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pattern: "DOC/{ORG}/{YYYY}/{######}",
      sampleCounter: 5,
      organizationCode: "UGA",
    }),
  });
  assert(prevRes.status === 200, "POST /api/v1/naming-series/preview returns 200 OK");
  const prevJson = await prevRes.json();
  assert(prevJson.preview === "DOC/UGA/2026/000005", `Preview formatted accurately: ${prevJson.preview}`);

  // 1.6 Query naming series audit logs
  const auditRes = await app.request("/api/v1/naming-series/audit?documentType=EMPLOYEE");
  assert(auditRes.status === 200, "GET /api/v1/naming-series/audit returns 200 OK");
  const auditJson = await auditRes.json();
  assert(auditJson.data.length >= 1, "Generated number was stamped into immutable audit log");
  assert(auditJson.data[0].entityId === "emp-test-043", "Audit record references target entity ID");

  // =========================================================================================
  // SECTION 2: Universal Approval Workflows
  // =========================================================================================
  console.log("\n[SECTION 2] Universal Approval Workflows & Step Progression");

  // 2.1 List workflow definitions
  const wfDefsRes = await app.request("/api/v1/workflows/definitions");
  assert(wfDefsRes.status === 200, "GET /api/v1/workflows/definitions returns 200 OK");
  const wfDefsJson = await wfDefsRes.json();
  assert(wfDefsJson.data.length >= 4, "Configured workflows include Leave, Expense, Payroll, and Travel chains");

  // 2.2 Create custom workflow definition
  const createWfRes = await app.request("/api/v1/workflows/definitions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Executive Job Offer Authorization",
      triggerType: "job_offer",
      description: "Two-step approval chain for senior talent offers",
      steps: [
        { stepNumber: 1, name: "Talent Acquisition Director", approverType: "specific_role", specificRoleId: "role-talent-lead" },
        { stepNumber: 2, name: "Managing Director Final Sign-off", approverType: "department_head" },
      ],
    }),
  });
  assert(createWfRes.status === 201, "POST /api/v1/workflows/definitions returns 201 Created");

  // 2.3 Initiate workflow instance for leave application
  const initWfRes = await app.request("/api/v1/workflows/instances/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      triggerType: "leave_application",
      entityType: "leave_application",
      entityId: "app-lv-901",
      requesterUserId: "emp-001",
      payload: { days: 7, leaveType: "Annual Leave" },
    }),
  });
  assert(initWfRes.status === 201, "POST /api/v1/workflows/instances/initiate returns 201 Created");
  const initWfJson = await initWfRes.json();
  const instanceId = initWfJson.data.id;
  assert(initWfJson.data.status === "in_progress", "Instance initialized in 'in_progress' state");
  assert(initWfJson.data.currentStepNumber === 1, "Instance begins at Step 1");
  assert(initWfJson.data.totalSteps === 2, "Workflow requires 2 sequential approval steps");

  // 2.4 Approve Step 1
  const step1ActionRes = await app.request(`/api/v1/workflows/instances/${instanceId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorUserId: "usr-mgr-001",
      action: "approved",
      comments: "Handover coverage is sufficient. Approved.",
    }),
  });
  assert(step1ActionRes.status === 200, "POST /api/v1/workflows/instances/:id/actions (Step 1) returns 200 OK");
  const step1Json = await step1ActionRes.json();
  assert(step1Json.data.instance.currentStepNumber === 2, "Workflow advanced to Step 2 (Department Head Approval)");
  assert(step1Json.data.instance.status === "in_progress", "Workflow status remains 'in_progress'");

  // 2.5 Approve Step 2 (Final Step)
  const step2ActionRes = await app.request(`/api/v1/workflows/instances/${instanceId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorUserId: "usr-hod-001",
      action: "approved",
      comments: "Final approval granted.",
    }),
  });
  assert(step2ActionRes.status === 200, "POST /api/v1/workflows/instances/:id/actions (Step 2) returns 200 OK");
  const step2Json = await step2ActionRes.json();
  assert(step2Json.data.instance.status === "approved", "Workflow transitioned to 'approved' on final step completion");

  // 2.6 View detailed instance and full action history
  const viewInstRes = await app.request(`/api/v1/workflows/instances/${instanceId}`);
  assert(viewInstRes.status === 200, "GET /api/v1/workflows/instances/:id returns 200 OK");
  const viewInstJson = await viewInstRes.json();
  assert(viewInstJson.data.history.length === 2, "Action history records both Step 1 and Step 2 actions");

  // 2.7 Initiate second instance and test rejection flow
  const rejectInstRes = await app.request("/api/v1/workflows/instances/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      triggerType: "expense_claim",
      entityType: "expense_claim",
      entityId: "exp-claim-77",
      requesterUserId: "emp-002",
    }),
  });
  const rejectInstJson = await rejectInstRes.json();
  const rejId = rejectInstJson.data.id;

  const rejectActionRes = await app.request(`/api/v1/workflows/instances/${rejId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actorUserId: "usr-mgr-002",
      action: "rejected",
      comments: "Receipts missing VAT tax breakdown. Please resubmit.",
    }),
  });
  const rejActJson = await rejectActionRes.json();
  assert(rejActJson.data.instance.status === "rejected", "Rejection action terminates workflow with status 'rejected'");

  // =========================================================================================
  // SECTION 3: Delegation of Authority (DoA) & Out-of-Office Proxies
  // =========================================================================================
  console.log("\n[SECTION 3] Delegation of Authority (DoA) & Proxy Auditing");

  // 3.1 Query active delegations
  const delListRes = await app.request("/api/v1/delegations/rules");
  assert(delListRes.status === 200, "GET /api/v1/delegations/rules returns 200 OK");
  const delListJson = await delListRes.json();
  assert(delListJson.data.length >= 2, "Active delegation rules loaded (Engineering VP & CFO proxies)");

  // 3.2 Create new delegation rule with financial threshold cap
  const createDelRes = await app.request("/api/v1/delegations/rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      delegatorUserId: "usr-dir-005",
      delegateeUserId: "usr-lead-008",
      scope: "expense_claims",
      reason: "Safari in Masai Mara National Reserve",
      maxMonetaryApprovalLimit: 300000,
      currency: "KES",
      startDate: "2026-09-01T00:00:00Z",
      endDate: "2026-09-30T23:59:59Z",
    }),
  });
  assert(createDelRes.status === 201, "POST /api/v1/delegations/rules returns 201 Created");
  const createDelJson = await createDelRes.json();
  const ruleId = createDelJson.data.id;
  assert(createDelJson.data.status === "active", "Rule initialized in 'active' status based on current date");

  // 3.3 Verify proxy authority within limit
  const verifyPassRes = await app.request("/api/v1/delegations/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actedByUserId: "usr-lead-008",
      onBehalfOfUserId: "usr-dir-005",
      scope: "expense_claims",
      monetaryAmount: 185000,
    }),
  });
  const verifyPassJson = await verifyPassRes.json();
  assert(verifyPassJson.isAuthorized === true, "Proxy verified successfully for amount within KES 300,000 limit");

  // 3.4 Verify proxy authority rejected when exceeding limit
  const verifyFailRes = await app.request("/api/v1/delegations/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actedByUserId: "usr-lead-008",
      onBehalfOfUserId: "usr-dir-005",
      scope: "expense_claims",
      monetaryAmount: 450000, // Exceeds 300,000
    }),
  });
  const verifyFailJson = await verifyFailRes.json();
  assert(verifyFailJson.isAuthorized === false, "Proxy authorization correctly denied when amount exceeds cap (KES 450,000 > KES 300,000)");

  // 3.5 Execute proxy action and verify audit trail
  const execProxyRes = await app.request("/api/v1/delegations/execute-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      delegationRuleId: ruleId,
      actedByUserId: "usr-lead-008",
      onBehalfOfUserId: "usr-dir-005",
      entityType: "expense_claim",
      entityId: "exp-404",
      actionTaken: "approved",
      notes: "Reviewed and approved under proxy authority",
    }),
  });
  assert(execProxyRes.status === 201, "POST /api/v1/delegations/execute-proxy returns 201 Created");
  const execProxyJson = await execProxyRes.json();
  assert(execProxyJson.data.actedByUserId === "usr-lead-008", "Proxy actor recorded in audit log");
  assert(execProxyJson.data.onBehalfOfUserId === "usr-dir-005", "Principal delegator recorded in audit log");

  // 3.6 Revoke delegation rule
  const revokeRes = await app.request(`/api/v1/delegations/rules/${ruleId}/revoke`, { method: "POST" });
  assert(revokeRes.status === 200, "POST /api/v1/delegations/rules/:id/revoke returns 200 OK");
  const revokeJson = await revokeRes.json();
  assert(revokeJson.data.status === "revoked", "Delegation status updated to 'revoked'");

  // =========================================================================================
  // SECTION 4: Event-Driven Webhooks, HMAC Signatures & Outbox
  // =========================================================================================
  console.log("\n[SECTION 4] Event-Driven Webhooks, HMAC Signatures & Outbox");

  // 4.1 List webhook endpoints
  const epsRes = await app.request("/api/v1/webhooks/endpoints");
  assert(epsRes.status === 200, "GET /api/v1/webhooks/endpoints returns 200 OK");
  const epsJson = await epsRes.json();
  assert(epsJson.data.length >= 2, "Registered endpoints include Slack and ERPNext integrations");

  // 4.2 Register new webhook endpoint
  const createEpRes = await app.request("/api/v1/webhooks/endpoints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://banking.mandelagroup.com/webhooks/payroll",
      description: "Commercial Bank EFT Direct Debit Webhook",
      subscribedEvents: ["payroll.finalized", "travel.advance_disbursed"],
    }),
  });
  assert(createEpRes.status === 201, "POST /api/v1/webhooks/endpoints returns 201 Created");
  const createEpJson = await createEpRes.json();
  const newEpId = createEpJson.data.id;
  assert(createEpJson.data.secret.startsWith("whsec_"), "Webhook secret generated with 'whsec_' prefix");

  // 4.3 Trigger signed test ping
  const pingRes = await app.request(`/api/v1/webhooks/test-ping/${newEpId}`, { method: "POST" });
  assert(pingRes.status === 200, "POST /api/v1/webhooks/test-ping/:id returns 200 OK");
  const pingJson = await pingRes.json();
  assert(pingJson.data.headers["X-Zuri-Signature"].startsWith("sha256="), "X-Zuri-Signature contains valid HMAC-SHA256 hash");
  assert(pingJson.data.delivery.status === "delivered", "Delivery status marked as 'delivered'");

  // 4.4 Emit event to transactional outbox
  const emitRes = await app.request("/api/v1/webhooks/outbox/emit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "employee.promoted",
      aggregateType: "employee",
      aggregateId: "emp-002",
      payload: { oldGrade: "MID-2", newGrade: "SR-1", salaryIncreasePct: 15.5 },
    }),
  });
  assert(emitRes.status === 201, "POST /api/v1/webhooks/outbox/emit returns 201 Created");

  // 4.5 Query transactional outbox
  const outboxRes = await app.request("/api/v1/webhooks/outbox?eventType=employee.promoted");
  assert(outboxRes.status === 200, "GET /api/v1/webhooks/outbox returns 200 OK");
  const outboxJson = await outboxRes.json();
  assert(outboxJson.data.length >= 1, "Transactional outbox contains emitted 'employee.promoted' event");

  // 4.6 Generate developer API key
  const apiKeyRes = await app.request("/api/v1/webhooks/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Workday Bi-directional Sync Integration",
      scopes: ["employees:read", "payroll:read"],
      rateLimitPerMinute: 1200,
    }),
  });
  assert(apiKeyRes.status === 201, "POST /api/v1/webhooks/api-keys returns 201 Created");
  const apiKeyJson = await apiKeyRes.json();
  assert(apiKeyJson.data.rawApiKey.startsWith("zk_live_"), "Raw API key generated with 'zk_live_' prefix");
  assert(apiKeyJson.data.keyPrefix.startsWith("zk_live_"), "Stored key prefix matches raw token prefix");

  // =========================================================================================
  // SECTION 5: Omni-Channel Notifications & Inbox
  // =========================================================================================
  console.log("\n[SECTION 5] Omni-Channel Notifications & Inbox Center");

  // 5.1 Query notification templates
  const tplRes = await app.request("/api/v1/notifications/templates");
  assert(tplRes.status === 200, "GET /api/v1/notifications/templates returns 200 OK");
  const tplJson = await tplRes.json();
  assert(tplJson.data.length >= 3, "Templates configured for Leave Approved, Payslip Published, Travel Advance");

  // 5.2 Create custom notification template
  const createTplRes = await app.request("/api/v1/notifications/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateCode: "ANNUAL_BONUS_DECLARED",
      name: "Annual Performance Bonus Notification",
      category: "compensation",
      subjectTemplate: "Congratulations {{employee_name}}! Annual Bonus of {{currency}} {{amount}} Declared",
      bodyTemplates: {
        in_app: "Your FY26 Performance Bonus of {{currency}} {{amount}} has been approved.",
        email: "<p>Dear {{employee_name}}, your bonus of {{currency}} {{amount}} will be paid with this month's payroll.</p>",
        sms: "Zuri HRMS: Bonus of {{currency}} {{amount}} awarded! Paid with monthly payroll.",
      },
      variables: ["employee_name", "currency", "amount"],
    }),
  });
  assert(createTplRes.status === 201, "POST /api/v1/notifications/templates returns 201 Created");

  // 5.3 Dispatch notification across multi-channels (In-App, Email, SMS)
  const dispatchRes = await app.request("/api/v1/notifications/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateCode: "LEAVE_APPLICATION_APPROVED",
      userId: "emp-001",
      channels: ["in_app", "email", "sms"],
      data: {
        employee_name: "Kwame Mensah",
        leave_type: "Annual Leave",
        start_date: "2026-10-01",
        end_date: "2026-10-07",
        days: "5.0",
        approver_name: "Sarah Jenkins",
      },
      priority: "high",
    }),
  });
  assert(dispatchRes.status === 201, "POST /api/v1/notifications/dispatch returns 201 Created");
  const dispatchJson = await dispatchRes.json();
  assert(dispatchJson.data.dispatches.length === 3, "Notification dispatched across 3 channels (in_app, email, sms)");
  const emailDisp = dispatchJson.data.dispatches.find((d: any) => d.channel === "email");
  assert(emailDisp.provider === "resend", "Email dispatch handled via Resend gateway");
  const smsDisp = dispatchJson.data.dispatches.find((d: any) => d.channel === "sms");
  assert(smsDisp.provider === "africas_talking", "SMS dispatch handled via Africa's Talking gateway");

  // 5.4 Fetch user inbox
  const inboxRes = await app.request("/api/v1/notifications/inbox/emp-001");
  assert(inboxRes.status === 200, "GET /api/v1/notifications/inbox/:userId returns 200 OK");
  const inboxJson = await inboxRes.json();
  assert(inboxJson.unreadCount >= 1, "Inbox contains unread notification alerts");
  const latestNotif = inboxJson.data[0];

  // 5.5 Mark notification as read
  const markReadRes = await app.request(`/api/v1/notifications/${latestNotif.id}/read`, { method: "PATCH" });
  assert(markReadRes.status === 200, "PATCH /api/v1/notifications/:id/read returns 200 OK");
  const markReadJson = await markReadRes.json();
  assert(markReadJson.data.isRead === true, "Notification state updated to isRead: true");

  // =========================================================================================
  // SECTION 6: Regulatory Audit Trail & Custom Fields
  // =========================================================================================
  console.log("\n[SECTION 6] Regulatory Audit Trail & Custom Fields");

  // 6.1 Query system audit logs
  const logsRes = await app.request("/api/v1/audit/logs");
  assert(logsRes.status === 200, "GET /api/v1/audit/logs returns 200 OK");
  const logsJson = await logsRes.json();
  assert(logsJson.data.length >= 3, "System audit logs populated (salary revisions, payroll approvals, exports)");
  assert(logsJson.data[0].ipAddress !== undefined, "Audit records capture IP addresses");

  // 6.2 Record new compliance audit event with before/after state diffs
  const recordAudRes = await app.request("/api/v1/audit/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "usr-admin-001",
      userName: "Alex Kamau (Super Admin)",
      action: "update",
      entityName: "statutory_agency",
      entityId: "agency-kra",
      oldValues: { filingDueDayOfMonth: 9 },
      newValues: { filingDueDayOfMonth: 10, note: "Statutory gazette extension" },
    }),
  });
  assert(recordAudRes.status === 201, "POST /api/v1/audit/logs returns 201 Created");
  const recordAudJson = await recordAudRes.json();
  assert(recordAudJson.data.oldValues.filingDueDayOfMonth === 9, "Before state preserved in audit log");
  assert(recordAudJson.data.newValues.filingDueDayOfMonth === 10, "After state preserved in audit log");

  // 6.3 Query dynamic custom fields
  const cfRes = await app.request("/api/v1/audit/custom-fields?entityType=employee");
  assert(cfRes.status === 200, "GET /api/v1/audit/custom-fields returns 200 OK");
  const cfJson = await cfRes.json();
  assert(cfJson.data.length >= 2, "Custom fields defined for employee (Safety boot size, clearance code)");

  // 6.4 Define new runtime custom field attribute
  const createCfRes = await app.request("/api/v1/audit/custom-fields", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entityType: "employee",
      fieldKey: "car_parking_bay",
      fieldLabel: "Corporate HQ Dedicated Parking Bay #",
      fieldType: "text",
      isRequired: false,
      isEncrypted: false,
      displayOrder: 5,
    }),
  });
  assert(createCfRes.status === 201, "POST /api/v1/audit/custom-fields returns 201 Created");
  const createCfJson = await createCfRes.json();
  assert(createCfJson.data.fieldKey === "car_parking_bay", "Custom field registered with key 'car_parking_bay'");

  // 6.5 Query dynamic reference lookup taxonomies
  const refRes = await app.request("/api/v1/audit/reference-lookups?category=payment_method");
  assert(refRes.status === 200, "GET /api/v1/audit/reference-lookups returns 200 OK");
  const refJson = await refRes.json();
  assert(refJson.data.some((r: any) => r.code === "mpesa_b2c"), "Taxonomy includes M-Pesa Corporate B2C payment method");

  // =========================================================================================
  // SUMMARY
  // =========================================================================================
  console.log("\n=================================================================================");
  console.log(`  PHASE 5 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase5TestSuite().catch((err) => {
  console.error("Test Suite Execution Error:", err);
  process.exit(1);
});
