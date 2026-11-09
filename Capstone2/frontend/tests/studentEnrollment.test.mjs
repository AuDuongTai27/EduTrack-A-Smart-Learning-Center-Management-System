import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { createServer } from "vite";
import { eligibleEnrollmentClasses, toggleEnrollmentClass } from "../src/BLL/services/studentEnrollmentService.ts";

let server, api, ConflictError;
const originalFetch = globalThis.fetch;
before(async () => {
  server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, ws: false }, appType: "custom" });
  ({ managementApi: api, StudentCreationConflictError: ConflictError } = await server.ssrLoadModule("/src/api/managementApi.ts"));
});
after(async () => { globalThis.fetch = originalFetch; await server?.close(); });

test("only actual matching grade and active/upcoming classes can be selected", () => {
  const classes = [
    {classId: 1, gradeId: 70, className: "7A", status: "active"},
    {classId: 2, gradeId: 70, className: "7B", status: "upcoming"},
    ...["inactive", "completed", "cancelled", "unknown", null].map((status, i) => ({classId: i + 3, gradeId: 70, className: "Closed", status})),
    {classId: 8, gradeId: 8, className: "8A", status: "active"},
    {classId: 9, gradeId: null, className: "Legacy", status: "active"},
  ];
  assert.deepEqual(eligibleEnrollmentClasses(classes, 70).map(c => c.classId), [1, 2]);
  assert.deepEqual(eligibleEnrollmentClasses(classes, 8).map(c => c.classId), [8]);
  assert.deepEqual(eligibleEnrollmentClasses(classes, 9), []);
});
test("checkbox toggles cannot create duplicate selections and unchecking removes IDs", () => {
  assert.deepEqual(toggleEnrollmentClass([1], 1, true), [1]);
  assert.deepEqual(toggleEnrollmentClass([1], 2, true), [1, 2]);
  assert.deepEqual(toggleEnrollmentClass([1, 2], 1, false), [2]);
});
const request = {userCode: "STU_REQUEST", fullName: "Synthetic", specialty: "Class 7", gender: "male", role: "student", gradeId: 70, classIds: [1, 2]};
const user = {...request, userId: 101, roles: ["student"]};
test("one atomic API call carries profile, real Grade ID and multiple classes; no tuition calls", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {calls.push({url, options}); return Response.json(user, {status: 201});};
  assert.equal((await api.createStudent(request)).userId, 101);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/users/students");
  assert.deepEqual(JSON.parse(calls[0].options.body), request);
});
test("no-class creation stays optional and retries reuse the exact identity", async () => {
  const bodies = [];
  globalThis.fetch = async (_url, options) => {bodies.push(JSON.parse(options.body)); return Response.json(user);};
  await api.createStudent({...request, classIds: []});
  await api.createStudent({...request, classIds: []});
  assert.deepEqual(bodies[0].classIds, []);
  assert.equal(bodies[0].userCode, bodies[1].userCode);
});
test("enrollment, validation, transaction and network failures never become student success", async () => {
  globalThis.fetch = async () => Response.json({message: "Lớp không còn nhận ghi danh"}, {status: 400});
  await assert.rejects(api.createStudent(request), /ghi danh/);
  globalThis.fetch = async () => Response.json({errors: {ClassIds: ["Mã lớp không hợp lệ"]}}, {status: 400});
  await assert.rejects(api.createStudent(request), /Mã lớp/);
  globalThis.fetch = async () => Response.json({message: "Transaction chưa xác nhận, thử lại"}, {status: 503});
  await assert.rejects(api.createStudent(request), /thử lại/);
  globalThis.fetch = async () => {throw new TypeError("Network error");};
  await assert.rejects(api.createStudent(request), /cùng yêu cầu/);
});
test("invalid success response cannot close the form or create a fabricated student", async () => {
  for (const result of [{}, {...user, userCode: "OTHER"}, {...user, userId: 0}, {...user, roles: []}, {...user, gradeId: null}]) {
    globalThis.fetch = async () => Response.json(result);
    await assert.rejects(api.createStudent(request), /chưa xác nhận/);
  }
});
test("Edit Grade requires backend confirmation of the requested ID instead of UI-only success", async () => {
  globalThis.fetch = async () => Response.json({...user, gradeId: 70});
  await assert.rejects(api.updateUser(101, {fullName: "Synthetic", gradeId: 80}), /chưa xác nhận khối lớp/);
  globalThis.fetch = async () => Response.json({...user, gradeId: 80});
  assert.equal((await api.updateUser(101, {fullName: "Synthetic", gradeId: 80})).gradeId, 80);
});
test("a changed replay exposes the confirmed student for safe recovery and does not report success", async () => {
  globalThis.fetch = async () => Response.json({code: "student_creation_conflict", message: "Đã lưu thông tin khác", existingStudentId: 101, existingStudentCode: request.userCode}, {status: 409});
  await assert.rejects(api.createStudent(request), error => error instanceof ConflictError && error.studentId === 101 && error.studentCode === request.userCode);
});
