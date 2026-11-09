import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let server;
let dashboardDAL;
const originalFetch = globalThis.fetch;

before(async () => {
  // Load the actual DAL and API modules with the same TS/env handling as the app.
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null }, appType: "custom" });
  ({ adminStaffDashboardDAL: dashboardDAL } = await server.ssrLoadModule("/src/DAL/adminStaffDashboardDAL.ts"));
});

after(async () => {
  globalThis.fetch = originalFetch;
  await server?.close();
});

function serve(responses) {
  const calls = [];
  globalThis.fetch = async (input) => {
    const url = new URL(String(input), "http://localhost");
    const path = url.pathname.replace(/^\/api/, "") + url.search;
    calls.push(path);
    if (!Object.hasOwn(responses, path)) throw new Error(`Unexpected request: ${path}`);
    const value = await responses[path];
    if (value instanceof Error) throw value;
    if (value instanceof Response) return value;
    return Response.json(value);
  };
  return calls;
}

const common = () => ({
  "/users": [], "/tuitioninvoices": [], "/payments": [], "/classsessions": [], "/teacherclasses": [],
});

test("student data is published while the independent Payments request is still loading", {timeout: 3000}, async () => {
  let finishPayments;
  const waitingPayments = new Promise(resolve => { finishPayments = resolve; });
  serve({
    ...common(),
    "/users": [{userId: 6, status: "active", roles: ["student"]}],
    "/payments": waitingPayments,
  });
  let publishStudents;
  const studentUpdate = new Promise(resolve => { publishStudents = resolve; });
  const dashboard = dashboardDAL.getDashboard(null, "2026-11-06", partial => {
    if (partial.students.data === 1) publishStudents(partial);
  });
  try {
    const partial = await studentUpdate;
    assert.equal(partial.students.data, 1);
    assert.equal(partial.tuition.data, null);
    assert.equal(partial.tuition.error, null);
  } finally {
    finishPayments([]);
    await dashboard;
  }
});

test("without staff identity the DAL loads public metrics but never another user's inbox or requests", async () => {
  const calls = serve(common());
  const result = await dashboardDAL.getDashboard(null, "2026-11-06");
  assert.equal(result.students.data, 0);
  assert.deepEqual(result.tuition.data, { unpaidCount: 0, outstanding: 0 });
  assert.deepEqual(result.schedule.data, []);
  assert.equal(result.requests.data, null);
  assert.match(result.notifications.error, /tài khoản giáo vụ/);
  assert.deepEqual(calls.sort(), ["/classsessions", "/payments", "/teacherclasses", "/tuitioninvoices", "/users"]);
});

test("staff 42 receives their own requests and sorted inbox, never the global notification feed", async () => {
  const calls = serve({
    ...common(),
    "/users/42": { userId: 42, fullName: "Giáo vụ kiểm thử", status: "active", roles: ["admin_staff"] },
    "/approvalrequests": [
      { requestId: 1, requestedBy: 42, createdAt: "2026-11-01", status: "pending" },
      { requestId: 2, requestedBy: 2, createdAt: "2026-11-06", status: "pending" },
      { requestId: 3, requestedBy: 42, createdAt: "2026-11-05", status: "approved" },
    ],
    "/notifications/inbox?userId=42": [
      { notificationId: 8, createdAt: "2026-11-01" },
      { notificationId: 9, createdAt: "2026-11-05" },
    ],
  });
  const result = await dashboardDAL.getDashboard(42, "2026-11-06");
  assert.equal(result.staff.data.userId, 42);
  assert.deepEqual(result.requests.data.map((item) => item.requestId), [3, 1]);
  assert.deepEqual(result.notifications.data.map((item) => item.notificationId), [9, 8]);
  assert.ok(!calls.includes("/notifications"));
  assert.ok(!calls.includes("/users/2"));
});

test("a server profile without the staff role cannot load personal sections", async () => {
  const calls = serve({ ...common(), "/users/42": { userId: 42, status: "active", roles: ["student"] } });
  const result = await dashboardDAL.getDashboard(42, "2026-11-06");
  assert.equal(result.staff.data, null);
  assert.equal(result.requests.data, null);
  assert.equal(result.notifications.data, null);
  assert.ok(!calls.includes("/approvalrequests"));
  assert.ok(!calls.some((path) => path.startsWith("/notifications")));
});

test("a failed payments API prevents fabricated debt but leaves student and session data usable", async () => {
  serve({
    ...common(),
    "/users": [{ userId: 6, status: "active", roles: ["student"] }],
    "/tuitioninvoices": [{ invoiceId: 1, amountDue: 1_000_000, status: "unpaid" }],
    "/payments": new Response("Unavailable", { status: 503, statusText: "Service Unavailable" }),
  });
  const result = await dashboardDAL.getDashboard(null, "2026-11-06");
  assert.equal(result.students.data, 1);
  assert.equal(result.tuition.data, null);
  assert.match(result.tuition.error, /503/);
  assert.deepEqual(result.schedule.data, []);
});

test("backend offline produces section errors instead of successful zeroes or example records", async () => {
  serve(Object.fromEntries(Object.keys(common()).map((key) => [key, new Error("Network offline")])));
  const result = await dashboardDAL.getDashboard(null, "2026-11-06");
  for (const section of [result.students, result.tuition, result.schedule]) {
    assert.equal(section.data, null);
    assert.match(section.error, /Network offline/);
  }
});
