import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-class-staff-'));
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
const summary=[], writes=[], waiting=new Map();
const user=(userId,name,role,status='active')=>({userId,fullName:name,userCode:'U'+userId,status,roles:[role]});
function reset(){state={mode:'ready',teachers:[{teacherClassId:1,teacherId:8,teacherName:'Existing Teacher',teacherCode:'T8',classId:100,status:'active'}],
  assistants:[{taClassId:2,taId:7,taName:'Existing Assistant',taCode:'TA7',classId:100,status:'active'}]};}
const users=[user(8,'Existing Teacher','teacher'),user(11,'New Teacher','teacher'),user(12,'Inactive Teacher','teacher','inactive'),
  user(6,'Student','student'),user(7,'Existing Assistant','teaching_assistant'),user(14,'New Assistant','teaching_assistant'),user(15,'Inactive Assistant','teaching_assistant','inactive')];
function fixture(endpoint){
  if(endpoint==='/api/classes/100')return {classId:100,className:'QA Math Class',subjectId:42,subjectName:'Toán 9',subjectCode:'MATH9',tuitionFee:1700000,startDate:'2026-11-07',endDate:'2026-12-07',status:'upcoming'};
  if(endpoint==='/api/teacherclasses')return [...state.teachers,{teacherClassId:90,teacherId:11,teacherName:'New Teacher',classId:101,status:'active'}];
  if(endpoint==='/api/taclasses')return state.assistants;
  if(endpoint==='/api/users')return users;
  if(endpoint==='/api/centersettings')return [{settingId:1,settingKey:'center_name',settingValue:'EduTrack Staff QA'}];
  return [];
}
function confirmed(kind,data){
  const selected=users.find(u=>u.userId===data.userId);
  const existing=(kind==='teachers'?state.teachers:state.assistants).find(row=>(kind==='teachers'?row.teacherId:row.taId)===data.userId);
  if(existing){existing.status='active';return existing;}
  const row=kind==='teachers'?{teacherClassId:91,teacherId:selected.userId,teacherName:selected.fullName,teacherCode:selected.userCode,classId:100,status:'active'}
    :{taClassId:92,taId:selected.userId,taName:selected.fullName,taCode:selected.userCode,classId:100,status:'active'};
  if(kind==='teachers')state.teachers.push(row);else state.assistants.push(row);
  return row;
}
function confirmedStop(kind,id){
  const row=(kind==='teachers'?state.teachers:state.assistants).find(row=>(kind==='teachers'?row.teacherClassId:row.taClassId)===id);
  row.status='inactive';return row;
}
async function paused(event){
  const url=new URL(event.request.url),endpoint=url.pathname;
  const fulfill=(body,type='application/json',code=200)=>send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},event.sessionId);
  if(url.origin===origin&&endpoint.startsWith('/api/')){
    if(event.request.method!=='GET'){
      if(event.request.method==='PATCH'){
        assert.match(endpoint,/^\/api\/classes\/100\/(teachers|assistants)\/\d+\/deactivate$/,'Only selected class staff status may change');
        assert.equal(event.request.postData,undefined,'deactivation has no arbitrary status or class payload');
        const parts=endpoint.split('/'),kind=parts[4],id=Number(parts[5]);writes.push({endpoint,method:'PATCH'});
        if(state.mode==='patch500')return fulfill(JSON.stringify({message:'Không lưu được trạng thái phân công.'}),'application/json',500);
        if(state.mode==='patch-malformed')return fulfill(JSON.stringify({success:true}));
        if(state.mode==='hold-patch'){waiting.set(event.requestId,{fulfill,kind,id,stopping:true});return;}
        return fulfill(JSON.stringify(confirmedStop(kind,id)));
      }
      assert.match(endpoint,/^\/api\/classes\/100\/(teachers|assistants)$/,'Only class staff assignments may be written');
      const data=JSON.parse(event.request.postData),kind=endpoint.split('/').at(-1);writes.push({endpoint,method:event.request.method,data});
      assert.equal(event.request.method,'POST');assert.deepEqual(Object.keys(data),['userId']);
      if(state.mode==='post409')return fulfill(JSON.stringify({message:'Giáo viên này đã được phân công vào lớp.'}),'application/json',409);
      if(state.mode==='post400')return fulfill(JSON.stringify({message:'Tài khoản không còn hoạt động.'}),'application/json',400);
      if(state.mode==='malformed')return fulfill(JSON.stringify({success:true}));
      if(state.mode==='hold-post'){waiting.set(event.requestId,{fulfill,kind,data});return;}
      return fulfill(JSON.stringify(confirmed(kind,data)));
    }
    if((state.mode==='users502'&&endpoint==='/api/users')||(state.mode==='teachers502'&&endpoint==='/api/teacherclasses'))
      return fulfill(JSON.stringify({message:'Staff QA unavailable'}),'application/json',502);
    if(state.mode==='hold-users'&&endpoint==='/api/users'){waiting.set(event.requestId,{fulfill,body:users});return;}
    return fulfill(JSON.stringify(fixture(endpoint)));
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
  for(const entry of waiting.values())await entry.fulfill(JSON.stringify(entry.stopping?confirmedStop(entry.kind,entry.id):entry.kind?confirmed(entry.kind,entry.data):entry.body));
  waiting.clear();
}
async function clickText(text,scope='document'){
  await evaluate(`(()=>{const b=[...${scope}.querySelectorAll('button,a')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!b)throw Error('Missing '+${JSON.stringify(text)});b.click();})()`);
}
async function selectUser(id){
  await evaluate(`(()=>{const n=document.querySelector('[name=staffUserId]');n.value=${JSON.stringify(String(id))};n.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
const options="[...document.querySelector('[name=staffUserId]').options].map(o=>o.value)";
const staffRow=name=>`[...document.querySelectorAll('[role=tabpanel] tbody tr')].find(r=>r.querySelector('td')?.textContent.includes(${JSON.stringify(name)}))`;
async function openStop(name){
  await evaluate(`document.querySelector(${JSON.stringify('[aria-label="Ngừng phân công '+name+'"]')}).click()`);
  await until("!!document.querySelector('#class-staff-stop-title')",'stop confirmation');
  assert.equal(await evaluate(`document.querySelector('.modal-body').textContent.includes(${JSON.stringify(name)})&&document.querySelector('.modal-body').textContent.includes('QA Math Class')`),true,'confirmation identifies exact person and class');
}
async function stopAndReassign(kind,name,id,role,viewport){
  let before=writes.length;await openStop(name);
  assert.equal(writes.length,before,'opening confirmation sends no command');
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  assert.equal(writes.length,before,'cancelling sends no command');
  await openStop(name);state.mode='patch500';await clickText('Xác nhận ngừng phân công');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('Không lưu được')",'failed stop remains in modal');
  assert.equal(await evaluate(`${staffRow(name)}.querySelectorAll('td')[1].textContent.trim()`),'Active','failed stop does not change visible assignment');
  state.mode='patch-malformed';await clickText('Xác nhận ngừng phân công');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('chưa xác nhận')",'malformed stop is not a success');
  before=writes.length;state.mode='hold-patch';
  await evaluate("(()=>{const b=document.querySelector('.modal button[type=submit]');b.click();b.click();})()");
  await until("document.querySelector('.modal button[type=submit]')?.disabled&&document.querySelector('.modal button[type=submit]').textContent.includes('Đang lưu')",'stop pending');
  assert.equal(writes.length,before+1,'double-click sends exactly one PATCH');
  assert.equal(await evaluate("document.querySelector('.modal-footer button[type=button]').disabled"),true,'cancel disabled during stop');
  const r=await evaluate("(()=>{const r=document.querySelector('.modal-content').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;})()");assert.equal(r,true,'stop confirmation fits viewport');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,viewport+'-'+role+'-stop-'+kind+'.png'),Buffer.from(shot.data,'base64'));
  state.mode='ready';await release();await until(`!document.querySelector('.modal')&&${staffRow(name)}?.querySelectorAll('td')[1]?.textContent.trim()==='Inactive'`,'stop persisted and row retained');
  assert.equal(await evaluate(`!!${staffRow(name)}.querySelector('button')`),false,'inactive assignment has no stop button');
  const count=(kind==='teachers'?state.teachers:state.assistants).length;
  const savedId=(kind==='teachers'?state.teachers:state.assistants).find(row=>(kind==='teachers'?row.teacherId:row.taId)===id)[kind==='teachers'?'teacherClassId':'taClassId'];
  await subjects(role);await until(`${staffRow(name)}?.querySelectorAll('td')[1]?.textContent.trim()==='Inactive'`,'inactive status survives page reload');
  await clickText(kind==='teachers'?'Phân công giáo viên':'Phân công trợ giảng');await until("!!document.querySelector('[name=staffUserId]')",'reactivation candidate list');
  assert.deepEqual(await evaluate(options),['',String(id)],'stopped account is eligible for reactivation');
  await selectUser(id);await clickText('Lưu phân công');
  await until(`!document.querySelector('.modal')&&${staffRow(name)}?.querySelectorAll('td')[1]?.textContent.trim()==='Active'`,'reactivation confirmed');
  const rows=kind==='teachers'?state.teachers:state.assistants;
  assert.equal(rows.length,count,'reactivation preserves existing row instead of duplicating it');
  assert.equal(rows.find(row=>(kind==='teachers'?row.teacherId:row.taId)===id)[kind==='teachers'?'teacherClassId':'taClassId'],savedId,'reactivation retains exact assignment ID');
}
async function subjects(role){
  await send('Page.navigate',{url:origin+`/${role}/classes/100`});
  await until("!!document.querySelector('[role=tablist]')",'class detail');
  await clickText('Subjects',"document.querySelector('[role=tablist]')");
  await until("[...document.querySelectorAll('button')].filter(n=>n.textContent.trim().startsWith('Phân công ')).length===2",'assignment actions');
}
async function scenario(role,viewport){
  reset();const label=viewport+' '+role;
  await subjects(role);await until("document.querySelector('[role=tabpanel]').textContent.includes('Existing Teacher')",'existing assignments');
  state.mode='hold-users';await clickText('Phân công giáo viên');
  await until("document.querySelector('.modal').textContent.includes('Đang tải danh sách')",'candidate loading');
  assert.equal(await evaluate("document.querySelector('.modal button[type=submit]').disabled"),true);
  state.mode='ready';await release();await until("!!document.querySelector('[name=staffUserId]')",'candidate list');
  assert.deepEqual(await evaluate(options),['','11'],'only active teachers, excluding existing same-class assignment, allowing another class');
  await selectUser(11);state.mode='post409';await clickText('Lưu phân công');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('đã được phân công')",'duplicate race error');
  assert.equal(await evaluate("document.querySelector('[name=staffUserId]').value"),'11','failed command retains selected account');
  assert.equal(state.teachers.length,1,'409 never inserts a local assignment');
  state.mode='malformed';await clickText('Lưu phân công');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('chưa xác nhận')",'malformed response is not success');
  assert.equal(state.teachers.length,1);
  const before=writes.length;state.mode='hold-post';
  await evaluate("(()=>{const b=document.querySelector('.modal button[type=submit]');b.click();b.click();})()");
  await until("document.querySelector('.modal button[type=submit]')?.disabled&&document.querySelector('.modal button[type=submit]').textContent.includes('Đang lưu')",'pending command');
  await until("document.querySelector('.modal button[aria-label=\"Đóng\"]').disabled",'pending close is disabled');
  assert.equal(writes.length,before+1,'double-click sends exactly one command');
  state.mode='ready';await release();await until("!document.querySelector('.modal')&&document.querySelector('[role=tabpanel]')?.textContent.includes('New Teacher')",'teacher saved and reloaded');
  await subjects(role);await until("document.querySelector('[role=tabpanel]').textContent.includes('New Teacher')",'teacher survives full navigation reload');
  await clickText('Phân công giáo viên');await until("document.querySelector('.modal')?.textContent.includes('Không còn giáo viên')",'all eligible teachers already assigned');
  assert.equal(await evaluate("document.querySelector('.modal button[type=submit]').disabled"),true);
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  await clickText('Phân công trợ giảng');await until("!!document.querySelector('[name=staffUserId]')",'assistant candidates');
  assert.deepEqual(await evaluate(options),['','14'],'assistant role is separate and inactive accounts are excluded');
  await selectUser(14);state.mode='post400';await clickText('Lưu phân công');
  await until("document.querySelector('.modal [role=alert]')?.textContent.includes('không còn hoạt động')",'stale account role/status error');
  state.mode='ready';await clickText('Lưu phân công');await until("!document.querySelector('.modal')&&document.querySelector('[role=tabpanel]')?.textContent.includes('New Assistant')",'assistant saved');
  assert.equal(state.teachers.length,2);assert.equal(state.assistants.length,2,'assigning assistant does not overwrite teacher');
  await stopAndReassign('teachers','New Teacher',11,role,viewport);
  await stopAndReassign('assistants','New Assistant',14,role,viewport);
  state.mode='users502';await clickText('Phân công trợ giảng');await until("document.querySelector('.modal [role=alert]')?.textContent.includes('502')",'users API failure');
  assert.equal(await evaluate("document.querySelector('.modal button[type=submit]').disabled"),true);
  state.mode='ready';await clickText('Thử lại',"document.querySelector('.modal')");await until("document.querySelector('.modal')?.textContent.includes('Không còn trợ giảng')",'retry is a real empty list');
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  const layout=await evaluate("document.documentElement.scrollWidth<=innerWidth+1");assert.equal(layout,true,label+' no page overflow');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,viewport+'-'+role+'-assignments.png'),Buffer.from(shot.data,'base64'));
  state.mode='teachers502';await subjects(role);await until("document.querySelector('[role=tabpanel]').textContent.includes('502')",'teacher query failure');
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Phân công giáo viên').disabled"),true);
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Phân công trợ giảng').disabled"),false,'teacher failure does not block assistant');
  reset();state.teachers=[];state.assistants=[];await subjects(role);
  await until("document.querySelector('[role=tabpanel]').textContent.includes('Chưa có phân công giáo viên.')&&document.querySelector('[role=tabpanel]').textContent.includes('Chưa có phân công trợ giảng.')",'unassigned labels');
  await clickText('Phân công giáo viên');await until("!!document.querySelector('[name=staffUserId]')",'responsive modal');
  const fits=await evaluate("(()=>{const r=document.querySelector('.modal-content').getBoundingClientRect(),s=document.querySelector('[name=staffUserId]').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&s.right<=r.right;})()");assert.equal(fits,true,label+' modal fits');
  const modal=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,viewport+'-'+role+'-modal.png'),Buffer.from(modal.data,'base64'));
  await clickText('Hủy bỏ',"document.querySelector('.modal')");
  summary.push(label);console.log('PASS '+label+': teacher/TA assignment, stop/cancel/errors/double-click/reload/reactivation and responsive layout');
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



  for(const [viewport,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const role of ['center-manager','admin-staff'])await scenario(role,viewport);
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,writes},null,2));
  console.log('RESULTS: '+summary.length+' role/viewport scenarios; '+writes.length+' intercepted assignment requests; no live Backend/MySQL.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
