import assert from "node:assert/strict";
import { test } from "node:test";
import { compareStudentGrades, legacyStudentGradeNote, matchesStudentGrade, sortedStudentGrades, studentGradeLabel } from "../src/BLL/services/studentGradeService.ts";
import { emptyParentStudentLink, parentStudentLinkError, selectParentStudentPair } from "../src/BLL/services/parentStudentLinkService.ts";

const grades = [{gradeId:70, gradeName:"Khối 7"}, {gradeId:13, gradeName:"Luyện thi mới"}, {gradeId:2, gradeName:"Khối 12"}];
test("student grade label uses actual ID and latest catalogue name, never specialty or numeric year", () => {
  const student={gradeId:70, gradeName:"Outdated name", specialty:"Class 12"};
  assert.equal(studentGradeLabel(student,grades),"Khối 7");
  assert.equal(studentGradeLabel(student,[{gradeId:70, gradeName:"Khối được đổi tên"}]),"Khối được đổi tên");
  assert.equal(studentGradeLabel({gradeId:13}, grades),"Luyện thi mới");
});
test("legacy specialty is retained as a note without silently linking to a real grade", () => {
  const legacy={gradeId:null, specialty:"Class 7"};
  assert.equal(studentGradeLabel(legacy,grades),"Chưa liên kết khối");
  assert.equal(legacyStudentGradeNote(legacy),"Dữ liệu cũ: Class 7");
  assert.equal(matchesStudentGrade(legacy,"70",grades),false);
  assert.equal(matchesStudentGrade(legacy,"unassigned",grades),true);
  assert.equal(legacyStudentGradeNote({...legacy,gradeId:70}),null);
});
test("deleted or unknown grade IDs never become another grade with the same position/name", () => {
  assert.match(studentGradeLabel({gradeId:999,gradeName:"Khối 7"},grades),/không còn hợp lệ.*999/);
  assert.equal(matchesStudentGrade({gradeId:999},"invalid",grades),true);
  assert.equal(matchesStudentGrade({gradeId:70},"7",grades),false);
  assert.equal(matchesStudentGrade({gradeId:70},"70",grades),true);
});
test("real grade sorting includes custom grades, uses natural names and leaves missing grades last", () => {
  assert.deepEqual(sortedStudentGrades(grades).map(g=>g.gradeId),[70,2,13]);
  const students=[{gradeId:null,fullName:"Legacy"},{gradeId:13,fullName:"New"},{gradeId:2,fullName:"Twelve"},{gradeId:70,fullName:"Seven"}];
  assert.deepEqual([...students].sort((a,b)=>compareStudentGrades(a,b,grades)).map(s=>s.fullName),["Seven","Twelve","New","Legacy"]);
  assert.deepEqual([...students].sort((a,b)=>compareStudentGrades(a,b,grades,true)).map(s=>s.fullName),["New","Twelve","Seven","Legacy"]);
});
test("new parent/student link has no preselected party and defaults to Mother", () => {
  assert.deepEqual(emptyParentStudentLink(),{parentId:0,studentId:0,relationship:"Mother",isPrimaryContact:true,updateExisting:false});
  assert.ok(parentStudentLinkError(emptyParentStudentLink()));
  assert.ok(parentStudentLinkError({...emptyParentStudentLink(),parentId:1}));
  assert.ok(parentStudentLinkError({...emptyParentStudentLink(),studentId:2}));
  assert.equal(parentStudentLinkError({...emptyParentStudentLink(),parentId:1,studentId:2}),null);
});
test("selecting an existing pair retains its actual relationship and primary contact flag", () => {
  const links=[{parentId:1,studentId:2,relationship:"Father",isPrimaryContact:false}];
  const selected=selectParentStudentPair({...emptyParentStudentLink(),parentId:1},{studentId:2},links);
  assert.equal(selected.relationship,"Father");
  assert.equal(selected.isPrimaryContact,false);
  assert.equal(selected.updateExisting,true);
  const another=selectParentStudentPair(selected,{studentId:3},links);
  assert.equal(another.relationship,"Mother");
  assert.equal(another.updateExisting,false);
  assert.equal(links[0].relationship,"Father");
});
