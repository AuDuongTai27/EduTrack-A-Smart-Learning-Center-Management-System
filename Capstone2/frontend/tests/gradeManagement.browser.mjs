import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after build, with an isolated API on port 53307.
// Requires the edutrack_grade_management identity header; uses real API/MySQL data.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = path.join(process.argv[2], 'live-browser'); fs.mkdirSync(output, {recursive:true});
const profile = path.join(output, 'chrome-profile');
const bootstrap = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap.min.css'));
const icons = fs.readFileSync(path.join(root, 'src/assets/css/bootstrap-icons.css'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2'};
const apiRequests=[];
const writes=[];
const server = http.createServer((req, res) => {
  if(req.url.startsWith('/api/')) {
    const upstream=http.request('http://127.0.0.1:53307'+req.url,{method:req.method,headers:{...req.headers,host:'127.0.0.1:53307'}},response=>{
      if(response.headers['x-edutrack-review-database']!=='127.0.0.1:33307/edutrack_grade_management') {res.writeHead(502).end('Test database identity mismatch');response.resume();return;}
      apiRequests.push({method:req.method,path:req.url,status:response.statusCode});
      if(req.method!=='GET')writes.push({method:req.method,path:req.url,status:response.statusCode});
      res.writeHead(response.statusCode,response.headers);response.pipe(res);
    });
    upstream.on('error',()=>res.writeHead(502).end('Isolated test API unavailable'));req.pipe(upstream);return;
  }
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
async function paused(event){
 const url=new URL(event.request.url);if(url.origin===origin)return send('Fetch.continueRequest',{requestId:event.requestId},event.sessionId);
 const fulfill=(body,type)=>send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},event.sessionId);
 if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.includes('bootstrap.min.css'))return fulfill(bootstrap,'text/css');
 if(url.hostname==='cdn.jsdelivr.net'&&url.pathname.includes('bootstrap-icons.min.css'))return fulfill(icons,'text/css');return fulfill('','text/plain');
}
async function testApi(method,endpoint,body){const r=await fetch('http://127.0.0.1:53307/api'+endpoint,{method,headers:{...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.headers.get('x-edutrack-review-database'),'127.0.0.1:33307/edutrack_grade_management');return {status:r.status,data:await r.json()};}
async function clickText(label,scope='document'){await evaluate(`(()=>{const n=[...${scope}.querySelectorAll('button,a')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!n)throw Error('Missing action '+${JSON.stringify(label)});n.click();})()`);}
async function value(selector,text){await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing field');const select=n.tagName==='SELECT';Object.getOwnPropertyDescriptor(select?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(String(text))});n.dispatchEvent(new Event(select?'change':'input',{bubbles:true}));})()`);}
async function navigate(route){await send('Page.navigate',{url:origin+route});await until("!!document.querySelector('.page-title')",'page title');}
const table="document.querySelector('table[aria-label=\"Danh sách khối lớp\"]')";
const rows=`[...${table}.querySelectorAll('tbody tr')].filter(r=>!r.querySelector('td[colspan]'))`;
async function scenario(role,viewport){
 const route='/center-manager/grades',name='UI Grade '+viewport,renamed=name+' Updated';
 await navigate(route);await until(`${rows}.length===10`,'grade list pagination');
 assert.equal(await evaluate("!!document.querySelector('aside a[href=\"/center-manager/grades\"]')"),true);
 await clickText('2',"document.querySelector('nav .pagination')");await until(`${rows}.length===2`,'second grade page');
 await value('[aria-label="Tìm khối lớp"]','Khối 1');await until(`${rows}.length===4`,'name search and page reset');
 await value('[aria-label="Tìm khối lớp"]','');await value('[aria-label="Sắp xếp khối lớp"]','za');await until(`${rows}.length===10`,'grade sorting');
 await clickText('Add Grade');await until("!!document.querySelector('[name=gradeName]')",'create grade form');
 await clickText('Lưu khối lớp');await until("!!document.querySelector('#grade-name-error')",'required name');
 await value('[name=gradeName]',' Khối 1 ');await clickText('Lưu khối lớp');await until("document.querySelector('.modal [role=alert]')?.textContent.includes('409')",'duplicate name error');
 assert.equal(await evaluate("document.querySelector('[name=gradeName]').value"),' Khối 1 ');
 await value('[name=gradeName]',name);await clickText('Lưu khối lớp');await until("!document.querySelector('.modal')",'grade saved');
 await value('[aria-label="Tìm khối lớp"]',name);await until(`${rows}.length===1`,'created grade in list');
 await evaluate(`document.querySelector('button[title='+${JSON.stringify(JSON.stringify('Sửa '+name))}+']').click()`);
 await until(`document.querySelector('[name=gradeName]')?.value===${JSON.stringify(name)}`,'fresh grade detail');
 assert.equal(await evaluate("document.querySelector('input[name=gradeId]')===null"),true);
 await value('[name=gradeName]',renamed);await clickText('Lưu khối lớp');await until("!document.querySelector('.modal')",'rename saved');
 const all=(await testApi('GET','/grades')).data;const grade=all.find(g=>g.gradeName===renamed);assert.ok(grade.gradeId>12);
 await evaluate(`document.querySelector('a[title='+${JSON.stringify(JSON.stringify('Xem '+renamed))}+']').click()`);
 await until(`document.querySelector('[aria-label="Lọc khối lớp"]')?.value===${JSON.stringify(String(grade.gradeId))}`,'grade view link applies explicit ID filter');
 await clickText('Tất cả lớp');
 await clickText('Add Class');await until("!!document.querySelector('[name=className]')",'class create');
 const subjects=(await testApi('GET','/subjects')).data;
 await value('[name=className]','UI class '+viewport);await value('[name=gradeId]',String(grade.gradeId));await value('[name=subjectId]',String(subjects[0].subjectId));await value('[name=tuitionFee]','0');await value('[name=startDate]','2026-11-07');await clickText('Tạo lớp học');
 await until("!document.querySelector('.modal')",'custom-grade class persisted');await until("document.querySelector('table[aria-label=\"Danh sách lớp học\"] tbody')?.textContent.includes('UI class')",'filtered real class');
 await navigate('/admin-staff/classes');await until("!!document.querySelector('[aria-label=\"Lọc khối lớp\"]')",'staff class page');
 await clickText('Add Class');await until(`!!document.querySelector('[name=gradeId] option[value="${grade.gradeId}"]')`,'staff receives new/renamed grade after reload');
 assert.equal(await evaluate(`document.querySelector('[name=gradeId] option[value="${grade.gradeId}"]').textContent`),renamed);await clickText('Hủy bỏ');
 assert.equal(await evaluate("document.querySelector('aside a[href*=\"/grades\"]')===null"),true,'Staff navigation remains unchanged');
 summary.push(viewport+' Admin Staff uses live custom Grade catalogue');
 await navigate(route);await until(`${rows}.length===10`,'reload grade management');await value('[aria-label="Tìm khối lớp"]',renamed);await until(`${rows}.length===1`,'used grade row');
 assert.equal(await evaluate(`${rows}[0].textContent.includes('1 lớp')`),true,'real class count');
 await evaluate(`document.querySelector('button[title='+${JSON.stringify(JSON.stringify('Xóa '+renamed))}+']').click()`);
 assert.equal(await evaluate("document.querySelector('.modal-footer .btn-danger').disabled"),true,'UI blocks grade known to be used');await clickText('Hủy bỏ');
 const classes=(await testApi('GET','/classes')).data;const owned=classes.find(c=>c.className==='UI class '+viewport);assert.equal((await testApi('DELETE','/classes/'+owned.classId)).status,200);
 await clickText('Tải lại');await until(`${rows}.length===1&&${rows}[0].textContent.includes('0 lớp')`,'grade refresh reflects removal');
 assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),true,'responsive grade list');
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,viewport+'-grade-list.png'),Buffer.from(shot.data,'base64'));
 await evaluate(`document.querySelector('button[title='+${JSON.stringify(JSON.stringify('Xóa '+renamed))}+']').click()`);
 const race=await testApi('POST','/classes',{className:'Concurrent linkage '+viewport,gradeId:grade.gradeId,subjectId:subjects[0].subjectId,room:null,tuitionFee:0,startDate:'2026-11-07',endDate:null,status:'upcoming'});assert.equal(race.status,201);
 await clickText('Xác nhận xóa');await until("document.querySelector('.modal [role=alert]')?.textContent.includes('409')",'backend blocks stale zero-count deletion');
 assert.equal(await evaluate("!!document.querySelector('#grade-delete-title')"),true);
 assert.equal((await testApi('DELETE','/classes/'+race.data.classId)).status,200);
 await clickText('Xác nhận xóa');await until("!document.querySelector('.modal')",'conditional delete retry');await until("document.body.innerText.includes('Không tìm thấy khối lớp phù hợp')",'deleted grade disappears after confirmed response');
 summary.push(viewport+' Grade Management CRUD/search/sort/pagination, duplicate error, real count, view classes, stale-delete denial/retry and responsive layout');
 console.log('PASS Grade Management '+viewport+' with real isolated API/MySQL');
}try {
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
    await scenario('center-manager',viewport);
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,writes,apiRequests,mockApiUsed:false},null,2));
  assert.equal(apiRequests.some(r=>r.status>=500),false); console.log('RESULTS: '+summary.length+' real-API role/viewport scenarios; '+apiRequests.length+' real API requests; no API fixtures.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
