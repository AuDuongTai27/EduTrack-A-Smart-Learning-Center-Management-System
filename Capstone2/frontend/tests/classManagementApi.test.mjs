import assert from "node:assert/strict";
import {after, before, test} from "node:test";
import {createServer} from "vite";

let server, classes, commands, relations;
const originalFetch = globalThis.fetch;
const item = {classId: 17, className: "7A", subjectId: 42, tuitionFee: 0, startDate: "2026-11-06", status: "active"};
before(async () => {
  server = await createServer({configFile: false, server: {middlewareMode: true, watch: null, ws: false}, appType: "custom"});
  ({classApi: classes} = await server.ssrLoadModule("/src/api/classApi.ts"));
  ({managementApi: commands} = await server.ssrLoadModule("/src/api/managementApi.ts"));
  ({classManagementApi: relations} = await server.ssrLoadModule("/src/api/classManagementApi.ts"));
});
after(async () => {globalThis.fetch = originalFetch; await server?.close();});
function respond(body, status = 200) {globalThis.fetch = async () => Response.json(body, {status});}
test("class GET rejects network errors, malformed lists and wrong detail identity", async () => {
  respond({message: "Unavailable"}, 503);
  await assert.rejects(classes.getAll(), /503/);
  respond({data: []}); await assert.rejects(classes.getAll(), /không hợp lệ/);
  respond({...item, classId: 20}); await assert.rejects(classes.getById(17), /sai lớp/);
  respond(item); assert.equal((await classes.getById(17)).classId, 17);
});
test("ASP.NET validation errors survive POST/PUT and failed deletion", async () => {
  respond({errors: {EndDate: ["Ngày kết thúc không được trước ngày khai giảng."]}}, 400);
  await assert.rejects(commands.createClass({}), /Ngày kết thúc/);
  await assert.rejects(commands.updateClass(17, {}), /Ngày kết thúc/);
  respond({message: "Lớp có học viên đã đăng ký."}, 400);
  await assert.rejects(commands.deleteClass(17), /học viên/);
});
test("a successful HTTP response with no saved class cannot become fake success", async () => {
  respond({success: true}); await assert.rejects(commands.createClass({}), /Phản hồi lớp học/);
  respond({...item, classId: 20}); await assert.rejects(commands.updateClass(17, {}), /không đúng lớp/);
});
test("only server-confirmed class data is returned and the request preserves scalar fields", async () => {
  let sent;
  globalThis.fetch = async (_url, request) => {sent = JSON.parse(request.body); return Response.json(item);};
  const payload = {className: "7A", subjectId: 42, room: null, tuitionFee: 0, startDate: "2026-11-06", endDate: null, status: "active"};
  assert.deepEqual(await commands.createClass(payload), item);
  assert.deepEqual(sent, payload);
});
test("relationship lists are scoped by actual class ID and malformed data is never an empty success", async () => {
  respond([{classId: 17, studentId: 5}, {classId: 20, studentId: 6}]);
  assert.deepEqual(await relations.getRelation("students", 17), [{classId: 17, studentId: 5}]);
  respond({students: []}); await assert.rejects(relations.getRelation("students", 17), /không hợp lệ/);
  respond({message: "Offline"}, 502); await assert.rejects(relations.getRelation("teachers", 17), /502/);
});
