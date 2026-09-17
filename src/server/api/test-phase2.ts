/**
 * =========================================================================================
 * PHASE 2 AUTOMATED INTEGRATION TEST SUITE: ATTENDANCE, GEOFENCING & LEAVE MANAGEMENT
 * =========================================================================================
 * Comprehensive test coverage verifying:
 * 1. Mobile Geofenced Clock-in/out (Haversine algorithm, valid punch vs. out-of-boundary breach)
 * 2. Raw attendance logging & biometric capture
 * 3. Daily timesheet engine (grace period, late minutes, early departure, 1.5x regular vs. 2.0x holiday OT)
 * 4. Overtime request submission, cost estimation & manager approval workflows
 * 5. 24/7 continuous industrial rotation patterns (Continental 3-shift 28-day, Mining FIFO 14/14, Crews)
 * 6. Leave types, policies & live employee balance summaries
 * 7. Universal Working Calendar & Statutory Public Holiday leave deduction engine (exemption of weekends & holidays)
 * 8. Leave approval workflow and double-entry immutable ledger synchronization
 * 9. Leave encashment calculation to taxable salary earnings
 * 10. Corporate mandatory block leave / Christmas shutdown simulation & 1-click batch execution
 * 11. Advance carryover extension requests (overcoming 5-day standard policy cap)
 * 12. Full point-in-time immutable leave ledger audit trail
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
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName}`, details || "");
  }
}

async function runPhase2Tests() {
  console.log("\n=================================================================================");
  console.log("  STARTING PHASE 2: ATTENDANCE, GEOFENCING, ROTATIONS & LEAVE ENGINE TEST SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: Geofenced Mobile Clock-in / Out
  console.log("\x1b[1m[SECTION 1] Geofenced Mobile Clock-in / Out (Haversine Algorithm)\x1b[0m");
  {
    // 1a. Clock in inside Nairobi HQ geofence
    const validClockRes = await app.request("/api/v1/attendance/clock-in-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-001",
        clockType: "clock_in",
        latitude: -1.292066,
        longitude: 36.821946,
        selfiePhotoUrl: "https://storage.zuri.africa/selfies/emp001.jpg",
        deviceIdentifier: "iPhone15,2",
      }),
    });
    const validClockData = await validClockRes.json();
    assert(validClockRes.status === 201, "POST /api/v1/attendance/clock-in-out returns 201 Created");
    assert(validClockData.data.isInsideGeofence === true, "Valid punch detected inside Nairobi HQ geofence");
    assert(validClockData.data.distanceMeters <= 5, "Distance calculated accurately as <= 5 meters");

    // 1b. Clock in outside geofence (breach detected)
    const breachClockRes = await app.request("/api/v1/attendance/clock-in-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        clockType: "clock_in",
        latitude: -1.270000, // ~2.8km away from HQ
        longitude: 36.800000,
        deviceIdentifier: "Samsung-Galaxy",
      }),
    });
    const breachClockData = await breachClockRes.json();
    assert(breachClockRes.status === 201, "POST /api/v1/attendance/clock-in-out records clock even on breach");
    assert(breachClockData.data.isInsideGeofence === false, "Out-of-geofence breach flagged correctly");
    assert(breachClockData.data.distanceMeters > 1000, "Distance calculated as > 1,000 meters from HQ");

    // 1c. List attendance logs
    const logsRes = await app.request("/api/v1/attendance/logs?employeeId=emp-001");
    const logsData = await logsRes.json();
    assert(logsRes.status === 200, "GET /api/v1/attendance/logs returns 200 OK");
    assert(logsData.count >= 1, "Clock events listed for employee emp-001");

    // 1d. Param route for logs
    const empLogsRes = await app.request("/api/v1/attendance/logs/emp-001");
    const empLogsData = await empLogsRes.json();
    assert(empLogsRes.status === 200, "GET /api/v1/attendance/logs/:employeeId returns 200 OK");
    assert(empLogsData.data[0].employeeId === "emp-001", "Logs filtered by route param employeeId");
  }

  // SECTION 2: Daily Timesheet Calculation Engine
  console.log("\n\x1b[1m[SECTION 2] Timesheets, Late Arrivals & Statutory Overtime Rates\x1b[0m");
  {
    // 2a. Standard Day Timesheet (08:00 to 17:00, 60m break -> 8h regular, 0h overtime, on time)
    const tsStandardRes = await app.request("/api/v1/attendance/timesheets/calculate-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-001",
        date: "2026-09-17",
        firstClockIn: "2026-09-17T08:00:00Z",
        lastClockOut: "2026-09-17T17:00:00Z",
        shiftTemplateId: "shift-day-standard",
        isRestDayOrHoliday: false,
      }),
    });
    const tsStandardData = await tsStandardRes.json();
    assert(tsStandardRes.status === 200, "POST /api/v1/attendance/timesheets/calculate-day returns 200 OK");
    assert(tsStandardData.data.regularHours === 8.0, "Regular hours computed as 8.0");
    assert(tsStandardData.data.overtimeHours === 0.0, "Overtime hours computed as 0.0");
    assert(tsStandardData.data.lateMinutes === 0, "Late minutes computed as 0");
    assert(tsStandardData.data.status === "present", "Status marked as 'present'");

    // 2b. Late arrival and overtime day (08:25 to 19:30 -> 25 min late, 8.0 reg, 2.42 overtime)
    const tsLateRes = await app.request("/api/v1/attendance/timesheets/calculate-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        date: "2026-09-17",
        firstClockIn: "2026-09-17T08:25:00Z",
        lastClockOut: "2026-09-17T19:30:00Z",
        shiftTemplateId: "shift-day-standard",
        isRestDayOrHoliday: false,
      }),
    });
    const tsLateData = await tsLateRes.json();
    assert(tsLateData.data.lateMinutes === 25, "Late arrival computed as 25 minutes (exceeding 15m grace period)");
    assert(tsLateData.data.status === "late", "Attendance status flagged as 'late'");
    assert(tsLateData.data.overtimeHours > 2.0, "Overtime calculated for hours worked past 17:00");
    assert(tsLateData.data.overtimeRateMultiplier === 1.5, "Standard weekday overtime multiplier is 1.5x");

    // 2c. Statutory Holiday / Rest Day Timesheet (100% overtime at 2.0x Kenyan statutory rate)
    const tsHolidayRes = await app.request("/api/v1/attendance/timesheets/calculate-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-003",
        date: "2026-10-20", // Mashujaa Day
        firstClockIn: "2026-10-20T08:00:00Z",
        lastClockOut: "2026-10-20T16:00:00Z",
        shiftTemplateId: "shift-day-standard",
        isRestDayOrHoliday: true,
      }),
    });
    const tsHolidayData = await tsHolidayRes.json();
    assert(tsHolidayData.data.regularHours === 0.0, "Holiday shift regular hours is 0.0 (all hours are premium overtime)");
    assert(tsHolidayData.data.overtimeRateMultiplier === 2.0, "Kenyan statutory holiday/rest day multiplier is 2.0x");
    assert(tsHolidayData.data.overtimeHours === 7.0, "Net 7.0 hours counted at 2.0x overtime rate");
  }

  // SECTION 3: Overtime Workflow (Application & Approval)
  console.log("\n\x1b[1m[SECTION 3] Overtime Application & Line Manager Approval Workflow\x1b[0m");
  {
    // 3a. Submit overtime application
    const otApplyRes = await app.request("/api/v1/attendance/overtime/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        date: "2026-09-17",
        requestedHours: 3.0,
        reason: "Emergency network switch configuration and fiber cut repair",
        isRestDayOrHoliday: false,
      }),
    });
    const otApplyData = await otApplyRes.json();
    assert(otApplyRes.status === 201, "POST /api/v1/attendance/overtime/apply returns 201 Created");
    assert(otApplyData.data.multiplier === 1.5, "1.5x overtime multiplier applied");
    assert(otApplyData.data.status === "pending", "Status is initially 'pending'");

    const createdOtId = otApplyData.data.id;

    // 3b. List overtime requests
    const otListRes = await app.request("/api/v1/attendance/overtime");
    const otListData = await otListRes.json();
    assert(otListRes.status === 200, "GET /api/v1/attendance/overtime returns 200 OK");
    assert(otListData.count >= 2, "Overtime requests listed");

    // 3c. Manager approves overtime
    const otApproveRes = await app.request(`/api/v1/attendance/overtime/${createdOtId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvedHours: 3.0,
        notes: "Verified emergency network repair ticket",
      }),
    });
    const otApproveData = await otApproveRes.json();
    assert(otApproveRes.status === 200, "POST /api/v1/attendance/overtime/:id/approve returns 200 OK");
    assert(otApproveData.data.status === "approved", "Overtime transitioned to 'approved' status");
    assert(otApproveData.data.approvedHours === 3.0, "Approved hours stamped correctly");
  }

  // SECTION 4: 24/7 Continuous Shift Rosters & Mining Patterns
  console.log("\n\x1b[1m[SECTION 4] 24/7 Continuous Shift Rotations & Heavy Industry Rostering\x1b[0m");
  {
    // 4a. Shift templates
    const stRes = await app.request("/api/v1/attendance/shifts/templates");
    const stData = await stRes.json();
    assert(stRes.status === 200, "GET /api/v1/attendance/shifts/templates returns 200 OK");
    assert(stData.count >= 4, "Standard templates include Day, Evening, Night & 12h Mining shifts");

    // 4b. Continuous rotation patterns
    const rotRes = await app.request("/api/v1/attendance/shifts/rotations");
    const rotData = await rotRes.json();
    assert(rotRes.status === 200, "GET /api/v1/attendance/shifts/rotations returns 200 OK");
    const continental = rotData.data.find((r: any) => r.code === "SHIFT-CONT-247");
    const miningFifo = rotData.data.find((r: any) => r.code === "SHIFT-FIFO-1414");
    assert(continental.cycleLengthDays === 28, "Continental 3-shift pattern has 28-day cycle");
    assert(continental.differentialMultipliers.nightShift === 1.25, "Night shift differential multiplier is 1.25x");
    assert(miningFifo.hazardAllowanceDailyAmount === 3500.0, "Mining FIFO includes KES 3,500 daily hazard allowance");

    // 4c. Crew rosters
    const crewRes = await app.request("/api/v1/attendance/shifts/crews");
    const crewData = await crewRes.json();
    assert(crewRes.status === 200, "GET /api/v1/attendance/shifts/crews returns 200 OK");
    assert(crewData.count === 4, "4 rotating crews configured (Crew A, B, C, D)");

    // 4d. Assign worker to crew
    const assignCrewRes = await app.request("/api/v1/attendance/shifts/crews/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-005",
        crewCode: "CREW-A",
      }),
    });
    const assignCrewData = await assignCrewRes.json();
    assert(assignCrewRes.status === 200, "POST /api/v1/attendance/shifts/crews/assign returns 200 OK");
    assert(assignCrewData.data.crewCode === "CREW-A", "Worker assigned to Crew A with fatigue monitoring");
  }

  // SECTION 5: Enterprise Leave Types, Policies & Balances
  console.log("\n\x1b[1m[SECTION 5] Statutory Leave Types, Policies & Live Employee Balances\x1b[0m");
  {
    // 5a. Leave types
    const ltRes = await app.request("/api/v1/leave/types");
    const ltData = await ltRes.json();
    assert(ltRes.status === 200, "GET /api/v1/leave/types returns 200 OK");
    assert(ltData.count >= 5, "Statutory leave types listed (Annual, Sick, Maternity, Paternity, Compassionate)");

    // 5b. Leave policies
    const polRes = await app.request("/api/v1/leave/policies");
    const polData = await polRes.json();
    assert(polRes.status === 200, "GET /api/v1/leave/policies returns 200 OK");
    const annualPol = polData.data.find((p: any) => p.leaveTypeCode === "ANNUAL");
    assert(annualPol.maxCarryoverDays === 5.0, "Annual leave policy enforces 5.0 days standard carryover cap");
    assert(annualPol.carryoverExpiryMonths === 3, "Carryover days expire in 3 months (March 31)");

    // 5c. Live employee balances
    const balRes = await app.request("/api/v1/leave/balances/emp-001");
    const balData = await balRes.json();
    assert(balRes.status === 200, "GET /api/v1/leave/balances/:employeeId returns 200 OK");
    const annualBal = balData.data.find((b: any) => b.leaveTypeCode === "ANNUAL");
    assert(annualBal.allocatedDays === 30.0, "Executive allocated 30.0 days annual leave");
    assert(annualBal.remainingDays === 27.0, "Executive remaining leave balance is 27.0 days");
  }

  // SECTION 6: Leave Applications & Calendar Holiday Exemption Engine
  console.log("\n\x1b[1m[SECTION 6] Leave Application with Working Calendar & Holiday Exemption\x1b[0m");
  {
    // 6a. Apply for leave spanning weekend and Jamhuri Day (Dec 12 holiday falls on Saturday, observed)
    // From 2026-12-10 (Thursday) to 2026-12-16 (Wednesday):
    // Total calendar days = 7 days (Thu 10, Fri 11, Sat 12, Sun 13, Mon 14, Tue 15, Wed 16)
    // Working days = Thu, Fri, Mon, Tue, Wed = 5 working days (Sat & Sun exempted)
    const applyRes = await app.request("/api/v1/leave/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-001",
        leaveTypeId: "lt-annual",
        startDate: "2026-12-10",
        endDate: "2026-12-16",
        reason: "Year-end family leave and recuperation",
      }),
    });
    const applyData = await applyRes.json();
    assert(applyRes.status === 201, "POST /api/v1/leave/apply returns 201 Created");
    assert(applyData.data.totalCalendarDays === 7, "Calendar calculates total span as 7 days");
    assert(applyData.data.weekendsExempted === 2, "Calendar engine automatically exempts 2 weekend days");
    assert(applyData.data.statutoryDaysDeducted === 5.0, "Net deduction is strictly 5.0 working days");

    const createdAppId = applyData.data.id;

    // 6b. Insufficient balance test
    const failRes = await app.request("/api/v1/leave/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        leaveTypeId: "lt-annual",
        startDate: "2026-10-01",
        endDate: "2026-11-20", // 37 working days, but remaining is only 21
        reason: "Excessive unearned leave attempt",
      }),
    });
    assert(failRes.status === 400, "POST /api/v1/leave/apply rejects application exceeding balance (400 Bad Request)");

    // 6c. Approve leave application & verify immutable ledger synchronization
    const approveRes = await app.request(`/api/v1/leave/applications/${createdAppId}/approve`, {
      method: "POST",
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200, "POST /api/v1/leave/applications/:id/approve returns 200 OK");
    assert(approveData.data.application.status === "approved", "Leave application status changed to 'approved'");
    assert(approveData.data.ledgerEntry.transactionType === "application_debit", "Immutable ledger entry created as 'application_debit'");
    assert(approveData.data.ledgerEntry.days === -5.0, "Ledger debited -5.0 days");
    assert(approveData.data.ledgerEntry.balanceAfter === 22.0, "Point-in-time balance adjusted to 22.0 days (27.0 - 5.0)");
  }

  // SECTION 7: Leave Encashment (Monetization of Leave to Cash)
  console.log("\n\x1b[1m[SECTION 7] Leave Encashment & Payroll Cash Conversion\x1b[0m");
  {
    // 7a. Submit encashment for 5 days with monthly basic salary KES 420,000
    // Daily rate = 420,000 / 26 = 16,153.85; 5 days = 80,769.23
    const encashRes = await app.request("/api/v1/leave/encashment/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-002",
        leaveTypeId: "lt-annual",
        daysToEncash: 5.0,
        basicSalary: 420000.0,
      }),
    });
    const encashData = await encashRes.json();
    assert(encashRes.status === 201, "POST /api/v1/leave/encashment/apply returns 201 Created");
    assert(encashData.data.daysToEncash === 5.0, "5.0 leave days requested for cash encashment");
    assert(encashData.data.statutoryDailyRate === 16153.85, "Statutory daily rate derived as KES 16,153.85 (basicSalary / 26)");
    assert(encashData.data.encashmentAmount === 80769.25, "Gross encashment payout calculated as KES 80,769.25");

    const encashId = encashData.data.id;

    // 7b. Approve encashment
    const approveEncashRes = await app.request(`/api/v1/leave/encashment/${encashId}/approve`, {
      method: "POST",
    });
    const approveEncashData = await approveEncashRes.json();
    assert(approveEncashRes.status === 200, "POST /api/v1/leave/encashment/:id/approve returns 200 OK");
    assert(approveEncashData.data.status === "approved", "Leave encashment approved and linked to payroll earnings");
  }

  // SECTION 8: Corporate Christmas Shutdown & Advance Carryover
  console.log("\n\x1b[1m[SECTION 8] Corporate Christmas Shutdown & Advance Carryover Exceptions\x1b[0m");
  {
    // 8a. Simulate corporate Christmas shutdown (Dec 24, 2026 to Jan 2, 2027)
    // Dec 24 (Thu) = 1 working day
    // Dec 25 (Fri) = Christmas Day (Holiday)
    // Dec 26 (Sat) = Boxing Day (Weekend/Holiday)
    // Dec 27 (Sun) = Weekend
    // Dec 28 (Mon) = 1 working day
    // Dec 29 (Tue) = 1 working day
    // Dec 30 (Wed) = 1 working day
    // Dec 31 (Thu) = 1 working day
    // Jan 01 (Fri) = New Year's Day (Holiday)
    // Jan 02 (Sat) = Weekend
    // Net working days to deduct = 5 working days (excluding 3 holidays & 2 weekends)
    const simRes = await app.request("/api/v1/leave/shutdowns/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "2026 Year-End Corporate Christmas Shutdown",
        startDate: "2026-12-24",
        endDate: "2027-01-02",
        leaveTypeId: "lt-annual",
      }),
    });
    const simData = await simRes.json();
    assert(simRes.status === 200, "POST /api/v1/leave/shutdowns/simulate returns 200 OK");
    assert(simData.data.totalEmployeesImpacted === 2150, "Full enterprise workforce in scope (2,150 employees)");
    assert(simData.data.statutoryHolidaysExempted >= 2, "Exempts statutory public holidays falling on working days (Christmas & New Year)");
    assert(simData.data.totalCalendarDays === 10, "10-day shutdown window simulated");

    // 8b. Execute 1-click corporate shutdown bulk debit
    const execRes = await app.request("/api/v1/leave/shutdowns/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "2026 Year-End Corporate Christmas Shutdown",
        startDate: "2026-12-24",
        endDate: "2027-01-02",
        leaveTypeId: "lt-annual",
      }),
    });
    const execData = await execRes.json();
    assert(execRes.status === 201, "POST /api/v1/leave/shutdowns/execute returns 201 Created");
    assert(execData.data.status === "executed", "Shutdown status set to 'executed'");
    assert(execData.data.totalDaysDeducted > 10000, "Over 10,000 leave days bulk debited across organization");

    // 8c. Advance Carryover Extension Request (Asking for 9 days carryover vs 5 days standard cap)
    const carryRes = await app.request("/api/v1/leave/carryover-exceptions/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: "emp-001",
        leaveTypeId: "lt-annual",
        fromYear: 2026,
        toYear: 2027,
        totalUnusedDaysAvailable: 9.0,
        requestedCarryoverDays: 9.0,
        utilizeBeforeDate: "2027-03-31",
        businessJustification: "Critical multi-country payroll deployment delayed leave utilization in Q4",
      }),
    });
    const carryData = await carryRes.json();
    assert(carryRes.status === 201, "POST /api/v1/leave/carryover-exceptions/apply returns 201 Created");
    assert(carryData.data.requestedCarryoverDays === 9.0, "9.0 days carryover requested (exceeding standard 5-day cap by 4 days)");
    assert(carryData.data.status === "pending", "Carryover exception initially pending approval");

    const carryId = carryData.data.id;

    // 8d. Approve Carryover Extension
    const approveCarryRes = await app.request(`/api/v1/leave/carryover-exceptions/${carryId}/approve`, {
      method: "POST",
    });
    const approveCarryData = await approveCarryRes.json();
    assert(approveCarryRes.status === 200, "POST /api/v1/leave/carryover-exceptions/:id/approve returns 200 OK");
    assert(approveCarryData.data.status === "approved", "Carryover exception approved with agreed Q1 utilization deadline");
  }

  // SECTION 9: Immutable Double-Entry Leave Ledger Audit Trail
  console.log("\n\x1b[1m[SECTION 9] Immutable Double-Entry Leave Transaction Ledger\x1b[0m");
  {
    const ledgerRes = await app.request("/api/v1/leave/ledger/emp-001");
    const ledgerData = await ledgerRes.json();
    assert(ledgerRes.status === 200, "GET /api/v1/leave/ledger/:employeeId returns 200 OK");
    assert(ledgerData.count >= 4, "Complete point-in-time double-entry ledger entries returned");

    const transactionTypes = ledgerData.data.map((e: any) => e.transactionType);
    assert(transactionTypes.includes("carryover_credit"), "Ledger tracks 'carryover_credit'");
    assert(transactionTypes.includes("monthly_accrual"), "Ledger tracks 'monthly_accrual'");
    assert(transactionTypes.includes("application_debit"), "Ledger tracks 'application_debit'");
    assert(transactionTypes.includes("company_shutdown_debit"), "Ledger tracks 'company_shutdown_debit'");
  }

  // FINAL SUMMARY
  console.log("\n=================================================================================");
  console.log(`  PHASE 2 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("=================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error("Phase 2 test execution failed with error:", err);
  process.exit(1);
});
