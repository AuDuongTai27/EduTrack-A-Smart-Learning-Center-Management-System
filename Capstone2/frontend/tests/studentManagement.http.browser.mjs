import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Launched only by the isolated backend harness. No fixture API responses: all
// /api traffic is forwarded over HTTP to the real production controllers.
const api = new URL(process.env.EDUTRACK_TEST_API_URL || 'http://invalid');
assert.equal(api.hostname, '127.0.0.1');
assert.ok(Number(api.port) > 1024 && !['5036','3306','33308','5173'].includes(api.port));
assert.equal(process.env.EDUTRACK_HTTP_E2E_TOKEN, 'HTTP E2E ISOLATED ONLY');
const request = async (route, method='GET', body) => {
  const response = await fetch(new URL('/api/'+route,api), {method, headers:{'Content-Type':'application/json'}, ...(body ? {body:JSON.stringify(body)}:{})});
  assert.ok(response.ok, `${method} ${route}: ${response.status} ${await response.clone().text()}`);
  return response.json();
};
assert.ok((await request('grades')).some(g=>g.gradeId===7000 && g.gradeName==='HTTP E2E ISOLATED ONLY'), 'isolated synthetic database marker required before writes');
const root = process.cwd(), dist = path.join(root,'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(),'edutrack-http-browser-'));
const traffic = [], summary = [], faults = [];
const server = http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const chunks=[]; for await(const chunk of req)chunks.push(chunk);
      const response = await fetch(new URL(req.url,api),{method:req.method,headers:{'Content-Type':'application/json'},...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
      traffic.push({method:req.method,path:url.pathname,status:response.status});
      res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/json'}).end(Buffer.from(await response.arrayBuffer()));return;
    }
    const file = path.resolve(dist,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(dist+path.sep)&&file!==dist){res.writeHead(403).end();return;}
    const target=fs.existsSync(file)&&fs.statSync(file).isFile()?file:path.join(dist,'index.html');
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream'}).end(fs.readFileSync(target));
  }catch(error){faults.push(error.message);res.writeHead(502).end('Test proxy failure');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let chrome,socket,session,sequence=0;
const pending=new Map(), delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function send(method,params={},target=session){return new Promise((resolve,reject)=>{
  const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(target?{sessionId:target}:{})}));
});}
async function evaluate(expression){const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
async function until(expression,name){const end=Date.now()+20000;while(Date.now()<end){if(await evaluate(expression))return;await delay(40);}throw Error('Timed out: '+name);}
async function value(selector,text){await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing field '+${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(n.tagName==='SELECT'?HTMLSelectElement.prototype:n.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(String(text))});n.dispatchEvent(new Event(n.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
async function click(text,scope='document'){await evaluate(`(()=>{const n=[...${scope}.querySelectorAll('button,a')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!n)throw Error('Missing button '+${JSON.stringify(text)});n.click();})()`);}
const modal="document.querySelector('.modal')", grade='.modal [aria-label="Khối lớp"]';
const boxes="document.querySelectorAll('.modal section input[type=checkbox]')";
async function rowAction(code,title){await until("!!document.querySelector('.user-page-size')",'table toolbar');await value('.user-page-size',50);await until(`[...document.querySelectorAll('tbody tr')].some(r=>r.textContent.includes(${JSON.stringify(code)}))`,'student row');await evaluate(`(()=>{const r=[...document.querySelectorAll('tbody tr')].find(r=>r.textContent.includes(${JSON.stringify(code)}));r.querySelector('button[title='+${JSON.stringify(JSON.stringify(title))}+']').click();})()`);}
async function save(){await click('Lưu hồ sơ',modal);await until(`!${modal}`,'saved Student over real HTTP');}

async function scenario(role,viewport){
  const name=`Browser ${role} ${viewport}`;
  await send('Page.navigate',{url:origin+'/'+role+'/students'});
  await until("!!document.querySelector('[aria-label=\"Lọc khối lớp\"] option[value=\"7\"]')",'real Grade catalogue');
  const historyStudent=(await request('users')).find(u=>u.fullName==='Enrollment Editor');
  await rowAction(historyStudent.userCode,'Sửa thông tin');
  const center='document.querySelector(\'[data-testid="student-center-classes"]\')';
  await until(`${center}?.querySelectorAll('[data-enrollment-id]').length===3`,'complete real enrollment history');
  for(const text of ['Đang học','Đã hoàn thành','Đã nghỉ','Khác khối'])assert.equal(await evaluate(`${center}.textContent.includes(${JSON.stringify(text)})`),true);
  await click('Hủy bỏ',modal);
  await click('Add Student');await until(`!!document.querySelector(${JSON.stringify(grade)})`,'Add form');
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(grade)}).value`),'');
  assert.equal(await evaluate(`[...document.querySelector(${JSON.stringify(grade)}).options].some(o=>o.textContent==='Class 7')`),false);
  await value(grade,7);await until(`${boxes}.length===3`,'eligible real classes');
  assert.equal(await evaluate(`${modal}.textContent.includes('7 Completed')`),false);
  await evaluate(`${boxes}[1].click()`);await until(`${modal}.textContent.includes('Đã chọn 1 lớp')`,'single selection');
  await evaluate(`${boxes}[0].click()`);await until(`${modal}.textContent.includes('Đã chọn 2 lớp')`,'select all');
  await evaluate(`${boxes}[0].click()`);await until(`${modal}.textContent.includes('Đã chọn 0 lớp')`,'clear all');
  await evaluate(`${boxes}[1].click()`);await value(grade,8);await until(`${boxes}.length===2`,'switch Grade');
  assert.equal(await evaluate(`${boxes}[1].checked`),false,'old Class cleared');
  await value(grade,7);await until(`${boxes}.length===3`,'return to Grade 7');await evaluate(`${boxes}[0].click()`);
  await value('.modal input[type=text]',name);await save();
  const student=(await request('users')).find(u=>u.fullName===name);assert.ok(student);assert.equal(student.gradeId,7);
  const enroll=(await request('studentclasses')).filter(sc=>sc.studentId===student.userId);assert.equal(enroll.length,2);
  await rowAction(student.userCode,'Sửa thông tin');assert.equal(await evaluate(`document.querySelector(${JSON.stringify(grade)}).value`),'7');
  await value(grade,8);await click('Cập nhật hồ sơ',modal);await until(`!${modal}`,'persist school Grade independently');
  await send('Page.reload');await until("!!document.querySelector('.user-page-size')",'reload');
  await rowAction(student.userCode,'Sửa thông tin');assert.equal(await evaluate(`document.querySelector(${JSON.stringify(grade)}).value`),'8');await click('Hủy bỏ',modal);
  assert.deepEqual((await request('studentclasses')).filter(sc=>sc.studentId===student.userId),enroll,'all enrollment DTO fields unchanged');
  await rowAction(student.userCode,'Sửa thông tin');
  await until(`${center}?.querySelectorAll('[data-enrollment-id]').length===2 && ${center}.querySelectorAll('input[type=checkbox]').length===1`,'new Class suggested by saved Grade, old Grade history visible');
  await evaluate(`${center}.querySelector('input[type=checkbox]').click()`);await click('Đăng ký các lớp đã chọn',center);
  await until(`${center}.querySelectorAll('[data-enrollment-id]').length===3`,'explicit add saves new enrollment');
  let savedEnroll=(await request('studentclasses')).filter(sc=>sc.studentId===student.userId);assert.equal(savedEnroll.length,3);
  await value(grade,7);assert.equal(await evaluate(`${center}.querySelectorAll('[data-enrollment-id]').length`),3,'unsaved Grade cannot hide history');
  assert.equal(await evaluate(`[...${center}.querySelectorAll('button')].find(b=>b.textContent==='Đăng ký các lớp đã chọn').disabled`),true,'new enrollments wait for profile Grade save');
  await value(grade,8);
  const droppedId=enroll.find(sc=>sc.classId===1).scId;
  await evaluate(`${center}.querySelector('[data-enrollment-id="${droppedId}"] button').click()`);
  await click('Giữ lớp đang học',center);assert.deepEqual((await request('studentclasses')).filter(sc=>sc.studentId===student.userId),savedEnroll,'cancel drop is read only');
  await evaluate(`${center}.querySelector('[data-enrollment-id="${droppedId}"] button').click()`);
  await value('[aria-label="Xác nhận ngừng học"] textarea','Browser confirmed drop');
  await click('Xác nhận ngừng học',center);
  await until(`${center}.querySelector('[data-enrollment-id="${droppedId}"]').textContent.includes('Đã nghỉ')`,'explicit drop confirmation');
  savedEnroll=(await request('studentclasses')).filter(sc=>sc.studentId===student.userId);
  assert.equal(savedEnroll.length,3);assert.equal(savedEnroll.find(sc=>sc.scId===droppedId).dropReason,'Browser confirmed drop');
  assert.equal(savedEnroll.find(sc=>sc.scId===droppedId).enrolledDate,enroll.find(sc=>sc.scId===droppedId).enrolledDate);
  await evaluate(`${center}.scrollIntoView({block:'start'})`);
  const enrollmentShot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,`${viewport}-${role}-edit-enrollment.png`),Buffer.from(enrollmentShot.data,'base64'));
  await evaluate("document.querySelector('.modal button[type=submit]').scrollIntoView({block:'center'})");
  assert.equal(await evaluate("(()=>{const r=document.querySelector('.modal button[type=submit]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"),true,'Edit Save remains reachable on every viewport');
  await click('Hủy bỏ',modal);await send('Page.reload');
  await rowAction(student.userCode,'Sửa thông tin');await until(`${center}?.textContent.includes('Browser confirmed drop')`,'drop history survives reload');await click('Hủy bỏ',modal);
  await value('[aria-label="Lọc khối lớp"]',8);await until(`[...document.querySelectorAll('tbody tr')].some(r=>r.textContent.includes(${JSON.stringify(student.userCode)}))`,'Grade ID filter');
  await value('[aria-label="Lọc khối lớp"]','All');await value('[aria-label="Sắp xếp học sinh"]','grade-az');await value('[aria-label="Sắp xếp học sinh"]','grade-za');
  const custom=await request('grades','POST',{gradeName:`Custom ${role} ${viewport}`});
  await evaluate("window.dispatchEvent(new Event('focus'))");
  await until(`!!document.querySelector('[aria-label="Lọc khối lớp"] option[value="${custom.gradeId}"]')`,'new real Grade visible');
  await click('Add Student');await until(`!!document.querySelector(${JSON.stringify(grade)})`,'profile-only form');
  await value(grade,custom.gradeId);await value('.modal input[type=text]',name+' Profile');await save();
  const profile=(await request('users')).find(u=>u.fullName===name+' Profile');assert.equal(profile.gradeId,custom.gradeId);
  assert.equal((await request('studentclasses')).filter(sc=>sc.studentId===profile.userId).length,0);
  await request('grades/'+custom.gradeId,'PUT',{gradeName:`Renamed ${role} ${viewport}`});await evaluate("window.dispatchEvent(new Event('focus'))");
  await until(`document.body.textContent.includes(${JSON.stringify('Renamed '+role+' '+viewport)})`,'real Grade rename');
  await click('Tạo liên kết PH - HS');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Chọn phụ huynh\"]').value"),'');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Chọn học sinh\"]').value"),'');
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Mối quan hệ\"]').value"),'Mother');
  const writes=traffic.filter(t=>t.method==='POST').length;
  await evaluate("document.querySelector('.modal form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
  await until(`${modal}.textContent.includes('Vui lòng chọn đầy đủ')`,'empty link validation');assert.equal(traffic.filter(t=>t.method==='POST').length,writes);
  const parent=(await request('users')).find(u=>u.fullName==='HTTP Parent One');
  await value('[aria-label="Chọn phụ huynh"]',parent.userId);await value('[aria-label="Chọn học sinh"]',student.userId);
  await click('Xác nhận liên kết',modal);await until(`!${modal}`,'real new Mother link');
  let link=(await request('parentstudents')).find(l=>l.studentId===student.userId&&l.parentId===parent.userId);assert.equal(link.relationship,'Mother');
  await request('parentstudents','POST',{parentId:parent.userId,studentId:student.userId,relationship:'Father',isPrimaryContact:false,updateExisting:true});
  await send('Page.reload');await until(`[...document.querySelectorAll('tbody tr')].some(r=>r.textContent.includes(${JSON.stringify(student.userCode)}))`,'reload saved users and relationships');
  await click('Tạo liên kết PH - HS');await value('[aria-label="Chọn phụ huynh"]',parent.userId);await value('[aria-label="Chọn học sinh"]',student.userId);
  await until("document.querySelector('[aria-label=\"Mối quan hệ\"]').value==='Father'",'load saved Father');
  assert.equal(await evaluate("document.querySelector('#primaryContactCheck').checked"),false);
  await click('Xác nhận liên kết',modal);await until(`!${modal}`,'existing pair kept');
  link=(await request('parentstudents')).filter(l=>l.studentId===student.userId&&l.parentId===parent.userId);assert.equal(link.length,1);assert.equal(link[0].relationship,'Father');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync(path.join(output,`${viewport}-${role}.png`),Buffer.from(shot.data,'base64'));
  summary.push(`${role} ${viewport}: Add/Edit/refresh, real dynamic Grade/filter/sort/rename, enrollment preserved, link defaults/existing data`);console.log('PASS '+summary.at(-1));
}

try{
  const ws=await new Promise((resolve,reject)=>{
    chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+path.join(output,'profile'),...JSON.parse(process.env.CHROME_ARGS_JSON||'[]'),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),15000);chrome.on('error',reject);chrome.stderr.on('data',chunk=>{const m=chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
  });
  socket=new WebSocket(ws);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const t=pending.get(m.id);if(t){clearTimeout(t.timer);pending.delete(m.id);if(m.error)t.reject(Error(JSON.stringify(m.error)));else t.resolve(m.result);}}});
  const target=await send('Target.createTarget',{url:'about:blank'},null);({sessionId:session}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
  await send('Page.enable');await send('Runtime.enable');
  // Guard every request: a frontend accidentally built with a development API
  // URL must fail before sending any write there. Only this test proxy is allowed.
  await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  socket.addEventListener('message',event=>{
    const m=JSON.parse(event.data);if(m.method!=='Fetch.requestPaused')return;
    const url=new URL(m.params.request.url), target=m.sessionId;
    if(url.origin===origin||!url.protocol.startsWith('http')){
      send('Fetch.continueRequest',{requestId:m.params.requestId},target).catch(e=>faults.push(e.message));return;
    }
    if(url.pathname.startsWith('/api/')){
      faults.push('Blocked API outside isolated proxy: '+url.origin);
      send('Fetch.failRequest',{requestId:m.params.requestId,errorReason:'BlockedByClient'},target).catch(e=>faults.push(e.message));return;
    }
    // Only remote static assets receive local responses, never application APIs.
    let body='',type='text/plain';
    if(url.pathname.includes('bootstrap.min.css')){body=fs.readFileSync(path.join(root,'src/assets/css/bootstrap.min.css'),'utf8');type='text/css';}
    else if(url.pathname.includes('bootstrap-icons.min.css')){body=fs.readFileSync(path.join(root,'src/assets/css/bootstrap-icons.css'),'utf8');type='text/css';}
    send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},target).catch(e=>faults.push(e.message));
  });
  for(const [viewport,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const role of ['center-manager','admin-staff'])await scenario(role,viewport);
  }
  assert.deepEqual(faults,[]);assert.ok(traffic.some(t=>t.path==='/api/users/students'&&t.status===201));
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,traffic,faults},null,2));
  console.log(`RESULT: ${summary.length} real HTTP browser scenario groups passed. Artifacts: ${output}`);
}catch(error){fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:error.stack,summary,traffic,faults},null,2));console.error('Browser failure artifacts: '+output);throw error;}
finally{
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}chrome?.kill();for(const p of pending.values())clearTimeout(p.timer);
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
