/**
 * =========================================================================================
 * COMPREHENSIVE FINAL SCHEMA WIRING & DOMESTIC MOBILITY TEST SUITE
 * =========================================================================================
 * Tests:
 * 1. Domestic Station Relocation & Transfers (Kisumu Depot -> Nairobi Plant)
 * 2. Geographic Administrative Hierarchy & Work Locations (Depots, Plants & Geofences)
 * 3. Multi-Currency FX Rates & Pan-African Localization (Kiswahili, French)
 * 4. Corporate Calendars, Events & Gazetted Public Holidays
 * 5. Enterprise Integration Mesh & Mobile Money Payment Gateways
 * 6. Deep Schema Wiring: Pay Groups, Tax Reliefs, GL Accounts, Matrix Reporting & RBAC Roles
 * =========================================================================================
 */

import { app } from "./app";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    failedCount++;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const url = `http://localhost${path}`;
  const defaultHeaders: Record<string, string> = {
    "X-Tenant-ID": "00000000-0000-0000-0000-000000000001",
    "X-Organization-ID": "org-mandela-kenya",
    "X-User-ID": "usr-admin-01",
    "X-User-Role": "super_admin",
    "Content-Type": "application/json",
  };

  const mergedHeaders = { ...defaultHeaders, ...(options.headers as Record<string, string>) };
  const res = await app.request(url, { ...options, headers: mergedHeaders });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function runSuite() {
  console.log("\n=================================================================================");
  console.log("  STARTING COMPREHENSIVE FINAL SCHEMA WIRING & DOMESTIC MOBILITY SUITE");
  console.log("=================================================================================\n");

  // SECTION 1: Domestic Station Transfers & Relocation Support
  console.log("[SECTION 1] Domestic Station Relocation & Support (Kisumu Depot -> Nairobi Plant)");
  {
    const listRes = await request("/api/v1/mobility/transfers/domestic");
    assert(listRes.status === 200, "GET /api/v1/mobility/transfers/domestic returns 200 OK");
    assert(listRes.data.data.length >= 1, "Domestic transfers list includes seeded transfer");
    assert(listRes.data.data[0].originLocationName === "Kisumu Lake Basin Depot", "Origin station is Kisumu Depot");

    const createRes = await request("/api/v1/mobility/transfers/domestic", {
      method: "POST",
      body: JSON.stringify({
        employeeId: "emp-015",
        employeeName: "Brian Kiprono",
        originLocationId: "loc-ksm-depot",
        originLocationName: "Kisumu Lake Basin Depot",
        destinationLocationId: "loc-nrb-plant",
        destinationLocationName: "Nairobi Industrial Plant",
        transferReason: "operational_need",
        effectiveDate: "2026-10-15",
        reportingDate: "2026-10-20",
        handoverDate: "2026-10-14",
        relocationPackage: {
          disturbanceAllowance: 180000,
          haulageAssistance: 90000,
          transitLodgingDays: 30,
          transitLodgingDailyRate: 6000,
          relocationLeaveDays: 5,
          stationHardshipDifferential: -10000,
          currency: "KES",
        },
        notes: "Transferred to oversee new high-capacity bottling conveyor at Nairobi Industrial Plant.",
      }),
    });
    assert(createRes.status === 201, "POST /api/v1/mobility/transfers/domestic returns 201 Created");
    assert(createRes.data.data.transferNumber.startsWith("TRF-"), "Generated sequential transfer order number");
    assert(createRes.data.data.relocationPackage.transitLodgingTotal === 180000, "Transit lodging total calculated as KES 180,000 (30 days * 6,000)");
    assert(createRes.data.data.relocationPackage.totalRelocationSupport === 450000, "Total relocation package is KES 450,000 (180k disturbance + 90k haulage + 180k lodging)");

    const transferId = createRes.data.data.id;
    const execRes = await request(`/api/v1/mobility/transfers/domestic/${transferId}/execute`, {
      method: "POST",
    });
    assert(execRes.status === 200, "POST /api/v1/mobility/transfers/domestic/:id/execute returns 200 OK");
    assert(execRes.data.data.transfer.status === "completed", "Transfer status transitioned to completed");
    assert(execRes.data.data.reboundGeofence.locationName === "Nairobi Industrial Plant", "Attendance geofence successfully rebound to Nairobi Plant");
    assert(execRes.data.data.lifecycleEvent.eventType === "transfer", "Lifecycle event logged with transfer type");
  }

  // SECTION 2: Geographic Administrative Hierarchy & Work Locations
  console.log("\n[SECTION 2] Geographic Administrative Hierarchy & Work Locations");
  {
    const unitsRes = await request("/api/v1/geo-hierarchy/units?countryCode=KEN");
    assert(unitsRes.status === 200, "GET /api/v1/geo-hierarchy/units returns 200 OK");
    assert(unitsRes.data.data.some((u: any) => u.code === "KE-47"), "Includes Nairobi County (KE-47)");
    assert(unitsRes.data.data.some((u: any) => u.code === "KE-42"), "Includes Kisumu County (KE-42)");

    const treeRes = await request("/api/v1/geo-hierarchy/units/tree?countryCode=KEN");
    assert(treeRes.status === 200, "GET /api/v1/geo-hierarchy/units/tree returns 200 OK");
    assert(treeRes.data.tree.length >= 1, "Spatial tree returned with root node");
    assert(treeRes.data.tree[0].children.length >= 2, "Root node has children counties");

    const createUnitRes = await request("/api/v1/geo-hierarchy/units", {
      method: "POST",
      body: JSON.stringify({
        countryCode: "KEN",
        level: 2,
        divisionType: "county",
        name: "Nakuru County",
        code: "KE-32",
        postalAbbreviation: "NKU",
        defaultCurrency: "KES",
        defaultTimezone: "Africa/Nairobi",
        minimumWageMonthlyRate: 17200.0,
      }),
    });
    assert(createUnitRes.status === 201, "POST /api/v1/geo-hierarchy/units returns 201 Created");

    const locsRes = await request("/api/v1/geo-hierarchy/work-locations");
    assert(locsRes.status === 200, "GET /api/v1/geo-hierarchy/work-locations returns 200 OK");
    assert(locsRes.data.data.some((l: any) => l.code === "DEP-KSM-01"), "Includes Kisumu Lake Basin Depot");
    assert(locsRes.data.data.some((l: any) => l.code === "PLT-NRB-02"), "Includes Nairobi Industrial Plant");

    const createLocRes = await request("/api/v1/geo-hierarchy/work-locations", {
      method: "POST",
      body: JSON.stringify({
        name: "Eldoret Grain Processing Plant",
        code: "PLT-ELD-01",
        locationType: "plant",
        addressLine1: "Uganda Road, Industrial Area",
        cityOrTown: "Eldoret",
        countryCode: "KEN",
        latitude: 0.514277,
        longitude: 35.269779,
        geofenceRadiusMeters: 200,
        primaryContactName: "Faith Chemutai",
        primaryContactEmail: "fchemutai@mandela.co.ke",
      }),
    });
    assert(createLocRes.status === 201, "POST /api/v1/geo-hierarchy/work-locations returns 201 Created");
    assert(createLocRes.data.data.geofenceRadiusMeters === 200, "Geofence radius registered as 200m");

    const getLocRes = await request("/api/v1/geo-hierarchy/work-locations/loc-ksm-depot");
    assert(getLocRes.status === 200, "GET /api/v1/geo-hierarchy/work-locations/:id returns 200 OK");
    assert(getLocRes.data.data.cityOrTown === "Kisumu", "Work location details match Kisumu");
  }

  // SECTION 3: Multi-Currency FX Rates & Pan-African Localization
  console.log("\n[SECTION 3] Multi-Currency FX Rates & Pan-African Localization");
  {
    const currRes = await request("/api/v1/localization/currencies");
    assert(currRes.status === 200, "GET /api/v1/localization/currencies returns 200 OK");
    assert(currRes.data.data.some((c: any) => c.code === "KES"), "KES currency supported");
    assert(currRes.data.data.some((c: any) => c.code === "UGX"), "UGX currency supported");
    assert(currRes.data.data.some((c: any) => c.code === "USD"), "USD currency supported");

    const fxRes = await request("/api/v1/localization/fx-rates");
    assert(fxRes.status === 200, "GET /api/v1/localization/fx-rates returns 200 OK");

    const convRes = await request("/api/v1/localization/fx-rates/convert", {
      method: "POST",
      body: JSON.stringify({
        amount: 1000,
        fromCurrency: "USD",
        toCurrency: "KES",
      }),
    });
    assert(convRes.status === 200, "POST /api/v1/localization/fx-rates/convert returns 200 OK");
    assert(convRes.data.convertedAmount === 129500, "USD 1,000 converted to KES 129,500 at 129.50 rate");

    const transRes = await request("/api/v1/localization/translations?languageCode=sw");
    assert(transRes.status === 200, "GET /api/v1/localization/translations returns 200 OK");
    assert(transRes.data.data.some((t: any) => t.translation === "Likizo ya Mwaka"), "Annual leave translated to Swahili");

    const addTransRes = await request("/api/v1/localization/translations", {
      method: "POST",
      body: JSON.stringify({
        entityType: "job_title",
        entityId: "desig-depot-sup",
        fieldName: "title",
        languageCode: "sw",
        translation: "Msimamizi wa Kituo cha Mafuta / Ghala",
      }),
    });
    assert(addTransRes.status === 201, "POST /api/v1/localization/translations returns 201 Created");
  }

  // SECTION 4: Corporate Calendars, Events & Gazetted Public Holidays
  console.log("\n[SECTION 4] Corporate Calendars, Events & Public Holidays");
  {
    const eventsRes = await request("/api/v1/calendars/events");
    assert(eventsRes.status === 200, "GET /api/v1/calendars/events returns 200 OK");
    assert(eventsRes.data.data.some((e: any) => e.eventType === "townhall"), "All-hands townhall listed");

    const createEvtRes = await request("/api/v1/calendars/events", {
      method: "POST",
      body: JSON.stringify({
        title: "Annual Operational Health & Safety (OHSA) Audit",
        eventType: "training",
        startDate: "2026-11-04T08:00:00.000Z",
        endDate: "2026-11-04T17:00:00.000Z",
        location: "All Depots & Plants",
        isMandatory: true,
      }),
    });
    assert(createEvtRes.status === 201, "POST /api/v1/calendars/events returns 201 Created");

    const calsRes = await request("/api/v1/calendars/working-calendars");
    assert(calsRes.status === 200, "GET /api/v1/calendars/working-calendars returns 200 OK");
    assert(calsRes.data.data.some((c: any) => c.standardWeeklyHours === 48), "Includes 48-hour manufacturing calendar");

    const holsRes = await request("/api/v1/calendars/public-holidays?countryCode=KEN");
    assert(holsRes.status === 200, "GET /api/v1/calendars/public-holidays returns 200 OK");
    assert(holsRes.data.data.some((h: any) => h.name === "Jamhuri Day"), "Includes Jamhuri Day (Dec 12)");
  }

  // SECTION 5: Enterprise Integration Mesh & Payment Gateways
  console.log("\n[SECTION 5] Enterprise Integration Mesh & Payment Gateways");
  {
    const connRes = await request("/api/v1/integrations/connectors");
    assert(connRes.status === 200, "GET /api/v1/integrations/connectors returns 200 OK");
    assert(connRes.data.data.some((c: any) => c.erpSystem === "sap_s4hana"), "Includes SAP S/4HANA Finance Cloud connector");

    const mapRes = await request("/api/v1/integrations/field-mappings?connectorId=conn-sap-01");
    assert(mapRes.status === 200, "GET /api/v1/integrations/field-mappings returns 200 OK");
    assert(mapRes.data.data[0].targetErpEntity === "JournalEntry", "Target entity mapped to JournalEntry");

    const syncRes = await request("/api/v1/integrations/sync-jobs/trigger", {
      method: "POST",
      body: JSON.stringify({
        connectorId: "conn-sap-01",
        jobType: "outbound_payroll_gl",
      }),
    });
    assert(syncRes.status === 201, "POST /api/v1/integrations/sync-jobs/trigger returns 201 Created");
    assert(syncRes.data.data.status === "completed", "Sync job completed with zero failures");

    const gwRes = await request("/api/v1/integrations/payment-gateways");
    assert(gwRes.status === 200, "GET /api/v1/integrations/payment-gateways returns 200 OK");
    assert(gwRes.data.data.some((g: any) => g.provider === "mpesa_daraja"), "Safaricom M-Pesa B2C rail active");
    assert(gwRes.data.data.some((g: any) => g.provider === "pesalink"), "PesaLink Interbank rail active");
  }

  // SECTION 6: Deep Schema Wiring (Pay Groups, Tax Reliefs, Chart of Accounts, Matrix Reporting, RBAC)
  console.log("\n[SECTION 6] Deep Schema Wiring Endpoints & RBAC");
  {
    const pgRes = await request("/api/v1/payroll/pay-groups");
    assert(pgRes.status === 200, "GET /api/v1/payroll/pay-groups returns 200 OK");
    assert(pgRes.data.data.length >= 3, "Pay groups list populated");

    const compRes = await request("/api/v1/payroll/salary-components");
    assert(compRes.status === 200, "GET /api/v1/payroll/salary-components returns 200 OK");
    assert(compRes.data.data.some((c: any) => c.code === "HOUSING_LEVY"), "Housing levy component configured");

    const reliefRes = await request("/api/v1/payroll/tax-reliefs/emp-001");
    assert(reliefRes.status === 200, "GET /api/v1/payroll/tax-reliefs/:employeeId returns 200 OK");
    assert(reliefRes.data.data.some((r: any) => r.reliefType === "insurance_relief"), "Insurance relief tracked");

    const coaRes = await request("/api/v1/accounting/chart-of-accounts");
    assert(coaRes.status === 200, "GET /api/v1/accounting/chart-of-accounts returns 200 OK");
    assert(coaRes.data.data.some((a: any) => a.accountCode === "400100"), "GL 400100 Salaries Expense configured");

    const repRes = await request("/api/v1/organization/reporting-lines");
    assert(repRes.status === 200, "GET /api/v1/organization/reporting-lines returns 200 OK");
    assert(repRes.data.data.some((r: any) => r.reportingType === "dotted_line_matrix"), "Matrix dotted-line reporting lines active");

    const rolesRes = await request("/api/v1/organization/roles");
    assert(rolesRes.status === 200, "GET /api/v1/organization/roles returns 200 OK");
    assert(rolesRes.data.data.some((r: any) => r.code === "STATION_SUPERVISOR"), "Station Supervisor RBAC role configured");

    const catRes = await request("/api/v1/meta/catalog");
    assert(catRes.status === 200, "GET /api/v1/meta/catalog returns 200 OK");
    assert(catRes.data.domains.length >= 37, `Catalog includes all enterprise domains (found ${catRes.data.domains.length})`);
  }

  console.log("\n=================================================================================");
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL: ${passedCount + failedCount})`);
  console.log("=================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
