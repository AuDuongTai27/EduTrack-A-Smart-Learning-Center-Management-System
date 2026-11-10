import assert from 'node:assert/strict';
import {before,after,test} from 'node:test';
import {createServer} from 'vite';

let server,api,read;
const originalFetch=globalThis.fetch,token='A'.repeat(64);
const input={classId:801,mode:'single',scheduleId:41,sessionDate:'2027-01-13'};
const v={scheduleVersionId:51,effectiveFrom:'2027-01-04',effectiveTo:null,dayOfWeek:'Monday',startTime:'18:00:00',endTime:'20:00:00',room:'A'};
const template={scheduleId:41,classId:801,dayOfWeek:'Monday',startTime:'18:00:00',endTime:'20:00:00',room:'A',hasSessions:true,version:token,versions:[v]};
const change={classId:801,scheduleId:41,operation:'replace',effectiveFrom:'2027-01-11',dayOfWeek:'Wednesday',startTime:'19:00',endTime:'21:00',room:'B',version:token};
const affected={sessionId:91,scheduleVersionId:51,plannedOccurrenceDate:'2027-01-11',occurrenceWeekStart:'2027-01-11',sessionDate:'2027-01-12',startTime:'18:00:00',endTime:'20:00:00',room:'A',status:'scheduled',hasAttendance:false};
const row={key:'41:2027-01-11',scheduleId:41,classId:801,sessionDate:'2027-01-12',startTime:'18:00:00',endTime:'20:00:00',room:'A',outcome:'existing',reason:'Retained original occurrence',sessionId:91,
  plannedOccurrenceDate:'2027-01-11',occurrenceWeekStart:'2027-01-11',scheduleVersionId:51,proposedPlannedDate:'2027-01-13',status:'scheduled'};
