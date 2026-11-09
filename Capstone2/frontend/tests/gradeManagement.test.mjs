import assert from "node:assert/strict";
import {before, after, test} from "node:test";
import {createServer} from "vite";
import {normalizeGradeName, gradeNameError, filterGrades} from "../src/BLL/services/gradeManagementService.ts";
import {validateClassForm, emptyClassForm} from "../src/BLL/services/classManagementService.ts";

let server, api;
const originalFetch = globalThis.fetch;
before(async () => {
  server = await createServer({configFile: false, server: {middlewareMode: true, watch: null, ws: false}, appType: "custom"});
  ({gradeManagementApi: api} = await server.ssrLoadModule("/src/api/gradeManagementApi.ts"));
});
after(async () => {globalThis.fetch = originalFetch; await server?.close();});

test("grade names normalize Unicode/spacing and reject blank, control characters and excessive length", () => {
  assert.equal(normalizeGradeName("  Ｋhối\t  13  "), "Khối 13");
  for (const value of ["", " \t ", "x".repeat(51), "Grade\u0000name"]) assert.ok(gradeNameError(value));
  for (const value of ["Khối 13", "Luyện thi đại học", "x".repeat(50)]) assert.equal(gradeNameError(value), null);
});
test("grade search and natural name/count sorting preserve API order and include custom grades", () => {
  const items = [{gradeId: 13, gradeName: "Luyện thi", totalClasses: 2}, {gradeId: 10, gradeName: "Khối 10", totalClasses: 0}, {gradeId: 2, gradeName: "Khối 2", totalClasses: 1}];
  assert.deepEqual(filterGrades(items, "  KHỐI ", "az").map(i => i.gradeId), [2, 10]);
  assert.deepEqual(filterGrades(items, "", "classes").map(i => i.gradeId), [13, 2, 10]);
  assert.deepEqual(items.map(i => i.gradeId), [13, 10, 2]);
});
test("Class creation accepts real custom grade IDs above the twelve seeded grades", () => {
  assert.deepEqual(validateClassForm({...emptyClassForm(), className: "Test", gradeId: "13", subjectId: "42", tuitionFee: "0", startDate: "2026-11-07"},
    [{subjectId: 42}], "create", [{gradeId: 13, gradeName: "Luyện thi"}]), {});
});
test("management reads real counts, including zero, and refuses missing or fabricated summaries", async () => {
  globalThis.fetch = async () => Response.json([{gradeId: 13, gradeName: "Luyện thi", totalClasses: 0}]);
  assert.equal((await api.getAll())[0].totalClasses, 0);
  for (const totalClasses of [undefined, -1, 1.5, "2"]) {
    globalThis.fetch = async () => Response.json([{gradeId: 13, gradeName: "Luyện thi", totalClasses}]);
    await assert.rejects(api.getAll(), /số lớp/);
  }
});
test("grade commands send only the name and verify server-assigned immutable IDs", async () => {
  let request;
  globalThis.fetch = async (url, options) => {request = {url, options}; return Response.json({gradeId: 13, gradeName: "Luyện thi", totalClasses: 0});};
  assert.equal((await api.create("Luyện thi")).gradeId, 13);
  assert.deepEqual(JSON.parse(request.options.body), {gradeName: "Luyện thi"});
  assert.equal(request.url, "/api/grades");
  await assert.rejects(api.rename(7, "Luyện thi"), /sai khối/);
});
test("duplicate/in-use errors remain errors and malformed success cannot delete a row in the UI", async () => {
  globalThis.fetch = async () => Response.json({message: "Tên khối lớp đã tồn tại."}, {status: 409});
  await assert.rejects(api.create("Khối 1"), /đã tồn tại.*409/);
  globalThis.fetch = async () => Response.json({message: "Khối lớp có Class liên kết."}, {status: 409});
  await assert.rejects(api.delete(7), /liên kết/);
  globalThis.fetch = async () => Response.json({success: false});
  await assert.rejects(api.delete(7), /chưa xác nhận/);
});
