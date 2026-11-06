import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-class-management-'));
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
let state;
const held = new Set();
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
const summary=[];
const writes=[];
const waiting=new Map();
const subjects=[{subjectId:42,subjectName:'Toán 7',subjectCode:'MATH7'},{subjectId:57,subjectName:'Tiếng Anh 7',subjectCode:'ENG7'}];
function freshClasses(count=24) {
  return Array.from({length:count},(_,index)=>({classId:100+index,className:`Lớp ${String(index+1).padStart(2,'0')}`,
    subjectId:index%2?57:42,subjectName:index%2?'Tiếng Anh 7':'Toán 7',subjectCode:index%2?'ENG7':'MATH7',room:null,
    tuitionFee:1_250_000,startDate:'2026-11-06',endDate:null,status:index%2?'inactive':'active'}));
}
const reset=(mode='ready',count=24)=>{state={mode,classes:freshClasses(count)};};
function fixture(endpoint) {
  if(endpoint==='/api/classes')return state.classes;
  if(endpoint==='/api/subjects')return subjects;
  if(endpoint==='/api/centersettings')return [{settingId:1,settingKey:'center_name',settingValue:'EduTrack Class QA'}];
  if(/^\/api\/classes\/\d+$/.test(endpoint)){
    const item=state.classes.find(c=>c.classId===Number(endpoint.split('/').at(-1)));
    return state.mode==='fresh-edit'?{...item,className:'Fresh server class',room:'Phòng X',tuitionFee:4_321_000}:item;
  }
  if(endpoint==='/api/studentclasses')return [{scId:1,studentId:6,studentName:'QA Learner',studentCode:'STU-QA',classId:100,status:'active',enrolledDate:'2026-11-06'},
    {scId:2,studentId:9,studentName:'Other Class Learner',classId:101,status:'active'}];
  if(endpoint==='/api/teacherclasses')return [{teacherClassId:1,teacherId:8,teacherName:'QA Teacher',teacherCode:'TC-QA',classId:100,status:'active'}];
  if(endpoint==='/api/taclasses')return [{taClassId:1,taId:7,taName:'QA Assistant',taCode:'TA-QA',classId:100,status:'active'}];
  if(endpoint==='/api/classschedules')return [{scheduleId:1,classId:100,dayOfWeek:'Monday',startTime:'17:30:00',endTime:'19:00:00',room:null}];
  if(endpoint==='/api/classsessions')return [{sessionId:1,classId:100,scheduleId:1,sessionDate:'2026-11-06',startTime:'17:30:00',endTime:'19:00:00',room:null,status:'scheduled'}];
  return [];
}
async function paused(event) {
  const url=new URL(event.request.url),endpoint=url.pathname;
  const fulfill=(body,type='application/json',code=200)=>send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},event.sessionId);
  if(url.origin===origin&&endpoint.startsWith('/api/')){
    const method=event.request.method;
    if(method!=='GET'){
      assert.match(endpoint,/^\/api\/classes(?:\/\d+)?$/,'Only class CRUD may be simulated');
      const data=event.request.postData?JSON.parse(event.request.postData):null;
      writes.push({method,endpoint,data});
      if((method==='POST'&&state.mode==='post400')||(method==='PUT'&&state.mode==='put400'))return fulfill(JSON.stringify({errors:{ClassName:['Tên lớp không được chấp nhận trong kiểm thử.']}}),'application/json',400);
      if(method==='DELETE'&&state.mode==='delete400')return fulfill(JSON.stringify({message:'Không thể xóa lớp vì có học viên đăng ký.'}),'application/json',400);
      if(method==='POST'){
        const item={...data,classId:900+writes.length,subjectName:subjects.find(s=>s.subjectId===data.subjectId)?.subjectName};
        state.classes=[item,...state.classes];return fulfill(JSON.stringify(item),'application/json',201);
      }
      const id=Number(endpoint.split('/').at(-1));
      if(method==='PUT'){
        const item={...state.classes.find(c=>c.classId===id),...data};state.classes=state.classes.map(c=>c.classId===id?item:c);
        return fulfill(JSON.stringify(item));
      }
      state.classes=state.classes.filter(c=>c.classId!==id);return fulfill(JSON.stringify({message:'Đã xóa lớp học.'}));
    }
    if((state.mode==='classes503'&&endpoint==='/api/classes')||(state.mode==='subjects503'&&endpoint==='/api/subjects')
      ||(state.mode==='detail503'&&/^\/api\/classes\/\d+$/.test(endpoint))||(state.mode==='teacher503'&&endpoint==='/api/teacherclasses'))
      return fulfill(JSON.stringify({message:'Class QA unavailable'}),'application/json',503);
    if(state.mode==='hold-classes'&&endpoint==='/api/classes'){waiting.set(event.requestId,{event,body:fixture(endpoint)});return;}
    if(state.mode==='hold-detail'&&endpoint==='/api/classes/100'){waiting.set(event.requestId,{event,body:fixture(endpoint)});return;}
    const body=fixture(endpoint);
    return fulfill(JSON.stringify(body??{message:'Không tìm thấy lớp học.'}),'application/json',body==null?404:200);
  }
  if(url.hostname==='cdn.jsdelivr.net'){
    if(endpoint.includes('bootstrap.min.css'))return fulfill(bootstrap,'text/css');
    if(endpoint.includes('bootstrap-icons.min.css'))return fulfill(icons,'text/css');
    return fulfill('',endpoint.endsWith('.js')?'text/javascript':'text/plain');
  }
  if(url.origin!==origin&&url.protocol.startsWith('http'))return fulfill('','text/plain');
  return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
}
async function release(){
  for(const [requestId,{event,body}] of waiting){
    await send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(JSON.stringify(body)).toString('base64')},event.sessionId).catch(()=>{});
  }
  waiting.clear();
}
async function clickText(text,scope='document'){
  await evaluate(`(()=>{const node=[...${scope}.querySelectorAll('button,a')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!node)throw Error('Missing action '+${JSON.stringify(text)});node.click();})()`);
}
async function value(selector,text){
  await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw Error('Missing '+${JSON.stringify(selector)});const select=node.tagName==='SELECT';Object.getOwnPropertyDescriptor(select?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(node,${JSON.stringify(String(text))});node.dispatchEvent(new Event(select?'change':'input',{bubbles:true}));})()`);
}
async function navigate(route){await send('Page.navigate',{url:origin+route});await until("!!document.querySelector('.page-title')",route+' header');}
const table="document.querySelector('table[aria-label=\"Danh sách lớp học\"]')";
const rows=`[...${table}.querySelectorAll('tbody tr')].filter(r=>!r.querySelector('td[colspan]'))`;
async function listReady(count=10){await until(`${rows}.length===${count}`,'class list '+count);}
async function action(title){await evaluate(`document.querySelector('button[title='+${JSON.stringify(JSON.stringify(title))}+']').click()`);}
async function fillValid(name='QA New Class'){
  await value('[name="className"]',name);await value('[name="subjectId"]','42');await value('[name="tuitionFee"]','0');
  await value('[name="startDate"]','2026-11-06');await value('[name="endDate"]','2026-12-06');
}
async function checkModalFits(label){
  const dimensions=await evaluate(`(()=>{const modal=document.querySelector('.modal-content').getBoundingClientRect(),footer=document.querySelector('.modal-footer').getBoundingClientRect();return {fits:modal.left>=0&&modal.right<=innerWidth+1&&modal.bottom<=innerHeight+1&&footer.bottom<=innerHeight+1};})()`);
  assert.equal(dimensions.fits,true,label+' modal fits including action buttons');
}
async function scenario(role,viewport){
  const route=`/${role}/classes`,label=viewport+' '+role;
  reset();await navigate(route);await listReady();
  assert.equal(await evaluate(`${rows}[0].querySelectorAll('td')[2].textContent.trim()`),'Lớp 01');
  await value('[aria-label="Tìm tên lớp"]','  Lớp 23 ');await listReady(1);
  await value('[aria-label="Tìm tên lớp"]','');await value('[aria-label="Lọc môn học"]','42');await value('[aria-label="Lọc trạng thái"]','active');await listReady();
  assert.equal(await evaluate(`${rows}.every(r=>r.textContent.includes('Toán 7')&&r.querySelectorAll('td')[7].textContent.trim().toLowerCase()==='active')`),true);
  await value('[aria-label="Lọc môn học"]','All');await value('[aria-label="Lọc trạng thái"]','All');
  await clickText('3',"document.querySelector('nav .pagination')");await listReady(4);
  await value('[aria-label="Sắp xếp lớp"]','za');await listReady();
  assert.equal(await evaluate(`${rows}[0].querySelectorAll('td')[2].textContent.trim()`),'Lớp 24');
  await value('[aria-label="Sắp xếp lớp"]','az');
  await clickText('Add Class');await until("!!document.querySelector('[name=className]')",'create form');await checkModalFits(label);
  assert.deepEqual(await evaluate("[...document.querySelector('[name=status]').options].map(o=>o.value)"),['active','upcoming']);
  assert.equal(await evaluate("document.querySelectorAll('.modal fieldset p.small').length"),0,'form has no extra helper paragraphs');
  assert.deepEqual(await evaluate("['subjectId','room','tuitionFee','startDate'].map(n=>document.querySelector('[name='+n+']').value)"),['','','','']);
  await value('[name="startDate"]','2026-01-31');
  assert.equal(await evaluate("document.querySelector('[name=endDate]').value"),'2026-02-28','create suggests one month with month-end clamping');
  await value('[name="endDate"]','2026-03-10');
  await value('[name="className"]','QA New Class');
  assert.equal(await evaluate("document.querySelector('[name=endDate]').value"),'2026-03-10','suggested end date stays editable');
  await value('[name="startDate"]','');await value('[name="className"]','');
  assert.equal(await evaluate("document.querySelector('[name=endDate]').value"),'','clearing start date clears its suggestion');
  const before=writes.length;
  await clickText('Tạo lớp học');await until("document.querySelectorAll('.invalid-feedback').length>=4",'required validation');assert.equal(writes.length,before);
  await fillValid();await value('[name="endDate"]','2026-11-05');await clickText('Tạo lớp học');
  await until("document.body.innerText.includes('Ngày kết thúc không được trước')",'date validation');assert.equal(writes.length,before);
  await value('[name="endDate"]','2026-12-06');await value('[name="tuitionFee"]','-1');await clickText('Tạo lớp học');
  await until("document.querySelector('#error-tuitionFee')!==null",'negative fee');assert.equal(writes.length,before);
  await value('[name="tuitionFee"]','0');await value('[name="endDate"]','2026-12-10');await value('[name="status"]','upcoming');state.mode='post400';await clickText('Tạo lớp học');
  await until("document.body.innerText.includes('Tên lớp không được chấp nhận')",'POST failure');
  assert.equal(await evaluate("document.querySelector('[name=className]').value"),'QA New Class');
  state.mode='ready';await evaluate("(()=>{const b=document.querySelector('.modal-footer button[type=submit]');b.click();b.click();})()");
  await until("!document.querySelector('.modal')",'POST success');assert.equal(writes.length,before+2,'one failed POST and one successful POST');
  assert.deepEqual(writes.at(-1).data,{className:'QA New Class',subjectId:42,room:null,tuitionFee:0,startDate:'2026-11-06',endDate:'2026-12-10',status:'upcoming'});
  await value('[aria-label="Tìm tên lớp"]','QA New Class');await listReady(1);
  assert.equal(await evaluate(`${rows}[0].textContent.includes('QA New Class')`),true);
  summary.push(label+' search/filter/sort/pagination and create validation/API failure/success');

  reset();await navigate(route);await listReady();state.mode='detail503';await action('Sửa Lớp 01');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('503')",'edit GET error');
  assert.equal(await evaluate("document.querySelector('[name=className]')===null"),true,'no stale edit data');
  state.mode='fresh-edit';await clickText('Thử lại',"document.querySelector('.modal')");
  await until("document.querySelector('[name=className]')?.value==='Fresh server class'",'fresh edit data');
  assert.deepEqual(await evaluate("[...document.querySelector('[name=status]').options].map(o=>o.value)"),['active','upcoming','completed','inactive']);
  assert.equal(await evaluate("document.querySelector('[name=tuitionFee]').value"),'4.321.000');
  await value('[name="startDate"]','2026-11-07');
  assert.equal(await evaluate("document.querySelector('[name=endDate]').value"),'','editing an existing class never replaces its end date');
  await value('[name="className"]','QA Updated Class');state.mode='put400';await clickText('Lưu thay đổi');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('Tên lớp')",'PUT failure');
  assert.equal(await evaluate("document.querySelector('[name=className]').value"),'QA Updated Class');
  state.mode='ready';await clickText('Lưu thay đổi');await until("!document.querySelector('.modal')",'PUT success');
  assert.equal(writes.at(-1).endpoint,'/api/classes/100');
  assert.equal(writes.at(-1).data.tuitionFee,4321000,'formatted class fee is submitted as a number');
  summary.push(label+' edit fresh GET, GET/PUT failure and retained draft');

  reset('ready',21);await navigate(route);await listReady();await clickText('3',"document.querySelector('nav .pagination')");await listReady(1);
  await action('Xóa Lớp 21');state.mode='delete400';await clickText('Xác nhận xóa');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('học viên')",'DELETE denial');
  assert.equal(await evaluate("!!document.querySelector('#class-delete-title')"),true);
  state.mode='ready';await clickText('Xác nhận xóa');await until("!document.querySelector('.modal')",'DELETE retry');await listReady();
  await until("document.querySelector('.pagination .active').textContent.trim()==='2'",'pagination clamped after delete');
  summary.push(label+' delete denial/retry and last-page clamp');

  reset('classes503');await navigate(route);await until("document.querySelector('[role=alert]')?.textContent.includes('503')",'list GET failure');
  assert.equal(await evaluate("document.body.innerText.includes('Chưa có lớp học nào.')"),false);
  state.mode='ready';await clickText('Tải lại');await listReady();
  reset('subjects503');await navigate(route);await listReady();await clickText('Add Class');
  await until("!!document.querySelector('[name=className]')",'subject failure form');
  assert.equal(await evaluate("document.querySelector('.modal-footer button[type=submit]').disabled"),true);
  await clickText('Hủy bỏ');
  reset('ready',0);await navigate(route);await until("document.body.innerText.includes('Chưa có lớp học nào.')",'real empty state');
  assert.equal(await evaluate("!!document.querySelector('.pagination')"),false);
  reset('hold-classes');await navigate(route);await until("document.body.innerText.includes('Đang nạp danh sách lớp học')",'loading state');
  await release();state.mode='ready';await listReady();
  summary.push(label+' independent list/subject errors, empty and loading states');

  reset();await navigate(route+'/100');await until("!!document.querySelector('[role=tablist]')",'class details');
  await clickText('Subjects',"document.querySelector('[role=tablist]')");await until("document.body.innerText.includes('QA Teacher')&&document.body.innerText.includes('QA Assistant')",'real assignments');
  await clickText('Students',"document.querySelector('[role=tablist]')");await until("document.body.innerText.includes('QA Learner')",'real student membership');
  assert.equal(await evaluate("document.body.innerText.includes('Other Class Learner')"),false);
  assert.equal(await evaluate("document.querySelector('[role=tabpanel]').innerText.includes('Chưa có dữ liệu theo môn')"),true);
  await clickText('Schedule',"document.querySelector('[role=tablist]')");await until("document.body.innerText.includes('Monday')&&document.body.innerText.includes('17:30')",'real schedules');
  reset('teacher503');await navigate(route+'/100');await until("!!document.querySelector('[role=tablist]')",'details loaded');await clickText('Subjects',"document.querySelector('[role=tablist]')");
  await until("document.querySelector('[role=tabpanel]').innerText.includes('503')&&document.body.innerText.includes('QA Assistant')",'independent assignment failure');
  await clickText('Students',"document.querySelector('[role=tablist]')");await until("document.body.innerText.includes('QA Learner')",'students despite teacher failure');
  reset('detail503');await navigate(route+'/100');await until("document.querySelector('[role=alert]')?.textContent.includes('503')",'detail error no fallback');
  assert.equal(await evaluate("!!document.querySelector('[role=tablist]')"),false);
  reset();await navigate(route+'/invalid');await until("document.querySelector('[role=alert]')?.textContent.includes('Mã lớp học không hợp lệ')",'invalid detail route');
  summary.push(label+' details overview/subjects/students/schedule and independent failures');

  reset();await navigate(route);await listReady();
  const layout=await evaluate("document.documentElement.scrollWidth<=innerWidth+1");assert.equal(layout,true,label+' page does not overflow');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(output,viewport+'-'+role+'-list.png'),Buffer.from(shot.data,'base64'));
  await clickText('Add Class');await checkModalFits(label);
  const formShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(output,viewport+'-'+role+'-form.png'),Buffer.from(formShot.data,'base64'));
  await clickText('Hủy bỏ');
  console.log('PASS '+label+': CRUD, search/filter/sort/pagination, independent errors, details and responsive layout');
}
try {
  const ws = await new Promise((resolve,reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'], {windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer = setTimeout(()=>reject(new Error('Chrome startup timed out')),10000);
    chrome.on('error',reject);
    chrome.stderr.on('data', chunk => { const match = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/); if(match) {clearTimeout(timer); resolve(match[1]);} });
  });
  socket = new WebSocket(ws);
  await new Promise((resolve,reject) => {socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const task=pending.get(message.id);if(task){clearTimeout(task.timer);pending.delete(message.id);message.error?task.reject(new Error(JSON.stringify(message.error))):task.resolve(message.result);} }
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
  console.log('RESULTS: '+summary.length+' scenario groups passed; '+writes.length+' intercepted CRUD requests; no live Backend/MySQL.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
