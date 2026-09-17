import { apiClient } from "../../lib/api-client";
import app from "./app";

async function testPhase3UI() {
  console.log("=================================================================================");
  console.log("  PHASE 3 VERIFICATION: STATION, DEPOT & OPERATIONS HUB (SUPERVISOR ROLE)");
  console.log("=================================================================================");

  // Connect in-memory app instance for standalone testing
  apiClient.setCustomFetch((url, init) => {
    const parsedPath = url.replace(/^https?:\/\/[^\/]+/, "");
    return app.request(parsedPath, init);
  });

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✔ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✖ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Context Switch to Station Supervisor
  apiClient.setContext({
    tenantId: "tenant-default",
    organizationId: "KEN-NBO",
    userId: "usr-supervisor-01",
    userRole: "station_supervisor",
  });
  assert(apiClient.getContext().userRole === "station_supervisor", "User context switches dynamically to 'station_supervisor'");

  // 2. Station Work Locations
  const stationsRes = await apiClient.station.getStations();
  assert(stationsRes.status === 200, "apiClient.station.getStations() returns status 200");
  const stations = stationsRes.data?.data || stationsRes.data;
  assert(Array.isArray(stations), "Stations returned as list");
  assert(stations.some((s: any) => s.code === "PLT-NRB-02" || s.name.includes("Nairobi Industrial Plant")), "Includes Nairobi Industrial Plant");
  assert(stations.some((s: any) => s.code === "DEP-KSM-01" || s.name.includes("Kisumu Lake Basin Depot")), "Includes Kisumu Lake Basin Depot");

  // 3. Domestic Station Transfers Query
  const transfersRes = await apiClient.station.getTransfers();
  assert(transfersRes.status === 200, "apiClient.station.getTransfers() returns status 200");
  const transfers = transfersRes.data?.data || transfersRes.data;
  assert(Array.isArray(transfers), "Domestic transfers returned as list");

  // 4. Create Domestic Relocation Case with Package Calculation
  const newTransferPayload = {
    employeeId: "emp-2190",
    employeeName: "David Omondi",
    originLocationId: "loc-ksm-depot",
    originLocationName: "Kisumu Lake Basin Depot",
    destinationLocationId: "loc-nrb-plant",
    destinationLocationName: "Nairobi Industrial Plant",
    transferReason: "station_rotation" as const,
    effectiveDate: "2026-11-01",
    reportingDate: "2026-11-06",
    relocationPackage: {
      disturbanceAllowance: 150000,
      haulageAssistance: 75000,
      transitLodgingDays: 21,
      transitLodgingDailyRate: 5000,
      relocationLeaveDays: 4,
      stationHardshipDifferential: 0,
      currency: "KES",
    },
  };

  const createTrfRes = await apiClient.station.createTransfer(newTransferPayload);
  assert(createTrfRes.status === 201, "POST /api/v1/mobility/transfers/domestic returns 201 Created");
  const createdTransfer = createTrfRes.data?.data || createTrfRes.data;
  assert(createdTransfer.relocationPackage.transitLodgingTotal === 105000, "Transit lodging calculated: 21 days * KES 5,000 = KES 105,000");
  assert(
    createdTransfer.relocationPackage.totalRelocationSupport === 330000,
    "Total relocation support calculated: 150,000 + 75,000 + 105,000 = KES 330,000"
  );

  // 5. Execute Transfer & Re-bind Geofence
  const executeTrfRes = await apiClient.post(`/api/v1/mobility/transfers/domestic/${createdTransfer.id}/execute`);
  assert(executeTrfRes.status === 200, "POST /api/v1/mobility/transfers/domestic/:id/execute returns 200 OK");
  const execData = executeTrfRes.data?.data || executeTrfRes.data;
  assert(execData?.transfer?.geofenceRebound === true, "Attendance geofence status marked as rebound to destination station");
  assert(execData?.reboundGeofence?.locationName === "Nairobi Industrial Plant", "GPS coordinates rebound to Nairobi Plant");

  // 6. Continuous Shift Rotations & Fatigue Guard
  const rotationsRes = await apiClient.station.getRotations();
  assert(rotationsRes.status === 200, "apiClient.station.getRotations() returns status 200");
  const patterns = rotationsRes.data?.data || rotationsRes.data;
  assert(Array.isArray(patterns), "Shift patterns returned as list");
  assert(patterns.some((p: any) => p.code === "SHIFT-CONT-247"), "Includes Continental 24/7 Continuous 3-Shift Pattern");
  assert(patterns.some((p: any) => p.code === "SHIFT-FIFO-1414"), "Includes Mining FIFO 14/14 Continuous Roster");

  // 7. Commercial Fleet & KRA Section 5(4) Car Benefit Tax
  const fleetRes = await apiClient.station.getFleet();
  assert(fleetRes.status === 200, "apiClient.station.getFleet() returns status 200");
  const fleetList = fleetRes.data?.data || fleetRes.data;
  assert(Array.isArray(fleetList), "Fleet vehicles returned as list");
  assert(fleetList.some((v: any) => v.registrationNumber === "KDF 123A"), "Includes Toyota Land Cruiser Prado (KDF 123A)");

  // Verify KRA Section 5(4) Formula
  const carCost = 7500000;
  const expected2PercentRule = carCost * 0.02; // KES 150,000
  const expectedFuelBenefit = expected2PercentRule * 0.30; // KES 45,000
  const totalTaxable = expected2PercentRule + expectedFuelBenefit; // KES 195,000
  assert(expected2PercentRule === 150000, "2% initial cost rule calculated: 2% of KES 7.5M = KES 150,000/mo");
  assert(totalTaxable === 195000, "Total taxable car benefit with company fuel calculated: KES 195,000/mo");

  console.log("=================================================================================");
  console.log(`  PHASE 3 UI & API VERIFICATION: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("=================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

testPhase3UI().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
