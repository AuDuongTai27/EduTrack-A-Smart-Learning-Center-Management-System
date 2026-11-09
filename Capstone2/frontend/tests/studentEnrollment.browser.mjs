import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-student-enrollment-'));
const profile = path.join(output, 'chrome-profile');
const bootstrap = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap.min.css'));
const icons = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap-icons.css'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2'};
const server = http.createServer((req, res) => {
  const requested = path.resolve(dist, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!requested.startsWith(dist + path.sep) && requested !== dist) { res.writeHead(403).end(); return; }
  const file = fs.existsSync(requested) && fs.statSync(requested).isFile() ? requested : path.join(dist, 'index.html');
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let chrome;
let socket;
let sequence = 0;
let session;
const pending = new Map();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, target = session) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params, ...(target ? {sessionId:target} : {})}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression, description) {
  const end = Date.now() + 15000;
  while (Date.now() < end) { if (await evaluate(expression)) return; await delay(30); }
  throw new Error(`Timed out: ${description}`);
}

const summary = [], writes = [], waiting = [];
const grades = [{gradeId:70, gradeName:'Khối 7'}, {gradeId:80, gradeName:'Khối 8'}, {gradeId:90, gradeName:'Khối 9'}];
const classes = [
  {classId:1,gradeId:70,className:'7 Toán',subjectName:'Toán',status:'active'},
  {classId:2,gradeId:70,className:'7 Anh',subjectName:'Anh',status:'upcoming'},
  {classId:3,gradeId:80,className:'8 Toán',subjectName:'Toán',status:'active'},
  ...['inactive','completed','cancelled','unknown'].map((status,i)=>({classId:4+i,gradeId:70,className:'Closed '+status,status})),
  {classId:10,gradeId:null,className:'Unclassified',status:'active'},
];
let mode = 'ready', saved = [], links = [];
async function paused(event) {
  const url = new URL(event.request.url), endpoint = url.pathname;
  const fulfill = (body, type='application/json', code=200) => send('Fetch.fulfillRequest', {
    requestId:event.requestId, responseCode:code, responseHeaders:[{name:'Content-Type',value:type}],
    body:Buffer.from(typeof body==='string'?body:JSON.stringify(body)).toString('base64'),
  }, event.sessionId);
  if (url.origin===origin && endpoint.startsWith('/api/')) {
    if (event.request.method==='PUT' && /^\/api\/users\/\d+$/.test(endpoint)) {
      const body=JSON.parse(event.request.postData), user=saved.find(u=>u.userId===Number(endpoint.split('/').at(-1)));
      writes.push({endpoint,method:'PUT',body});
      Object.assign(user,body);
      return fulfill(user);
    }
    if (event.request.method==='POST' && endpoint==='/api/parentstudents') {
      const body=JSON.parse(event.request.postData);
      writes.push({endpoint,method:'POST',body});
      if(!body.parentId||!body.studentId)return fulfill({message:'Vui lòng chọn đủ phụ huynh và học sinh.'},'application/json',400);
      const existing=links.find(l=>l.parentId===body.parentId&&l.studentId===body.studentId);
      if(existing&&!body.updateExisting)return fulfill({message:'Liên kết đã tồn tại.'},'application/json',409);
      if(existing)Object.assign(existing,body);else links.push({...body,parentName:'Parent',studentName:'Student'});
      return fulfill(existing??links.at(-1));
    }
    if (event.request.method==='POST') {
      assert.ok(['/api/users/students','/api/users'].includes(endpoint), 'Only student/parent creation is permitted');
      const body = JSON.parse(event.request.postData);
      writes.push({endpoint,body});
      if (mode==='reject') return fulfill({message:'Lớp không còn nhận ghi danh; vui lòng chọn lại lớp.'},'application/json',400);
      const existing = saved.find(u=>u.userCode===body.userCode);
      if(existing && (existing.fullName!==body.fullName || JSON.stringify(existing.classIds)!==JSON.stringify(body.classIds)))
        return fulfill({code:'student_creation_conflict',message:'Yêu cầu đã được lưu với thông tin khác; xem hồ sơ đã lưu.',existingStudentId:existing.userId,existingStudentCode:existing.userCode},'application/json',409);
      const user = existing ?? {...body,userId:100+saved.length,userCode:body.userCode??'PAR_TEST',roles:[body.role]};
      if(!existing)saved.push(user);
      if(mode==='lost-response')return fulfill({message:'Chưa xác nhận kết quả. Giữ nguyên form và thử lại.'},'application/json',503);
      return fulfill(user,'application/json',201);
    }
    if(endpoint==='/api/grades')return mode==='grade-error'?fulfill({message:'Grade API unavailable'},'application/json',503):fulfill(grades);
    if(endpoint==='/api/classes') {
      if(mode==='hold'){waiting.push({event,fulfill});return;}
      if(mode==='class-error')return fulfill({message:'Class API unavailable'},'application/json',503);
      return fulfill(classes);
    }
    if(endpoint==='/api/users')return fulfill(saved);
    if(/^\/api\/users\/\d+$/.test(endpoint))return fulfill(saved.find(u=>u.userId===Number(endpoint.split('/').at(-1))) ?? {userId:1,userCode:'STAFF_TEST',fullName:'Synthetic Staff',roles:['center_manager','admin_staff']});
    if(endpoint==='/api/parentstudents')return fulfill(links);
    if(endpoint==='/api/studentclasses') {
      if(mode==='edit-history-error')return fulfill({message:'Enrollment history unavailable'},'application/json',503);
      const studentId=Number(url.searchParams.get('studentId'));
      return fulfill(saved.filter(u=>u.userId===studentId).flatMap(u=>(u.classIds??[]).map(classId=>({scId:u.userId*100+classId,studentId:u.userId,classId,className:classes.find(c=>c.classId===classId)?.className??'History Class',status:'active',enrolledDate:'2025-08-01',droppedAt:null,dropReason:null}))));
    }
    if(endpoint==='/api/centersettings')return fulfill([]);
    return fulfill([]);
  }
  if(url.hostname==='cdn.jsdelivr.net') {
    if(endpoint.includes('bootstrap.min.css'))return fulfill(bootstrap.toString(),'text/css');
    if(endpoint.includes('bootstrap-icons.min.css'))return fulfill(icons.toString(),'text/css');
    return fulfill('','text/plain');
  }
  if(url.origin!==origin&&url.protocol.startsWith('http'))return fulfill('','text/plain');
  return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
}
async function clickText(text, scope='document') {
  await evaluate(`(()=>{const node=[...${scope}.querySelectorAll('button,a')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!node)throw Error('Missing '+${JSON.stringify(text)});node.click();})()`);
}
async function value(selector,text) {
  await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw Error('Missing field');const select=node.tagName==='SELECT';Object.getOwnPropertyDescriptor(select?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(node,${JSON.stringify(text)});node.dispatchEvent(new Event(select?'change':'input',{bubbles:true}));})()`);
}
const section = "document.querySelector('.modal section')";
const checkboxes = `${section}.querySelectorAll('input[type=checkbox]')`;
const gradeField = '.modal .col-md-12 select';
async function ready(count=2) {await until(`${checkboxes}.length===${count+1}`, 'eligible classes loaded');}
async function checked(index) {await evaluate(`${checkboxes}[${index}].click()`);}
async function count(number) {await until(`${section}.textContent.includes('Đã chọn ${number} lớp')`, 'selected count '+number);}
async function open(modeValue='ready') {
  mode=modeValue; await clickText('Add Student'); await until(`!!${section}`,'enrollment section');
  if(modeValue==='grade-error')return;
  await until("!!document.querySelector('.modal [aria-label=\"Khối lớp\"] option[value=\"70\"]')",'Grade catalogue loaded');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'','no default Grade');
  await value(gradeField,'70');
}
async function scenario(role,viewport) {
  mode='ready';saved=[];links=[];
  grades.splice(0,grades.length,{gradeId:70,gradeName:'Khối 7'},{gradeId:80,gradeName:'Khối 8'},{gradeId:90,gradeName:'Khối 9'});
  await send('Page.navigate',{url:origin+'/'+role+'/students'});
  await until("!![...document.querySelectorAll('button')].find(n=>n.textContent.trim()==='Add Student')",'student page');
  await evaluate("sessionStorage.removeItem('edutrack:add-student:attempt')");
  await open('hold');
  await until(`${section}.textContent.includes('Đang tải lớp học')`,'loading state');
  mode='ready';
  await value(gradeField,'80');await ready(1);
  await checked(1);await count(1);
  for(const item of waiting.splice(0))await item.fulfill(classes);
  await delay(100);
  assert.equal(await evaluate(`${section}.textContent.includes('8 Toán')&&!${section}.textContent.includes('7 Toán')`),true,'late grade response ignored');
  await value(gradeField,'70');await ready();await count(0);
  assert.equal(await evaluate("document.querySelectorAll('.modal select').length"),2,'existing gender and Grade dropdowns only');
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.modal input:not([type=checkbox])')].map(n=>n.type)"),['text','tel','email'],'existing profile fields preserved');
  assert.equal(await evaluate(`${section}.textContent.includes('Closed')||${section}.textContent.includes('Unclassified')`),false,'ineligible classes hidden');
  await checked(1);await count(1);
  assert.equal(await evaluate(`${checkboxes}[0].indeterminate`),true,'select all has mixed state');
  await checked(2);await count(2);
  await checked(0);await count(0);
  await checked(0);await count(2);
  await value(gradeField,'80');await ready(1);await count(0);
  await value(gradeField,'90');
  await until(`${section}.textContent.includes('chưa có lớp đủ điều kiện')`,'empty state');
  await value(gradeField,'70');await ready();
  await value('.modal input[type=text]', 'Synthetic '+role);
  await value(gradeField,'');
  // No-class creation is valid and does not call the old multi-step enrollment API.
  await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("!document.querySelector('.modal')",'profile saved without classes');
  assert.deepEqual(writes.at(-1).body.classIds,[]);
  await open();await ready();await checked(0);await count(2);
  await value('.modal input[type=text]', 'Multiple '+role);
  mode='reject';await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('không còn nhận ghi danh')",'enrollment failure visible in modal');
  assert.equal(await evaluate("!!document.querySelector('.modal')"),true,'failure retains form');
  const attempt=writes.at(-1).body.userCode;
  mode='lost-response';await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('Chưa xác nhận')",'uncertain commit displayed');
  assert.equal(writes.at(-1).body.userCode,attempt,'failed transaction reuses code');
  const rowsBefore=saved.length;
  mode='ready';await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("!document.querySelector('.modal')",'retry success');
  assert.equal(saved.length,rowsBefore,'lost response retry does not duplicate profile');
  assert.equal(writes.at(-1).body.userCode,attempt,'lost response reuses code');
  assert.equal(writes.at(-1).body.gradeId,70,'actual grade ID sent');
  assert.deepEqual(writes.at(-1).body.classIds.sort(),[1,2]);

  await open();await ready();await checked(1);
  await value('.modal input[type=text]','Original before lost response');
  mode='lost-response';await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('Chưa xác nhận')",'save before changed retry');
  await value('.modal input[type=text]','Changed after lost response');
  mode='ready';await clickText('Lưu hồ sơ',"document.querySelector('.modal')");
  await until("!![...document.querySelectorAll('.modal button')].find(n=>n.textContent==='Xem hồ sơ đã lưu')",'changed replay recovery');
  const savedCount=saved.length;
  await clickText('Xem hồ sơ đã lưu');
  await until("document.querySelector('.modal')?.textContent.includes('Hồ sơ chi tiết')",'confirmed existing profile shown');
  assert.equal(await evaluate("document.querySelector('.modal').textContent.includes('Original before lost response')"),true);
  assert.equal(saved.length,savedCount,'viewing saved profile cannot create duplicates');
  assert.equal(await evaluate("sessionStorage.getItem('edutrack:add-student:attempt')"),null,'identity released after inspecting confirmed profile');
  await clickText('Đóng',"document.querySelector('.modal')");

  await open('class-error');
  await until(`${section}.textContent.includes('Class API unavailable')`,'class error state');
  mode='ready';await clickText('Tải lại danh sách lớp');await ready();await count(0);
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  await open('grade-error');
  await until("document.querySelector('.modal').textContent.includes('Grade API unavailable')",'grade error state');
  mode='ready';await clickText('Tải lại khối lớp');await value(gradeField,'70');await ready();
  await value(gradeField,'');
  await until(`${section}.textContent.includes('Chọn khối lớp')`,'no Grade is not guessed');
  await value(gradeField,'70');await ready();await checked(0);await count(2);
  const dimensions=await evaluate(`(()=>{const m=document.querySelector('.modal-content').getBoundingClientRect();return {left:m.left,right:m.right,width:innerWidth,scroll:${section}.scrollWidth,client:${section}.clientWidth}})()`);
  assert.ok(dimensions.left>=0&&dimensions.right<=dimensions.width+1&&dimensions.scroll<=dimensions.client+1,'responsive modal and enrollment do not overflow');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
  fs.writeFileSync(path.join(output,viewport+'-'+role+'-enrollment.png'),Buffer.from(shot.data,'base64'));
  await evaluate("document.querySelector('.modal button[type=submit]').scrollIntoView({block:'center'})");
  assert.equal(await evaluate("(()=>{const r=document.querySelector('.modal button[type=submit]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"),true,'save button reachable by scrolling on every viewport');
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  // Parent flow still uses the preexisting endpoint and has no enrollment fields.
  await evaluate("[...document.querySelectorAll('button')].find(n=>n.textContent.includes('Phụ huynh (Parents)')).click()");
  await clickText('Add Parent');
  assert.equal(await evaluate("!!document.querySelector('.modal section')"),false,'parent form unchanged');
  await value('.modal input[type=text]','Synthetic Parent');
  await clickText('Lưu hồ sơ',"document.querySelector('.modal')");await until("!document.querySelector('.modal')",'parent saved');
  assert.equal(writes.at(-1).endpoint,'/api/users');
  summary.push(viewport+' '+role+': selection, Grade changes/race, API errors, atomic request/retry and parent regression');
  console.log('PASS '+summary.at(-1));
  await gradeAndLinksScenario(role,viewport);
}
async function gradeAndLinksScenario(role,viewport) {
  const student=(userId,userCode,fullName,gradeId,patch={})=>({userId,userCode,fullName,gradeId,status:'active',gender:'male',roles:['student'],classIds:[],...patch});
  saved=[student(11,'STU_EDIT','Editable Student',70), student(12,'STU_ENROLLED','Enrolled Student',70,{classIds:[1]}),
    student(13,'STU_LEGACY','Legacy Student',null,{specialty:'Class 7'}),student(14,'STU_INVALID','Invalid Student',999,{gradeName:'Khối 7'}),
    {userId:21,userCode:'PAR_ONE',fullName:'Parent One',roles:['parent'],status:'active'},
    {userId:22,userCode:'PAR_TWO',fullName:'Parent Two',roles:['parent'],status:'active'}];
  links=[{parentId:21,studentId:11,relationship:'Father',isPrimaryContact:false,parentName:'Parent One',studentName:'Editable Student'}];
  mode='ready';
  const rows="[...document.querySelectorAll('table tbody tr')].filter(r=>!r.querySelector('td[colspan]'))";
  const modal="document.querySelector('.modal')";
  async function rowAction(code,title) {
    await evaluate(`(()=>{const row=${rows}.find(r=>r.textContent.includes(${JSON.stringify(code)}));if(!row)throw Error('Missing row');row.querySelector('button[title='+${JSON.stringify(JSON.stringify(title))}+']').click();})()`);
  }
  async function listReady() {await until(`${rows}.some(r=>r.textContent.includes('STU_EDIT'))`,'fixture students');}
  await send('Page.navigate',{url:origin+'/'+role+'/students'});await listReady();
  await clickText('Add Student');
  await until("document.querySelector('.modal [aria-label=\"Khối lớp\"]')?.options.length===4",'actual Grade options');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'');
  assert.equal(await evaluate("[...document.querySelectorAll('.modal [aria-label=\"Khối lớp\"] option')].some(o=>o.textContent==='Class 7')"),false,'no Class 7 choice');
  grades.push({gradeId:105,gradeName:'Luyện thi mới'});
  await evaluate("window.dispatchEvent(new Event('focus'))");
  await until("!!document.querySelector('.modal [aria-label=\"Khối lớp\"] option[value=\"105\"]')",'new Grade appears without page reload');
  await value(gradeField,'105');await value('.modal input[type=text]','Custom Grade Student');
  await clickText('Lưu hồ sơ',modal);await until(`!${modal}`,'custom Grade saved');
  assert.equal(writes.at(-1).body.gradeId,105);

  await rowAction('STU_EDIT','Sửa thông tin');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'70','Edit shows actual stored Grade');
  assert.equal(await evaluate(`${modal}.textContent.includes('Chuyên môn')`),false,'Student Grade label has no Specialty text');
  await value(gradeField,'80');await clickText('Cập nhật hồ sơ',modal);await until(`!${modal}`,'Grade update saved');
  assert.equal(saved.find(u=>u.userId===11).gradeId,80);
  await send('Page.reload');await listReady();
  await rowAction('STU_EDIT','Sửa thông tin');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'80','Grade persists after refresh');
  await clickText('Hủy bỏ',modal);
  grades.find(g=>g.gradeId===80).gradeName='Khối Tám mới';
  await evaluate("window.dispatchEvent(new Event('focus'))");
  await until(`${rows}.find(r=>r.textContent.includes('STU_EDIT'))?.textContent.includes('Khối Tám mới')`,'renamed Grade reflected in table');
  await rowAction('STU_EDIT','Xem chi tiết hồ sơ');
  await until(`${modal}?.textContent.includes('Khối Tám mới')`,'renamed Grade reflected in details');
  await clickText('Đóng',modal);
  await value('[aria-label="Lọc khối lớp"]','70');
  await until(`${rows}.length===1`,'exact Grade ID filter');
  assert.equal(await evaluate(`${rows}[0].textContent.includes('STU_ENROLLED')`),true,'legacy string Class 7 is not mapped to Grade 70');
  await value('[aria-label="Lọc khối lớp"]','invalid');await until(`${rows}.length===1`,'invalid Grade filter');
  assert.equal(await evaluate(`${rows}[0].textContent.includes('không còn hợp lệ')`),true,'deleted Grade not relinked');
  await value('[aria-label="Lọc khối lớp"]','All');
  await value('[aria-label="Sắp xếp học sinh"]','grade-az');
  await until(`${rows}[0]?.textContent.includes('STU_ENROLLED')`,'Grade ascending sort');
  await value('[aria-label="Sắp xếp học sinh"]','grade-za');
  await until(`${rows}[0]?.textContent.includes('Custom Grade Student')`,'Grade descending sort includes new Grade');

  await rowAction('STU_LEGACY','Sửa thông tin');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'');
  assert.equal(await evaluate(`${modal}.textContent.includes('Dữ liệu cũ: Class 7')`),true,'legacy text preserved visibly');
  await clickText('Cập nhật hồ sơ',modal);await until(`!${modal}`,'legacy unrelated edit');
  assert.equal(Object.hasOwn(writes.at(-1).body,'gradeId'),false,'unchanged legacy Grade is not overwritten');
  assert.equal(saved.find(u=>u.userId===13).specialty,'Class 7');
  await rowAction('STU_LEGACY','Sửa thông tin');await value(gradeField,'105');
  await clickText('Cập nhật hồ sơ',modal);await until(`!${modal}`,'legacy explicitly linked');
  assert.equal(saved.find(u=>u.userId===13).specialty,'Class 7','explicit Grade link retains original specialty');
  await rowAction('STU_ENROLLED','Sửa thông tin');await value(gradeField,'80');
  assert.equal(await evaluate(`${modal}.textContent.includes('không điều chỉnh các lớp đã ghi danh')`),true,'school Grade meaning explained');
  const enrolledBefore=structuredClone(saved.find(u=>u.userId===12).classIds);
  await clickText('Cập nhật hồ sơ',modal);
  await until(`!${modal}`,'school Grade update with enrollment succeeds');
  assert.equal(saved.find(u=>u.userId===12).gradeId,80);
  assert.deepEqual(saved.find(u=>u.userId===12).classIds,enrolledBefore,'enrollment retained across school Grade update');
  await send('Page.reload');await listReady();
  await rowAction('STU_ENROLLED','Sửa thông tin');
  assert.equal(await evaluate("document.querySelector('.modal [aria-label=\"Khối lớp\"]').value"),'80','independent school Grade survives refresh');
  await clickText('Hủy bỏ',modal);
  mode='edit-history-error';await rowAction('STU_ENROLLED','Sửa thông tin');
  const center="document.querySelector('[data-testid=\"student-center-classes\"]')";
  await until(`${center}?.textContent.includes('Enrollment history unavailable')`,'Edit enrollment history error');
  assert.equal(await evaluate(`[...${center}.querySelectorAll('button')].find(b=>b.textContent==='Đăng ký các lớp đã chọn').disabled`),true,'unknown history blocks enrollment');
  mode='ready';await clickText('Tải lại lớp',center);await until(`${center}.querySelectorAll('[data-enrollment-id]').length===1`,'history retry succeeds');
  await clickText('Hủy bỏ',modal);

  await clickText('Tạo liên kết PH - HS');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Chọn phụ huynh\"]').value"),'');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Chọn học sinh\"]').value"),'');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Mối quan hệ\"]').value"),'Mother');
  const before=writes.length;
  await evaluate("document.querySelector('.modal form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
  await until(`${modal}.textContent.includes('Vui lòng chọn đầy đủ')`,'missing parties rejected');
  assert.equal(writes.length,before,'no API write for missing parties');
  await value('[aria-label="Chọn phụ huynh"]','21');await value('[aria-label="Chọn học sinh"]','11');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Mối quan hệ\"]').value"),'Father','existing Father remains selected');
  assert.equal(await evaluate("document.querySelector('#primaryContactCheck').checked"),false,'saved contact flag loaded');
  await clickText('Xác nhận liên kết',modal);await until(`!${modal}`,'existing link saved');
  assert.equal(links[0].relationship,'Father');assert.equal(links.length,1,'no duplicate existing pair');
  await clickText('Tạo liên kết PH - HS');
  await value('[aria-label="Chọn phụ huynh"]','22');await value('[aria-label="Chọn học sinh"]','11');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Mối quan hệ\"]').value"),'Mother');
  await clickText('Xác nhận liên kết',modal);await until(`!${modal}`,'new link saved');
  assert.equal(links.at(-1).relationship,'Mother');assert.equal(links[0].relationship,'Father');
  await rowAction('STU_EDIT','Gán phụ huynh cho học sinh này');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Chọn phụ huynh\"]').value"),'','context form has no arbitrary counterpart');
  await clickText('Đóng',modal);
  summary.push(viewport+' '+role+': dynamic school Grades, persisted Edit/refresh, unchanged enrollment/history, rename/filter/sort, legacy and parent-link defaults');
  console.log('PASS '+summary.at(-1));
}

try {
  const ws = await new Promise((resolve,reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,...JSON.parse(process.env.CHROME_ARGS_JSON || '[]'),'about:blank'], {windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer = setTimeout(()=>reject(new Error('Chrome startup timed out')),10000);
    chrome.on('error',reject);
    chrome.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if(match) {clearTimeout(timer); resolve(match[1]);} });
  });
  socket = new WebSocket(ws);
  await new Promise((resolve,reject) => {socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task=pending.get(message.id);if(task){clearTimeout(task.timer);pending.delete(message.id);if(message.error)task.reject(new Error(JSON.stringify(message.error)));else task.resolve(message.result);} }
    else if (message.method === 'Fetch.requestPaused') paused({...message.params, sessionId:message.sessionId}).catch(error=>{ console.error(error.message); });
  });
  const target = await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});


  for(const [viewport,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const role of ['center-manager','admin-staff'])await scenario(role,viewport);
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,writes},null,2));
  console.log('RESULTS: '+summary.length+' scenario groups passed; '+writes.length+' intercepted student requests; no live Backend/MySQL.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
