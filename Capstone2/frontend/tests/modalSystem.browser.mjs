import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = path.resolve(root, '../../tmp/kan103/browser');
fs.mkdirSync(output, {recursive:true});
const profile = path.join(output, 'chrome-profile');
const bootstrap = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap.min.css'));
const icons = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap-icons.css'));
const iconFont = process.env.EDUTRACK_ICON_FONT ? fs.readFileSync(process.env.EDUTRACK_ICON_FONT) : null;
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

// Every API request is intercepted. This test never contacts the development API.
const grades = [{gradeId:70, gradeName:'Grade 7'}, {gradeId:80, gradeName:'Grade 8'}];
const classes = [
  {classId:1, gradeId:70, className:'Grade 7 Mathematics', subjectName:'Mathematics', status:'active'},
  {classId:2, gradeId:70, className:'Grade 7 English', subjectName:'English', status:'upcoming'},
  {classId:3, gradeId:80, className:'Grade 8 Mathematics', subjectName:'Mathematics', status:'active'},
  {classId:4, gradeId:70, className:'Closed class', status:'completed'},
];
let currentRole = 'center_manager', mode = 'ready', saved = [], pendingSave;
let userReads = 0, classReads = 0;
const writes = [], summary = [], faults = [], screenshots = [];
const account = () => ({userId:42, userCode:'QA_ACCOUNT', fullName:'Synthetic Account', roles:[currentRole], primaryRole:currentRole, status:'active'});
const baseUsers = [{userId:11,userCode:'STU_EXISTING',fullName:'Existing Student',roles:['student'],status:'active',gradeId:70},
  {userId:21,userCode:'PAR_EXISTING',fullName:'Existing Parent',roles:['parent'],status:'active'}];
