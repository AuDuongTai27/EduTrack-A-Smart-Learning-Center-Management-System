import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';

let server, api, read, available, status;
const originalFetch=globalThis.fetch;
before(async()=>{
  server=await createServer({configFile:false,server:{middlewareMode:true,watch:null,ws:false},appType:'custom'});
  ({studentEnrollmentApi:api,readStudentEnrollments:read}=await server.ssrLoadModule('/src/api/studentEnrollmentApi.ts'));
  ({availableStudentClasses:available,enrollmentStatus:status}=await server.ssrLoadModule('/src/BLL/services/studentCenterEnrollmentService.ts'));
});
after(async()=>{globalThis.fetch=originalFetch;await server?.close();});
const row=(scId,classId,state='active')=>({scId,studentId:12,classId,className:'Real Class',status:state,enrolledDate:'2025-08-01',droppedAt:null,dropReason:null});
test('suggestions use Grade ID and exclude every existing relation including completed/dropped',()=>{
  const classes=[1,2,3,4,5].map(classId=>({classId,className:'Class '+classId,gradeId:70,status:'active'}));
  classes.push({classId:6,className:'Other',gradeId:80,status:'active'},{classId:7,className:'Closed',gradeId:70,status:'completed'});
  const rows=[row(1,1),row(2,2,'completed'),row(3,3,'dropped')], snapshot=structuredClone(rows);
  assert.deepEqual(available(classes,70,rows).map(c=>c.classId),[4,5]);
  assert.deepEqual(available(classes,80,rows).map(c=>c.classId),[6]);
  assert.deepEqual(available(classes,null,rows),[]);assert.deepEqual(rows,snapshot);
});
test('history distinguishes active/completed/dropped and unknown status is not actionable',()=>{
  assert.equal(status('active').label,'Đang học');assert.equal(status('active').canDrop,true);
  assert.equal(status('completed').label,'Đã hoàn thành');assert.equal(status('dropped').label,'Đã nghỉ');
  assert.equal(status('completed').canDrop,false);assert.equal(status('dropped').canDrop,false);assert.equal(status('unknown').canDrop,false);
});
test('scoped history rejects another student, duplicate pairs and malformed data',()=>{
  assert.deepEqual(read([row(1,1)],12),[row(1,1)]);
  for(const data of [[{...row(1,1),studentId:99}],[row(1,1),row(2,1)],[{...row(1,1),scId:0}],{}])assert.throws(()=>read(data,12));
});
test('read/add/drop use separate commands, never profile, invoice or payment endpoints',async()=>{
  const calls=[];
  globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json([row(1,1,calls.length===3?'dropped':'active')]);};
  await api.getForStudent(12);await api.add(12,70,[1]);await api.drop(12,1,'Reason');
  assert.deepEqual(calls.map(c=>c.url),['/api/studentclasses?studentId=12','/api/users/12/enrollments','/api/users/12/enrollments/1/drop']);
  assert.equal(calls[1].options.method,'POST');assert.deepEqual(JSON.parse(calls[1].options.body),{gradeId:70,classIds:[1]});
  assert.equal(calls[2].options.method,'PATCH');
});
test('server and ambiguous network errors never become enrollment success',async()=>{
  globalThis.fetch=async()=>Response.json({message:'History cannot be reopened'},{status:409});
  await assert.rejects(api.add(12,70,[1]),/History cannot be reopened/);
  globalThis.fetch=async()=>{throw Error('offline');};await assert.rejects(api.drop(12,1,''),/Tải lại lớp/);
  globalThis.fetch=async()=>Response.json([]);await assert.rejects(api.add(12,70,[1]),/chưa xác nhận/);
  globalThis.fetch=async()=>Response.json([row(1,1)]);await assert.rejects(api.drop(12,1,''),/Chưa xác nhận/);
});
