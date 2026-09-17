import { apiClient } from "../../lib/api-client";
import app from "./app";

async function testPhase1Client() {
  console.log("=================================================================================");
  console.log("  PHASE 1 VERIFICATION: UNIVERSAL API CLIENT & MULTI-TENANT CONTEXT");
  console.log("=================================================================================");

  // Connect app in memory for test execution
  apiClient.setCustomFetch((url, init) => {
    // strip protocol and host if present so app.request handles relative or absolute path
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

  // 1. Verify Context Management
  apiClient.setContext({
    tenantId: "tenant-default",
    organizationId: "KEN-NBO",
    userId: "usr-nelson-mandela",
    userRole: "super_admin",
  });

  const ctx = apiClient.getContext();
  assert(ctx.tenantId === "tenant-default", "Tenant ID properly initialized in ApiClient");
  assert(ctx.organizationId === "KEN-NBO", "Organization ID initialized to KEN-NBO");
  assert(ctx.userRole === "super_admin", "User role persona initialized to super_admin");

  // 2. Test SaaS Endpoints via Client
  const saasRes = await apiClient.saas.getTenants();
  assert(saasRes.status === 200, "apiClient.saas.getTenants() returns status 200");
  assert(Array.isArray(saasRes.data?.tenants || saasRes.data), "Tenants data returned as array");

  // 3. Test Users Endpoints via Client
  const usersRes = await apiClient.users.listUsers();
  assert(usersRes.status === 200, "apiClient.users.listUsers() returns status 200");
  assert(Array.isArray(usersRes.data?.users || usersRes.data), "Users data returned as array");

  // 4. Test Document Storage Metrics
  const docMetricsRes = await apiClient.documents.getStorageMetrics();
  assert(docMetricsRes.status === 200, "apiClient.documents.getStorageMetrics() returns status 200");
  assert(
    docMetricsRes.data?.tenantStorageAllowanceGb === 50 || docMetricsRes.data?.tenantStorageAllowanceBytes === 53687091200,
    "Storage metrics telemetry verified (50 GB allowance)"
  );

  // 5. Test Station Endpoints via Client
  const stationsRes = await apiClient.station.getStations();
  assert(stationsRes.status === 200, "apiClient.station.getStations() returns status 200");

  // 6. Test Domestic Transfers Endpoint
  const transfersRes = await apiClient.station.getTransfers();
  assert(transfersRes.status === 200, "apiClient.station.getTransfers() returns status 200");

  // 7. Test Continuous Rotations Endpoint
  const rotationsRes = await apiClient.station.getRotations();
  assert(rotationsRes.status === 200, "apiClient.station.getRotations() returns status 200");

  // 8. Test Commercial Fleet Endpoint
  const fleetRes = await apiClient.station.getFleet();
  assert(fleetRes.status === 200, "apiClient.station.getFleet() returns status 200");

  // 9. Test Role Switching in ApiClient
  apiClient.setContext({ userRole: "station_supervisor" });
  assert(apiClient.getContext().userRole === "station_supervisor", "Role switched to station_supervisor in ApiClient");

  // 10. Test Notification Inbox
  const notifRes = await apiClient.notifications.getInbox("usr-nelson-mandela");
  assert(notifRes.status === 200, "apiClient.notifications.getInbox() returns status 200");

  console.log("=================================================================================");
  console.log(`  PHASE 1 CLIENT TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("=================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

testPhase1Client().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