const preview={previewToken:token,rows:[row],created:0};
before(async()=>{server=await createServer({configFile:false,server:{middlewareMode:true,watch:null,ws:false},appType:'custom'});const m=await server.ssrLoadModule('/src/api/scheduleManagementApi.ts');api=m.createScheduleManagementApi('/api', 501);read=m.readScheduleGeneration;});
after(async()=>{globalThis.fetch=originalFetch;await server?.close();});
test('capabilities use server roles and earliest future Monday; no client actor',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({canManageTemplates:false,canCreateSessions:true,classes:[{classId:801,className:'Real',status:'active',startDate:'2027-01-04',endDate:null}],earliestEffectiveFrom:'2026-11-16'});};
  assert.equal((await api.capabilities()).canCreateSessions,true);assert.equal(calls[0].url,'/api/schedule/management/capabilities?userId=501');assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.cache,'no-store');
  globalThis.fetch=async()=>Response.json({canManageTemplates:true,canCreateSessions:true,classes:[],earliestEffectiveFrom:'2027-01-05'});await assert.rejects(api.capabilities(),/không hợp lệ/);
});
test('timeline Preview and Confirm are separate commands and retained actual sessions are explicit',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({previewToken:token,operation:'replace',effectiveFrom:'2027-01-11',retainedSessions:[affected],message:'Keep generated sessions',template:calls.length===1?null:template});};
  const p=await api.previewTemplate(change);assert.equal(calls.length,1);assert.equal(p.retainedSessions[0].sessionDate,'2027-01-12');
  const result=await api.confirmTemplate({...change,previewToken:p.previewToken});assert.equal(result.template.scheduleId,41);
  assert.deepEqual(calls.map(c=>c.url),['/api/schedule/management/templates/preview?userId=501','/api/schedule/management/templates/confirm?userId=501']);
  assert.equal(JSON.parse(calls[1].options.body).operation,'replace');assert.equal(JSON.parse(calls[1].options.body).previewToken,token);
});
test('retire keeps stable root/version lineage and never submits a DELETE',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({previewToken:token,operation:'retire',effectiveFrom:'2027-02-01',retainedSessions:[],message:'Retained',template});};
  await api.confirmTemplate({...change,operation:'retire',effectiveFrom:'2027-02-01',previewToken:token});assert.equal(calls[0].options.method,'POST');assert.equal(JSON.parse(calls[0].options.body).scheduleId,41);
});
test('template lists reject missing/overlapping timeline and wrong class instead of empty success',async()=>{
  for(const value of [[template,template],[{...template,classId:999}],[{...template,versions:[]}],[{...template,versions:[v,{...v,scheduleVersionId:52,effectiveFrom:'2027-02-01'}]}]]){
    globalThis.fetch=async()=>Response.json(value);await assert.rejects(api.templates(801),/không hợp lệ/);
  }
});
test('planned week identity survives different weekday, actual date and cancellation',()=>{
  for(const status of ['scheduled','cancelled','completed'])assert.equal(read({...preview,rows:[{...row,status}]},input).rows[0].key,'41:2027-01-11');
  const moved={...row,sessionDate:'2027-03-02'};assert.equal(read({...preview,rows:[moved]},{classId:801,mode:'month',year:2027,month:1}).rows[0].sessionDate,'2027-03-02');
});
test('retained legacy TIME(6) precision survives preview response validation',()=>{
  assert.equal(read({...preview,rows:[{...row,startTime:'18:00:00.1234560',endTime:'20:00:00.6543210'}]},input).rows[0].startTime,'18:00:00.1234560');
});
test('cross-month proposed weekday finds an existing occurrence planned in preceding month',()=>{
  const crossed={...row,key:'41:2027-08-30',occurrenceWeekStart:'2027-08-30',plannedOccurrenceDate:'2027-08-31',sessionDate:'2027-09-02',proposedPlannedDate:'2027-09-01'};
  assert.equal(read({...preview,rows:[crossed]},{classId:801,mode:'month',year:2027,month:9}).rows[0].sessionId,91);
  assert.throws(()=>read({...preview,rows:[crossed]},{classId:801,mode:'month',year:2027,month:10}),/không hợp lệ/);
});
test('occurrence validation rejects malformed origin/week/source and duplicate keys',()=>{
  for(const replacement of [{classId:999},{plannedOccurrenceDate:'2027-02-30'},{occurrenceWeekStart:'2027-01-12'},{key:'41:2027-01-13'},{scheduleVersionId:0},{startTime:'25:00:00'},{outcome:'invented'},{sessionId:null}])
    assert.throws(()=>read({...preview,rows:[{...row,...replacement}]},input),/không hợp lệ/);
  assert.throws(()=>read({...preview,rows:[row,row]},input),/không hợp lệ/);assert.throws(()=>read({...preview,created:1},input),/không hợp lệ/);
});
test('all four preview outcomes are distinct and Confirm carries only the approved occurrence keys',async()=>{
  for(const outcome of ['eligible','existing','conflict','outside_class'])assert.equal(read({...preview,rows:[{...row,outcome,sessionId:outcome==='existing'?91:null}]},input).rows[0].outcome,outcome);
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({...preview,rows:[{...row,outcome:'created'}],created:1});};
  const result=await api.confirm({...input,previewToken:token,selectedKeys:[row.key]});assert.equal(result.created,1);assert.deepEqual(JSON.parse(calls[0].options.body).selectedKeys,[row.key]);
  assert.equal(JSON.parse(calls[0].options.body).teacherId,undefined);assert.equal(JSON.parse(calls[0].options.body).startTime,undefined);
});
test('mismatched Confirm token, unapproved created rows and wrong template do not report success',async()=>{
  globalThis.fetch=async()=>Response.json({...preview,previewToken:'B'.repeat(64)});await assert.rejects(api.confirm({...input,previewToken:token,selectedKeys:[row.key]}),/khác Preview/);
  globalThis.fetch=async()=>Response.json({...preview,rows:[{...row,outcome:'created'}],created:1});await assert.rejects(api.confirm({...input,previewToken:token,selectedKeys:[]}),/khác Preview/);
  globalThis.fetch=async()=>Response.json({previewToken:token,operation:'replace',effectiveFrom:'2027-01-11',retainedSessions:[],message:'ok',template:{...template,scheduleId:999}});
  await assert.rejects(api.confirmTemplate({...change,previewToken:token}),/không hợp lệ/);
});
test('401/403/409 and ambiguous network failures never become saved occurrences',async()=>{
  for(const code of [400,409,500]){globalThis.fetch=async()=>Response.json({message:'Conflict or forbidden'},{status:code});await assert.rejects(api.confirm(input),code===401?/Chưa xác thực/:/Conflict or forbidden/);}
  globalThis.fetch=async()=>{throw Error('offline');};await assert.rejects(api.confirm(input),/Chưa xác định được kết quả lưu/);await assert.rejects(api.previewTemplate(change),/Không kết nối/);
});
