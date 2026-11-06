import assert from "node:assert/strict";
import test from "node:test";
import {emptyClassForm, classToForm, validateClassForm, classFormPayload, filterClasses, classDate, suggestedClassEndDate}
  from "../src/BLL/services/classManagementService.ts";

const subjects = [{subjectId: 42, subjectName: "Toán", subjectCode: "MATH"}];
const valid = (patch = {}) => ({...emptyClassForm(), className: " 7A ", subjectId: "42", tuitionFee: "0", startDate: "2026-11-06", ...patch});
test("new classes have no invented room, fee, subject or dates", () => {
  const form = emptyClassForm();
  assert.equal(form.subjectId, ""); assert.equal(form.room, ""); assert.equal(form.tuitionFee, "");
  assert.equal(form.startDate, ""); assert.equal(form.endDate, "");
});
test("required input and unknown subject IDs are rejected without a fallback", () => {
  assert.deepEqual(Object.keys(validateClassForm(emptyClassForm(), subjects)).sort(), ["className", "startDate", "subjectId", "tuitionFee"]);
  for (const subjectId of ["", "0", "1", "42.1", "NaN"])
    assert.ok(validateClassForm(valid({subjectId}), subjects).subjectId);
  assert.ok(validateClassForm(valid(), []).subjectId);
});
test("fees distinguish blank from zero and respect the existing decimal column", () => {
  for (const tuitionFee of ["0", "3500000", "9999999999.99", "1.25"])
    assert.deepEqual(validateClassForm(valid({tuitionFee}), subjects), {});
  for (const tuitionFee of ["", " ", "-1", "Infinity", "abc", "1.001", "10000000000", "1e6"])
    assert.ok(validateClassForm(valid({tuitionFee}), subjects).tuitionFee);
});
test("dates must exist and end cannot precede start, including leap years", () => {
  assert.ok(validateClassForm(valid({endDate: "2026-11-05"}), subjects).endDate);
  assert.ok(validateClassForm(valid({startDate: "2026-02-30"}), subjects).startDate);
  assert.ok(validateClassForm(valid({startDate: "2026-02-29"}), subjects).startDate);
  assert.ok(validateClassForm(valid({startDate: "0001-01-01"}), subjects).startDate);
  assert.deepEqual(validateClassForm(valid({startDate: "2028-02-29", endDate: "2028-02-29"}), subjects), {});
});
test("suggested class end is one calendar month later, clamped at month end without timezone shifts", () => {
  for (const [start, end] of [["2026-11-07", "2026-12-07"], ["2026-01-31", "2026-02-28"],
    ["2028-01-31", "2028-02-29"], ["2026-03-31", "2026-04-30"], ["2026-12-15", "2027-01-15"],
    ["", ""], ["2026-02-30", ""], ["9999-12-01", ""]])
    assert.equal(suggestedClassEndDate(start), end);
});
test("names and room lengths match the backend fields", () => {
  assert.ok(validateClassForm(valid({className: "  "}), subjects).className);
  assert.ok(validateClassForm(valid({className: "x".repeat(151)}), subjects).className);
  assert.ok(validateClassForm(valid({room: "x".repeat(51)}), subjects).room);
});
test("new classes allow only active/upcoming while existing classes retain their lifecycle states", () => {
  for (const status of ["active", "upcoming"])
    assert.deepEqual(validateClassForm(valid({status}), subjects, "create"), {});
  for (const status of ["inactive", "completed", "unknown"])
    assert.ok(validateClassForm(valid({status}), subjects, "create").status);
  for (const status of ["inactive", "completed"])
    assert.deepEqual(validateClassForm(valid({status}), subjects, "edit"), {});
});
test("payload has one explicitly selected subject and only editable scalar fields", () => {
  assert.deepEqual(classFormPayload(valid()), {className: "7A", subjectId: 42, room: null, tuitionFee: 0,
    startDate: "2026-11-06", endDate: null, status: "active"});
});
test("editing starts from exact server data including zero fee and missing room", () => {
  const form = classToForm({classId: 90, className: "9A", subjectId: 57, tuitionFee: 0,
    startDate: "2026-10-31T00:00:00", endDate: null, status: "inactive", room: null});
  assert.equal(form.subjectId, "57"); assert.equal(form.tuitionFee, "0"); assert.equal(form.room, "");
  assert.equal(form.startDate, "2026-10-31"); assert.equal(form.status, "inactive");
});
test("search, exact subject/status filters and sorting leave API data unchanged", () => {
  const items = [{classId: 3, className: "7B", subjectId: 42, status: "active"},
    {classId: 1, className: "7A", subjectId: 57, status: "inactive"},
    {classId: 2, className: "8A", subjectId: 42, status: "active"}];
  assert.deepEqual(filterClasses(items, " 7 ", "All", "All", "az").map(i => i.classId), [1, 3]);
  assert.deepEqual(filterClasses(items, "", "42", "active", "newest").map(i => i.classId), [3, 2]);
  assert.deepEqual(filterClasses(items, "", "All", "All", "za").map(i => i.classId), [2, 3, 1]);
  assert.deepEqual(items.map(i => i.classId), [3, 1, 2]);
});
test("class dates are date-only values and invalid data is unavailable", () => {
  assert.equal(classDate("2026-11-06T00:00:00"), "06/11/2026");
  assert.equal(classDate(null), "—"); assert.equal(classDate("2026-02-30"), "—");
});
