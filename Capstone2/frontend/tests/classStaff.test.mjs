import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";
import {eligibleClassStaff} from "../src/BLL/services/classStaffService.ts";

let server, api, dal;
const originalFetch = globalThis.fetch;
const user = (userId, role = "teacher", status = "active") => ({userId, fullName: `Staff ${userId}`, userCode: `U${userId}`, status, roles: [role]});
before(async () => {
  server = await createServer({configFile: false, server: {middlewareMode: true, watch: null, ws: false}, appType: "custom"});
  ({classStaffApi: api} = await server.ssrLoadModule("/src/api/classStaffApi.ts"));
  ({classStaffDAL: dal} = await server.ssrLoadModule("/src/DAL/classStaffDAL.ts"));
});
after(async () => {globalThis.fetch = originalFetch; await server?.close();});
const respond = (body, status = 200) => {globalThis.fetch = async () => Response.json(body, {status});};

test("only active accounts with the correct role can be selected; active assignments are excluded", () => {
  const users = [user(1), user(2), user(3, "teacher", "inactive"), user(4, "student"),
    user(5, "teaching_assistant"), user(6, "TEACHER", "ACTIVE"), {...user(7), roles: []}];
  const assignments = [{teacherId: 1, status: "active"}, {teacherId: 2, status: "inactive"}];
  assert.deepEqual(eligibleClassStaff(users, "teachers", assignments).map(u => u.userId), [2, 6]);
  assert.deepEqual(eligibleClassStaff(users, "assistants", []).map(u => u.userId), [5]);
  assert.deepEqual(eligibleClassStaff(users, "assistants", [{taId: 5, status: "active"}]), []);
});
test("candidate load failure or malformed users never becomes an empty success", async () => {
  for (const body of [{users: []}, [null], [{...user(1), roles: [null]}], [{...user(1), userId: 0}]]) {
    respond(body); await assert.rejects(dal.getCandidates("teachers", []), /không hợp lệ/);
  }
  respond({message: "Offline"}, 502); await assert.rejects(dal.getCandidates("teachers", []), /502/);
  respond([]); assert.deepEqual(await dal.getCandidates("teachers", []), []);
});
test("invalid class or user IDs are rejected before sending a command", async () => {
  let calls = 0; globalThis.fetch = async () => {calls++; throw Error("Should not send");};
  for (const [classId, userId] of [[0, 8], [17, 0], [17, NaN], [1.5, 8]])
    await assert.rejects(api.assign("teachers", classId, userId), /hợp lệ/);
  assert.equal(calls, 0);
});
test("assignment command preserves class, role and selected user and returns the confirmed relationship", async () => {
  for (const [kind, idKey, userKey] of [["teachers", "teacherClassId", "teacherId"], ["assistants", "taClassId", "taId"]]) {
    let sent;
    const saved = {[idKey]: 91, [userKey]: 8, classId: 17, status: "active"};
    globalThis.fetch = async (url, options) => {sent = {url, method: options.method, body: JSON.parse(options.body)}; return Response.json(saved);};
    assert.deepEqual(await dal.assign(kind, 17, 8), saved);
    assert.deepEqual(sent, {url: `/api/classes/17/${kind}`, method: "POST", body: {userId: 8}});
  }
});
test("duplicate, stale role, missing class and server errors remain visible failures", async () => {
  for (const [status, message] of [[409, "Đã phân công"], [400, "Tài khoản không còn hoạt động"], [404, "Không tìm thấy lớp"], [500, "Lỗi máy chủ"]]) {
    respond({message}, status); await assert.rejects(api.assign("teachers", 17, 8), error => error.message.includes(message));
  }
  respond({errors: {UserId: ["Chọn giáo viên hợp lệ."]}}, 400);
  await assert.rejects(api.assign("teachers", 17, 8), /Chọn giáo viên/);
});
test("HTTP success with an invented or mismatched assignment is never reported as saved", async () => {
  const saved = {teacherClassId: 91, teacherId: 8, classId: 17, status: "active"};
  for (const body of [null, {success: true}, {...saved, classId: 20}, {...saved, teacherId: 9},
    {...saved, teacherClassId: 0}, {...saved, status: "inactive"}, {taClassId: 91, taId: 8, classId: 17, status: "active"}]) {
    respond(body); await assert.rejects(api.assign("teachers", 17, 8), /chưa xác nhận/);
  }
});
test("deactivation is scoped to the selected class, role and relationship ID", async () => {
  for (const [kind, idKey, userKey] of [["teachers", "teacherClassId", "teacherId"], ["assistants", "taClassId", "taId"]]) {
    let sent;
    const saved = {[idKey]: 91, [userKey]: 8, classId: 17, status: "inactive"};
    globalThis.fetch = async (url, options) => {sent = {url, method: options.method, body: options.body}; return Response.json(saved);};
    assert.deepEqual(await dal.deactivate(kind, 17, 91, 8), saved);
    assert.deepEqual(sent, {url: `/api/classes/17/${kind}/91/deactivate`, method: "PATCH", body: undefined});
  }
});
test("deactivation rejects bad IDs without sending and rejects failed or mismatched confirmations", async () => {
  let calls = 0; globalThis.fetch = async () => {calls++; throw Error("Should not send");};
  for (const ids of [[0, 91, 8], [17, -1, 8], [17, 91, NaN]])
    await assert.rejects(api.deactivate("teachers", ...ids), /không hợp lệ/);
  assert.equal(calls, 0);
  for (const status of [400, 404, 409, 500]) {
    respond({message: "Không ngừng được phân công"}, status);
    await assert.rejects(api.deactivate("teachers", 17, 91, 8), /Không ngừng được/);
  }
  const saved = {teacherClassId: 91, teacherId: 8, classId: 17, status: "inactive"};
  for (const body of [null, {success: true}, {...saved, classId: 20}, {...saved, teacherId: 9},
    {...saved, teacherClassId: 92}, {...saved, status: "active"}]) {
    respond(body); await assert.rejects(api.deactivate("teachers", 17, 91, 8), /chưa xác nhận/);
  }
});
