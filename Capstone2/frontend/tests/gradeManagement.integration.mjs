// Integration test for the isolated Grade Management review API only.
// Run: node tests/gradeManagement.integration.mjs <existing-artifact-directory>
// Fixed test port plus required database identity header; never point at the main API.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const dir=process.argv[2],base='http://127.0.0.1:53307/api',marker='127.0.0.1:33307/edutrack_grade_management';const checks=[],requests=[];
const check=(ok,label)=>{assert.ok(ok,label);checks.push(label);};const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
async function req(method,route,body){const response=await fetch(base+route,{method,redirect:'error',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});assert.equal(response.headers.get('x-edutrack-review-database'),marker);const data=await response.json();requests.push({method,route,status:response.status});return {status:response.status,data};}
async function get(route){const r=await req('GET',route);assert.equal(r.status,200);return r.data;}
const gradeBefore=await get('/grades'),classesBefore=await get('/classes'),subjects=await get('/subjects');
const relations={};for(const e of ['studentclasses','teacherclasses','taclasses','classschedules','classsessions','tuitioninvoices','payments'])relations[e]=await get('/'+e);
check(gradeBefore.every(g=>Number.isInteger(g.totalClasses)&&g.totalClasses===classesBefore.filter(c=>c.gradeId===g.gradeId).length),'Grade counts include actual classes from MySQL');
for(const gradeName of ['', ' \t ', 'x'.repeat(51), 'Bad\u0000Name'])check((await req('POST','/grades',{gradeName})).status===400,'Invalid name rejected');
check((await req('POST','/grades',{gradeId:99,gradeName:'Illegal ID'})).status===400,'Create does not accept a client GradeId');
check((await req('POST','/grades',{gradeName:'Illegal status',status:'inactive'})).status===400,'Unsupported status cannot become fake success');
check((await req('POST','/grades',{gradeName:'  khoi 1 '})).status===409,'Existing name rejected under actual MySQL collation');
const created=await req('POST','/grades',{gradeName:'  Ｇrade  Advanced  '});check(created.status===201&&created.data.gradeName==='Grade Advanced'&&created.data.gradeId>12,'Create normalizes Unicode/whitespace and generates a custom ID');
const id=created.data.gradeId;check((await get('/grades/'+id)).totalClasses===0,'Detail reads real zero class count');
check((await req('POST','/grades',{gradeName:' grade   advanced '})).status===409,'Duplicate spacing/case rejected');
check((await req('PUT','/grades/'+id,{gradeName:'Khối 2'})).status===409,'Rename to an existing name rejected');
check((await req('PUT','/grades/'+id,{gradeId:2,gradeName:'Illegal ID'})).status===400,'Update cannot modify GradeId');
const renamed=await req('PUT','/grades/'+id,{gradeName:'Grade Advanced II'});check(renamed.status===200&&renamed.data.gradeId===id,'Rename retains immutable ID');
const draft={className:'Grade Management API test',gradeId:id,subjectId:subjects[0].subjectId,room:null,tuitionFee:0,startDate:'2026-11-07',endDate:null,status:'upcoming'};
const newClass=await req('POST','/classes',draft);check(newClass.status===201&&newClass.data.gradeId===id,'Class API accepts an actual Grade ID above 12');
const classId=newClass.data.classId;check((await get('/grades/'+id)).totalClasses===1,'Class count reflects assigned class');
check((await req('PUT','/classes/'+classId,{...draft,status:'completed'})).status===200,'Existing class lifecycle preserved');
check((await req('DELETE','/grades/'+id)).status===409,'Grade deletion blocked even when its class is completed');
check((await get('/classes/'+classId)).classId===classId,'Denied deletion retains the linked class');
check((await req('PUT','/grades/'+id,{gradeName:'Grade Renamed In Use'})).status===200,'Used Grade can be renamed');
const linked=await get('/classes/'+classId);check(linked.gradeId===id&&linked.gradeName==='Grade Renamed In Use'&&linked.subjectId===draft.subjectId&&linked.tuitionFee===0,'Rename changes displayed name without changing class relation or tuition');
check((await req('DELETE','/classes/'+classId)).status===200,'Empty synthetic class can be removed');
check((await req('DELETE','/grades/'+id)).status===200,'Unlinked Grade can be deleted');check((await req('GET','/grades/'+id)).status===404,'Deleted Grade not found');
check((await req('PUT','/grades/2147483646',{gradeName:'Missing'})).status===404,'Missing edit target returns 404');check((await req('DELETE','/grades/2147483646')).status===404,'Missing delete target returns 404');
const duplicateName='Concurrent Duplicate Grade';const raced=await Promise.all([req('POST','/grades',{gradeName:duplicateName}),req('POST','/grades',{gradeName:duplicateName})]);
check(raced.filter(r=>r.status===201).length===1&&raced.filter(r=>r.status===409).length===1,'Concurrent duplicate creates yield exactly one saved grade');
for(const item of raced.filter(r=>r.status===201))await req('DELETE','/grades/'+item.data.gradeId);
const parallel=await Promise.all([1,2,3].map(n=>req('POST','/grades',{gradeName:'Concurrent Unique '+n})));check(parallel.every(r=>r.status===201)&&new Set(parallel.map(r=>r.data.gradeId)).size===3,'Concurrent unique creates receive distinct IDs');
for(const item of parallel)await req('DELETE','/grades/'+item.data.gradeId);
check(hash(await get('/grades'))===hash(gradeBefore),'Original grade names, IDs and counts unchanged after test cleanup');check(hash(await get('/classes'))===hash(classesBefore),'Original classes unchanged');
for(const [e,original] of Object.entries(relations))check(hash(await get('/'+e))===hash(original),'Original relationship/history unchanged: '+e);
fs.writeFileSync(path.join(dir,'grade-management-api-results.json'),JSON.stringify({passed:checks.length,checks,requests,database:marker,mainDatabaseWrites:0},null,2));console.log(JSON.stringify({passed:checks.length,requests:requests.length,database:marker,mainDatabaseWrites:0}));