async function paused(event) {
  const url = new URL(event.request.url), endpoint = url.pathname;
  const fulfill = (body, type='application/json', code=200) => send('Fetch.fulfillRequest', {
    requestId:event.requestId, responseCode:code, responseHeaders:[{name:'Content-Type',value:type}],
    body:Buffer.from(typeof body==='string'?body:JSON.stringify(body)).toString('base64'),
  }, event.sessionId);
  if (endpoint.startsWith('/api/')) {
    if (event.request.method === 'POST') {
      assert.equal(endpoint, '/api/users/students', 'Only the atomic student API may receive a write');
      const body = JSON.parse(event.request.postData); writes.push({endpoint,body});
      if (mode === 'hold') {pendingSave = () => fulfillStudent(body, fulfill); return;}
      return fulfillStudent(body, fulfill);
    }
    assert.equal(event.request.method, 'GET', 'No unexpected API mutations');
    if (endpoint === '/api/user-selection') return fulfill([account()]);
    if (endpoint === '/api/grades') return mode === 'grade-error' ? fulfill({message:'Grade catalogue unavailable'}, 'application/json',503) : fulfill(grades);
    if (endpoint === '/api/classes') {classReads++; return mode === 'class-error' ? fulfill({message:'Class catalogue unavailable'}, 'application/json',503) : fulfill(classes);}
    if (endpoint === '/api/users') {userReads++; return fulfill([account(),...baseUsers,...saved]);}
    if (/^\/api\/users\/\d+$/.test(endpoint)) return fulfill([...baseUsers,...saved,account()].find(user => user.userId === Number(endpoint.split('/').at(-1))));
    if (endpoint === '/api/parentstudents') return fulfill([{parentId:21,studentId:11,relationship:'Father',isPrimaryContact:false}]);
    if (endpoint === '/api/schedule/classes') return fulfill([{classId:1,className:'Grade 7 Mathematics',startDate:'2026-01-01',endDate:null,status:'active'}]);
    if (endpoint === '/api/schedule/sessions') return fulfill([{sessionId:7,classId:1,className:'Grade 7 Mathematics',scheduleId:null,subjectId:1,subjectName:'Mathematics',sessionDate:url.searchParams.get('from'),startTime:'18:00',endTime:'20:00',room:'Room A',status:'scheduled',teachers:[{userId:50,name:'Synthetic Teacher'}],teachingAssistants:[],hasAttendance:false}]);
    if (endpoint === '/api/notifications/inbox/snapshot') return fulfill({identity:{...account(),email:null,avatarUrl:null},serverNowUtc:new Date().toISOString(),inbox:[],trash:[],unreadCount:0});
    if (endpoint.includes('notifications')) return fulfill([]);
    return fulfill([]);
  }
  if (url.hostname === 'cdn.jsdelivr.net') {
    if (endpoint.endsWith('.woff2')) {
      if (!iconFont) return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
      return send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'font/woff2'},{name:'Access-Control-Allow-Origin',value:'*'}],body:iconFont.toString('base64')},event.sessionId);
    }
    if (endpoint.includes('bootstrap.min.css')) return fulfill(bootstrap.toString(),'text/css');
    if (endpoint.includes('bootstrap-icons.min.css')) return fulfill(icons.toString(),'text/css');
    return fulfill('','text/plain');
  }
  if (url.origin !== origin && url.protocol.startsWith('http')) return fulfill('','text/plain');
  return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
}
function fulfillStudent(body, fulfill) {
  if (mode === 'reject') return fulfill({message:'Selected class is no longer eligible'},'application/json',400);
  if (mode === 'error') return fulfill({message:'Temporary API failure'},'application/json',503);
  const existing = saved.find(user => user.userCode === body.userCode);
  if (existing && existing.fullName !== body.fullName) return fulfill({code:'student_creation_conflict', message:'Profile already saved with different details',existingStudentId:existing.userId,existingStudentCode:existing.userCode},'application/json',409);
  const user = existing ?? {...body,userId:100+saved.length,roles:['student'],status:'active'};
  if (!existing) saved.push(user);
  if (mode === 'lost') return fulfill({message:'Response lost; retry safely'},'application/json',503);
  return fulfill(user,'application/json',201);
}
async function clickText(label, scope='document') {
  await evaluate(`(()=>{const node=[...${scope}.querySelectorAll('button,a')].find(n=>n.textContent.trim()===${JSON.stringify(label)});if(!node)throw Error('Missing '+${JSON.stringify(label)});node.focus();node.click();})()`);
}
async function value(selector, text) {
  await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw Error('Missing '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(node.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(node,${JSON.stringify(text)});node.dispatchEvent(new Event(node.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
}
const modal = "document.querySelector('.edu-modal-overlay')";
async function key(key, shift=false) {
  await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:key==='Tab'?9:27,modifiers:shift?8:0});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:key==='Tab'?9:27});
}
async function open() { await clickText('Add Student'); await until(`!!${modal}`, 'Add Student opens'); }
async function close() { await clickText('Cancel',modal); await until(`!${modal}`, 'modal closes'); }
async function grade(id='70', expected=3) {
  await until("!!document.querySelector('.modal [aria-label=Grade] option[value=\"70\"]')",'grades load');
  await value('.modal [aria-label=Grade]',id);
  await until(`document.querySelectorAll('.modal section input[type=checkbox]').length===${expected}`,'eligible classes load');
}
async function screenshot(name) {
  await evaluate('document.fonts.ready');
  const shot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(shot.data,'base64'));
  screenshots.push(name+'.png');
}
async function headerIcon() {
  const style = await evaluate(`(()=>{const header=document.querySelector('.edu-modal-overlay .modal-header, dialog[open] .ntf-compose-header, dialog[open] .et-schedule-detail-heading');const icons=header.querySelectorAll('.edu-modal-icon'),icon=icons[0],svg=icon?.querySelector('svg'),close=header.querySelector('.btn-close'),rect=icon?.getBoundingClientRect(),cs=icon&&getComputedStyle(icon);return {count:icons.length,fonts:header.querySelectorAll('.bi').length,width:rect?.width,height:rect?.height,size:svg?.getBoundingClientRect().width,stroke:svg?.getAttribute('stroke-width'),fill:svg?.getAttribute('fill'),color:cs?.color,radius:cs?.borderRadius,closeWidth:close.getBoundingClientRect().width,closeHeight:close.getBoundingClientRect().height,closeBorder:getComputedStyle(close).borderWidth};})()`);
  assert.deepEqual(style,{count:1,fonts:0,width:36,height:36,size:20,stroke:'2',fill:'none',color:'rgb(7, 132, 68)',radius:'10px',closeWidth:36,closeHeight:36,closeBorder:'0px'},'shared outline icon and close-button contract');
}
async function presentation(name) {
  const result = await evaluate(`(()=>{const surface=document.querySelector('.edu-modal'), r=surface.getBoundingClientRect(), header=surface.querySelector('.modal-header'), footer=surface.querySelector('.modal-footer');return {left:r.left,right:r.right,width:innerWidth,scroll:surface.scrollWidth,client:surface.clientWidth,header:header&&getComputedStyle(header).backgroundColor,title:document.getElementById(surface.closest('[role=dialog]').getAttribute('aria-labelledby'))?.textContent,focused:surface.contains(document.activeElement),footer:!!footer};})()`);
  assert.ok(result.left>=0 && result.right<=result.width+1 && result.scroll<=result.client+1, name+': no horizontal overflow');
  assert.equal(result.header,'rgb(255, 255, 255)',name+': white header');
  assert.ok(result.title?.trim() && result.focused && result.footer,name+': accessible title, initial focus and footer');
  await headerIcon();
  await screenshot(name);
}
async function navigate(role, route) {
  currentRole = role.replaceAll('-','_'); mode='ready';
  await send('Page.navigate',{url:origin+'/'+role+'/'+route});
  await until(`location.pathname===${JSON.stringify('/'+role+'/'+route)} && !!document.querySelector('main, .page-wrapper, .cm-dashboard, .content')`,'role page loads');
}
async function studentWorkflow(role, route) {
  saved=[];
  await navigate(role,route);
  await until("[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Add Student')",'Add Student trigger');
  await open();
  assert.equal(await evaluate("document.querySelector('.modal-title').textContent.trim()"),'Add Student');
  assert.equal(await evaluate("document.querySelector('.modal').textContent.includes('Create a student profile and optionally enroll in classes.')"),false,'redundant student description is removed');
  assert.equal(await evaluate("!!document.querySelector('.modal-header .edu-modal-subtitle')"),false,'default student header contains no empty subtitle slot');
  const initialCount=writes.length;
  await value('#add-student-fullName','   ');
  await evaluate("document.querySelector('.modal form').requestSubmit()");
  await delay(50); assert.equal(writes.length,initialCount,'whitespace name rejected');
  await value('#add-student-fullName','Full Name Only');
  const readsBefore=userReads, classReadsBefore=classReads;
  await clickText('Save Student',modal);
  await until(`!${modal}`,'name-only success closes');
  await until(`${'document.body.textContent'}.includes('Full Name Only')`,'success visible');
  await until('true','render'); assert.ok(userReads>readsBefore,'current page refetches users');
  if (route === 'dashboard') {
    await until("[...document.querySelectorAll('.dashboard-kpi')].find(card=>card.textContent.includes('Active Students'))?.querySelector('h3').textContent.trim()==='2'",'Dashboard student KPI reflects creation');
    assert.ok(classReads>classReadsBefore,'Dashboard classes are refetched');
  }
  else await until("[...document.querySelectorAll('tr')].some(row=>row.textContent.includes('Full Name Only'))",'student list reflects creation');
  assert.deepEqual(writes.at(-1).body.classIds,[],'no automatic enrollment');
  assert.equal(writes.at(-1).body.gradeId,null);
  await open();
  assert.equal(await evaluate("document.querySelector('#add-student-fullName').value"),'','successful form resets');
  await value('#add-student-fullName','Optional Profile');
  await value('#add-student-phone','0901234567'); await value('#add-student-email','invalid-email');
  const beforeInvalidEmail=writes.length;await evaluate("document.querySelector('.modal form').requestSubmit()");await delay(30);
  assert.equal(writes.length,beforeInvalidEmail,'native email validation preserved');
  await value('#add-student-email','qa@example.test'); await value('#add-student-gender','female');
  await grade();
  assert.equal(await evaluate("document.querySelector('.modal section').textContent.includes('Closed class')"),false);
  await evaluate("document.querySelector('.modal section input[type=checkbox]').click()");
  await grade('80',2);
  assert.equal(await evaluate("document.querySelectorAll('.modal section input:checked').length"),0,'grade switch clears selections');
  await grade(); await evaluate("document.querySelector('.modal section input[type=checkbox]').click()");
  mode='reject';await clickText('Save Student',modal);
  await until(`${modal}?.textContent.includes('no longer eligible')`,'enrollment rejection remains visible');
  await screenshot(role+'-'+route+'-error');
  assert.equal(await evaluate("document.querySelector('#add-student-fullName').value"),'Optional Profile');
  const attempt=writes.at(-1).body.userCode;
  mode='hold';const before=writes.length;
  await evaluate("const f=document.querySelector('.modal form');f.requestSubmit();f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));");
  await until("document.querySelector('.modal button[type=submit]').disabled",'busy');
  await screenshot(role+'-'+route+'-saving');
  await until('true','yield');await delay(50);assert.equal(writes.length,before+1,'double submit blocked');
  await key('Escape');assert.equal(await evaluate(`!!${modal}`),true,'cannot dismiss while submitting');
  mode='ready';await pendingSave();pendingSave=null;
  await until(`!${modal}`,'successful retry');
  assert.equal(writes.at(-1).body.userCode,attempt,'retry uses same identity');
  assert.deepEqual([...writes.at(-1).body.classIds].sort(),[1,2]);
  assert.equal(writes.at(-1).body.gender,'female');assert.equal(writes.at(-1).body.email,'qa@example.test');
  await open();await value('#add-student-fullName','Uncertain Save');mode='lost';await clickText('Save Student',modal);
  await until(`${modal}?.textContent.includes('Response lost')`,'API error visible');
  const count=saved.length;mode='ready';await clickText('Save Student',modal);await until(`!${modal}`,'safe retry');assert.equal(saved.length,count,'no duplicate after lost response');
  await open();await value('#add-student-fullName','Original Profile');mode='lost';await clickText('Save Student',modal);await until(`${modal}?.textContent.includes('Response lost')`,'uncertain create');
  await value('#add-student-fullName','Changed Profile');mode='ready';await clickText('Save Student',modal);await until(`${modal}?.textContent.includes('View saved profile')`,'conflict recovery offered');
  await clickText('View saved profile',modal);
  await until("!document.querySelector('#add-student-fullName')",'verified saved profile recovered');
  if(await evaluate(`!!${modal}`)) {await evaluate("document.querySelector('.modal .btn-close').click()");await until(`!${modal}`,'detail closes');}
  mode='grade-error';await open();
  await until(`${modal}?.textContent.includes('Grade catalogue unavailable')`,'grade loading failure');
  mode='ready';await clickText('Reload grades',modal);await grade();
  mode='class-error';await value('.modal [aria-label=Grade]','80');
  await until(`${modal}?.textContent.includes('Class catalogue unavailable')`,'class loading failure');
  mode='ready';await clickText('Reload class list',modal);
  await until("document.querySelectorAll('.modal section input[type=checkbox]').length===2",'class reload');
  await grade();await presentation(role+'-'+route+'-desktop');
  await evaluate("document.querySelector('.modal button[type=submit]').focus()");await key('Tab');
  assert.equal(await evaluate("document.querySelector('.edu-modal').contains(document.activeElement)"),true,'Tab traps focus');
  await evaluate("document.querySelector('.modal .btn-close').focus()");await key('Tab',true);
  assert.equal(await evaluate("document.activeElement.type"),'submit','Shift Tab wraps');
  await key('Escape');await until(`!${modal}`,'Escape closes');
  assert.equal(await evaluate("document.activeElement.textContent.trim()"),'Add Student','focus returns to trigger');
  assert.equal(await evaluate("document.querySelectorAll('[inert]').length"),0,'background restored');
  await open();await value('#add-student-fullName','Draft kept after cancel');await close();await open();
  assert.equal(await evaluate("document.querySelector('#add-student-fullName').value"),'Draft kept after cancel','Cancel preserves the existing draft behavior');await close();
  summary.push(role+'/'+route+': shared form, full profile, enrollment, errors, conflict, retries, double submit, refresh, keyboard');
}

