import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Run from Capstone2/frontend after npm run build. No live API or database is used.
const root = process.cwd();
const dist = path.join(root, 'dist');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'edutrack-money-input-'));
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
const writes=[];
const summary=[];
const initialClass=()=>({classId:17,className:'QA Class',subjectId:42,subjectName:'Toán 7',subjectCode:'MATH7',
  tuitionFee:1700000,room:null,startDate:'2026-11-07',endDate:null,status:'active'});
const initialInvoice=()=>({invoiceId:55,studentId:6,studentName:'QA Student',studentCode:'STU-QA',classId:17,className:'QA Class',
  amountDue:1700000,periodMonth:11,periodYear:2026,dueDate:'2026-12-07',status:'unpaid'});
const reset=()=>{state={classData:initialClass(),invoice:initialInvoice(),payments:[]};};
function fixture(endpoint){
  if(endpoint==='/api/classes')return [state.classData];
  if(endpoint==='/api/classes/17')return state.classData;
  if(endpoint==='/api/subjects')return [{subjectId:42,subjectName:'Toán 7',subjectCode:'MATH7'}];
  if(endpoint==='/api/users')return [{userId:6,fullName:'QA Student',userCode:'STU-QA',roles:['student'],status:'active'}];
  if(endpoint==='/api/tuitioninvoices')return [state.invoice];
  if(endpoint==='/api/payments')return state.payments;
  if(endpoint==='/api/centersettings')return [{settingId:1,settingKey:'center_name',settingValue:'EduTrack Money QA'}];
  return [];
}
async function paused(event){
  const url=new URL(event.request.url),endpoint=url.pathname;
  const fulfill=(body,type='application/json',code=200)=>send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:code,responseHeaders:[{name:'Content-Type',value:type}],body:Buffer.from(body).toString('base64')},event.sessionId);
  if(url.origin===origin&&endpoint.startsWith('/api/')){
    if(event.request.method!=='GET'){
      assert.match(endpoint,/^\/api\/(?:classes|tuitioninvoices)(?:\/\d+)?(?:\/payments)?$/,'Only fixture class/invoice/payment commands');
      const data=JSON.parse(event.request.postData);writes.push({method:event.request.method,endpoint,data});
      if(endpoint.startsWith('/api/classes')){state.classData={...state.classData,...data};return fulfill(JSON.stringify(state.classData));}
      if(endpoint.endsWith('/payments')){
        state.payments=[{paymentId:1,invoiceId:55,amount:data.amount,paidAt:'2026-11-07T08:00:00Z'}];state.invoice={...state.invoice,status:'paid'};
        return fulfill(JSON.stringify(state.payments[0]));
      }
      state.invoice={...state.invoice,...data};return fulfill(JSON.stringify(state.invoice));
    }
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
async function setValue(selector,value){
  await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(n.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(value)});n.dispatchEvent(new Event(n.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);
}
async function clickText(text){
  await evaluate(`(()=>{const b=[...document.querySelectorAll('main button')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!b)throw Error('Missing '+${JSON.stringify(text)});b.click();})()`);
}
async function selectLookup(value){
  await evaluate(`(()=>{const s=[...document.querySelectorAll('.modal select')].find(n=>[...n.options].some(o=>o.value===${JSON.stringify(value)}));if(!s)throw Error('Missing lookup');s.value=${JSON.stringify(value)};s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
}
async function paste(selector,text){
  await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});n.focus();n.select();const clipboard=new DataTransfer();clipboard.setData('text',${JSON.stringify(text)});n.dispatchEvent(new ClipboardEvent('paste',{clipboardData:clipboard,bubbles:true,cancelable:true}));})()`);
}
async function exercise(selector,decimals,label){
  await until(`!!document.querySelector(${JSON.stringify(selector)})`,label+' input');
  for(const [raw,expected] of [['0','0'],['1700000','1.700.000'],['125500000','125.500.000'],['','']]){
    await setValue(selector,raw);await until(`document.querySelector(${JSON.stringify(selector)}).value===${JSON.stringify(expected)}`,label+' format '+raw);
  }
  await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});n.focus();n.select();})()`);
  for(const character of '1700000')await send('Input.insertText',{text:character});
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`),'1.700.000',label+' typing');
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).setSelectionRange(2,2)`);
  await send('Input.insertText',{text:'9'});
  assert.deepEqual(await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});return [n.value,n.selectionStart];})()`),['19.700.000',2],label+' middle edit and caret');
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).select()`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`),'',label+' clear is empty, not zero');
  if(decimals){
    for(const character of '1700000.25')await send('Input.insertText',{text:character});
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}).value`),'1.700.000,25',label+' decimal keyboard dot');
    await paste(selector,'1.700.000,25 VND');
  }else{
    await paste(selector,'1.700.000 VND');
    await paste(selector,'1700000.25');
  }
  const result=await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)}),g=n.closest('.input-group'),a=g.querySelector('.input-group-text');const r=g.getBoundingClientRect(),i=n.getBoundingClientRect(),u=a.getBoundingClientRect();
    return {value:n.value,type:n.type,mode:n.inputMode,unit:a.textContent.trim(),fits:r.width<=g.parentElement.clientWidth+1&&i.right<=u.left+1&&u.right<=r.right+1};})()`);
  assert.deepEqual(result,{value:decimals?'1.700.000,25':'1.700.000',type:'text',mode:decimals?'decimal':'numeric',unit:'VND',fits:true},label+' input group');
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(output,label+'.png'),Buffer.from(shot.data,'base64'));
}
async function scenario(kind,viewport){
  reset();const label=viewport+'-'+kind;
  const role=kind.startsWith('staff')?'admin-staff':'center-manager';
  const classForm=kind.includes('class');
  await send('Page.navigate',{url:origin+`/${role}/${classForm?'classes':'tuition'}`});
  await until("!!document.querySelector('.page-title')",label+' page');
  if(classForm){
    await until("!!document.querySelector('button[title=\"Sửa QA Class\"]')",label+' class list');
    if(kind.endsWith('create'))await clickText('Add Class');
    else await evaluate("document.querySelector('button[title=\"Sửa QA Class\"]').click()");
    await until("!!document.querySelector('[name=tuitionFee]')",label+' form');
    if(kind.endsWith('create')){await setValue('[name=className]','QA Class');await setValue('[name=subjectId]','42');await setValue('[name=startDate]','2026-11-07');}
    await exercise('[name=tuitionFee]',true,label);
  }else if(kind==='manager-invoice-edit'){
    await until("!!document.querySelector('button[title=\"Chỉnh sửa hóa đơn\"]')",label+' invoice list');
    await evaluate("document.querySelector('button[title=\"Chỉnh sửa hóa đơn\"]').click()");
    await exercise('#manager-edit-amount',false,label);
    assert.deepEqual(await evaluate("[...document.querySelectorAll('.modal input[type=number]')].map(n=>n.value)"),['11','2026'],label+' month/year remain numeric inputs');
  }else if(kind==='manager-payment'){
    await until("!!document.querySelector('button[title=\"Ghi nhận thanh toán\"]:not(:disabled)')",label+' live balance');
    await evaluate("document.querySelector('button[title=\"Ghi nhận thanh toán\"]').click()");
    await exercise('#manager-payment-amount',false,label);
  }else{
    await clickText(role==='admin-staff'?'Lập phiếu thu học phí mới':'Generate Tuition');
    await until("[...document.querySelectorAll('.modal select')].some(s=>[...s.options].some(o=>o.value==='6'))",label+' lookups');
    await selectLookup('6');await selectLookup('17');
    await exercise(role==='admin-staff'?'#staff-invoice-amount':'#manager-create-amount',false,label);
  }
  const before=writes.length;
  await evaluate("document.querySelector('.modal form').requestSubmit()");
  await until(`!document.querySelector('.modal')`,label+' save');
  assert.equal(writes.length,before+1,label+' one confirmed command');
  const last=writes.at(-1),amount=last.data[classForm?'tuitionFee':kind==='manager-payment'?'amount':'amountDue'];
  assert.equal(typeof amount,'number',label+' numeric request payload');
  assert.equal(amount,classForm?1700000.25:1700000,label+' exact request amount');
  if(kind==='manager-payment')assert.equal(last.data.additionalChargeAmount,0,label+' unchanged additional charge calculation');
  summary.push({label,endpoint:last.endpoint,amount});
  console.log('PASS '+label+': grouping, typing/paste/caret/empty/zero, VND suffix and exact numeric payload');
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
    for(const kind of ['manager-class-create','manager-class-edit','staff-class-create','staff-class-edit','manager-invoice-create','manager-invoice-edit','manager-payment','staff-invoice-create'])await scenario(kind,viewport);
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,writes},null,2));
  console.log('RESULTS: '+summary.length+' money input scenarios passed; API writes were intercepted, no live MySQL.');
  console.log('ARTIFACTS: '+output);
} finally {
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}
  chrome?.kill();
  for (const task of pending.values()) clearTimeout(task.timer);
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