try {
  const ws = await new Promise((resolve,reject) => {
    chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,...JSON.parse(process.env.CHROME_ARGS_JSON || '[]'),'about:blank'], {windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer = setTimeout(()=>reject(new Error('Chrome startup timed out')),10000);
    chrome.on('error',reject);
    chrome.stderr.on('data', chunk => {const match=chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  });
  socket = new WebSocket(ws);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.id){const task=pending.get(message.id);if(task){clearTimeout(task.timer);pending.delete(message.id);if(message.error)task.reject(new Error(JSON.stringify(message.error)));else task.resolve(message.result);}}
    else if(message.method==='Fetch.requestPaused')paused({...message.params,sessionId:message.sessionId}).catch(error=>faults.push(error.message));
    else if(message.method==='Runtime.exceptionThrown')faults.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  });
  const target=await send('Target.createTarget',{url:'about:blank'},null);
  ({sessionId:session}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
  await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{if(location.protocol==='http:'){const role=location.pathname.split('/')[1].replaceAll('-','_');localStorage.setItem('edutrack_auth_token','isolated-modal-fixture');localStorage.setItem('edutrack_auth_user',JSON.stringify({userId:42,userCode:'QA_ACCOUNT',fullName:'Synthetic Account',roles:[role],primaryRole:role,status:'active'}));}})()`});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  for(const [role,route] of [['center-manager','dashboard'],['center-manager','students'],['admin-staff','students']])await studentWorkflow(role,route);
  for(const width of [1920,1440,1280,1024,768,390,360]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await open();await grade();await presentation('add-student-'+width);await close();
  }
  for(const [role,route,label] of [['teacher','request','Create Request'],['teaching-assistant','request','Create Request'],['student','feedback','New Feedback'],['parent','feedback','New Feedback']]) {
    await navigate(role,route);await until(`[...document.querySelectorAll('button')].some(b=>b.textContent.trim()===${JSON.stringify(label)})`,'role modal trigger');
    for (const width of [1440,360]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
      await clickText(label);await until(`!!${modal}`,'role dialog');await presentation(role+'-'+width);await key('Escape');await until(`!${modal}`,'role Escape');
    }
    summary.push(role+': modal presentation and keyboard smoke');
  }
  await navigate('center-manager','students');await until("[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Link Parent - Student')",'link trigger');
  await clickText('Link Parent - Student');await until(`!!${modal}`,'link modal');await presentation('parent-student-link-mobile');
  assert.equal(await evaluate("document.querySelector('[aria-label=Relationship]')?.value ?? [...document.querySelectorAll('.modal select')].at(-1).value"),'Mother','relationship default preserved');
  await value('[aria-label="Select student"]','11');await value('[aria-label="Select parent"]','21');
  assert.equal(await evaluate("document.querySelector('[aria-label=Relationship]').value"),'Father','existing relationship preserved');
  assert.equal(await evaluate("document.querySelector('#primaryContactCheck').checked"),false,'existing primary contact flag preserved');
  await key('Escape');
  for (const [title,name] of [['View profile details','profile-details'],['Set account to Inactive','deactivate-warning']]) {
    await until(`!${modal}`,'previous dialog closes');
    await until("[...document.querySelectorAll('tr')].some(r=>r.textContent.includes('Existing Student'))",'fixture student row');
    await evaluate(`(()=>{const row=[...document.querySelectorAll('tr')].find(r=>r.textContent.includes('Existing Student'));const button=row.querySelector('button[title="${title}"]');if(!button)throw Error('Missing ${title}');button.focus();button.click();})()`);
    await until(`!!${modal}`,'detail or status modal');await presentation(name+'-360');
    if(name==='deactivate-warning') assert.notEqual(await evaluate("getComputedStyle([...document.querySelectorAll('.modal button')].find(b=>b.textContent.trim()==='Set Inactive')).backgroundColor"),'rgb(7, 132, 68)','risky action retains warning color');
    await key('Escape');
  }
  await navigate('center-manager','notifications');await until("[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Send Notification')",'native compose trigger');
  for (const width of [1440,360]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await clickText('Send Notification');await until("!!document.querySelector('dialog[open]')",'native dialog');
    await value('#ntf-title','Draft survives Escape');
    assert.equal(await evaluate("document.querySelector('dialog').contains(document.activeElement)"),true);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.ntf-compose-header')).backgroundColor"),'rgb(255, 255, 255)');
    assert.equal(await evaluate("!!document.querySelector('.ntf-compose-header #ntf-compose-hint')"),false,'draft helper leaves the header');
    assert.equal(await evaluate("document.querySelector('.ntf-compose-body #ntf-compose-hint')?.textContent"),'Draft is saved when closed, until sent or account is switched.','draft behavior remains explained in the body');
    assert.equal(await evaluate("document.querySelector('dialog[open]').getAttribute('aria-describedby')"),'ntf-compose-hint','dialog still describes the draft-retention behavior');
    await headerIcon();
    await screenshot('notification-compose-'+width);await key('Escape');await until("!document.querySelector('dialog[open]')",'native Escape');
    await clickText('Send Notification');await until("!!document.querySelector('dialog[open]')",'native reopens');
    assert.equal(await evaluate("document.querySelector('#ntf-title').value"),'Draft survives Escape','native draft retained');
    await key('Escape');
  }
  summary.push('native notification compose: presentation, Escape, focus and draft retention');
  await navigate('student','schedule');
  await until("!!document.querySelector('[data-session-id=\"7\"]')",'fixture schedule session');
  for (const width of [1440,360]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await evaluate("(()=>{const node=document.querySelector('[data-session-id=\"7\"]');node.focus();node.click();})()");
    await until("!!document.querySelector('dialog[open]')",'native schedule detail');
    assert.equal(await evaluate("document.querySelector('dialog').contains(document.activeElement)"),true);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.et-schedule-detail-heading')).backgroundColor"),'rgb(255, 255, 255)');
    await headerIcon();
    await screenshot('schedule-detail-'+width);await key('Escape');await until("!document.querySelector('dialog[open]')",'schedule Escape');
    assert.equal(await evaluate("document.activeElement.dataset.sessionId"),'7','schedule focus returns to selected session');
  }
  summary.push('native schedule detail: shared tokens, focus and Escape preserve selected session');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,writes,userReads,classReads,faults,screenshots},null,2));
  assert.deepEqual(faults,[],'no browser exceptions or intercepted mutation violations');
  console.log(JSON.stringify({summary,writes:writes.length,screenshots:screenshots.length,output},null,2));
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();for(const task of pending.values())clearTimeout(task.timer);
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}

