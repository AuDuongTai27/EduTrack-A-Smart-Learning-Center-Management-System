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
let confirmCalls = 0, expectedConfirmCalls = 0;
let lastEditRequest = null;
let delayReceiptReadOnce = false;
let failPreviewOnce = false, staleConfirmOnce = false, delayPreviewOnce = false, loseConfirmOnce = false, losePaymentOnce = false;
const server = http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const chunks=[]; for await(const chunk of req)chunks.push(chunk);
      if (delayReceiptReadOnce&&req.method==='GET'&&url.pathname==='/api/payments') { delayReceiptReadOnce=false;await new Promise(resolve=>setTimeout(resolve,750)); }
      if (req.method==='PUT'&&/\/tuitioninvoices\/\d+$/.test(url.pathname)) lastEditRequest=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (req.method==='POST'&&url.pathname.endsWith('/generation/confirm')) confirmCalls++;
      if (failPreviewOnce && url.pathname.endsWith('/generation/preview')) {
        failPreviewOnce = false; res.writeHead(503, {'Content-Type':'application/json'}).end(JSON.stringify({message:'Simulated preview outage'})); return;
      }
      if (staleConfirmOnce && url.pathname.endsWith('/generation/confirm')) {
        staleConfirmOnce = false; res.writeHead(409, {'Content-Type':'application/json'}).end(JSON.stringify({message:'Dữ liệu thay đổi. Vui lòng xem trước lại.'})); return;
      }
      if (delayPreviewOnce && url.pathname.endsWith('/generation/preview')) { delayPreviewOnce=false; await new Promise(resolve=>setTimeout(resolve,500)); }
      const response = await fetch(new URL(req.url,api),{method:req.method,headers:{'Content-Type':'application/json'},...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
      traffic.push({method:req.method,path:url.pathname,status:response.status});
      if (loseConfirmOnce && url.pathname.endsWith('/generation/confirm') && response.ok) {
        loseConfirmOnce = false; await response.arrayBuffer(); res.writeHead(503, {'Content-Type':'application/json'}).end(JSON.stringify({message:'Result not confirmed; inspect Preview before retry'})); return;
      }
      if (losePaymentOnce && /\/tuitioninvoices\/\d+\/payments$/.test(url.pathname) && response.ok) {
        losePaymentOnce = false; await response.arrayBuffer(); res.writeHead(503, {'Content-Type':'application/json'}).end(JSON.stringify({message:'Payment result not confirmed; inspect Payments'})); return;
      }
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
const modal="document.querySelector('[aria-label=\"Lập hóa đơn học phí\"]')";
const stat = name => `${modal}.querySelector('[data-testid="generation-${name}"]')`;
async function previewInvoices() { await evaluate(`${modal}.querySelector('[data-testid=generation-preview-button]').click()`); }
async function confirmInvoices() { expectedConfirmCalls++;await evaluate(`(()=>{const b=${modal}.querySelector('[data-testid=generation-confirm]');if(!b||b.disabled)throw Error('Confirm unavailable');b.click();b.click();})()`); }
async function footerVisible() {
  assert.equal(await evaluate(`(()=>{const r=${modal}.querySelector('.modal-footer').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1;})()`),true,'footer remains visible');
  assert.equal(await evaluate(`(()=>{const body=${modal}.querySelector('.modal-body');return [...${modal}.querySelectorAll('*')].filter(n=>n!==body&&['auto','scroll'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+2).length===0;})()`),true,'only modal body scrolls');
}
let billingMonth=5;
async function scenario(role,viewport){
  const month=billingMonth++;
  await send('Page.navigate',{url:origin+'/'+role+'/tuition'});
  await until("!!document.querySelector('#tuition-grade-filter option[value=\"7\"]')",'Grade catalogue');
  await until("document.querySelectorAll('tbody tr').length>0",'real invoice data');
  let before=(await request('tuitioninvoices')).length;
  await click('Lập hóa đơn');await until(`!!${modal}`,'generation modal');
  await until("document.querySelector('#generation-grade').options.length>1 && !document.querySelector('#generation-mode').disabled && !document.querySelector('#generation-mode').closest('fieldset').disabled",'modal catalogue ready');
  assert.equal(await evaluate("document.querySelector('#generation-grade').value"),'0');
  assert.equal(await evaluate(`!!${stat('confirm')}`),false,'no Confirm before Preview');
  assert.equal(await evaluate(`!!${modal}.querySelector('[data-testid=generation-preview]')`),false,'no summary before Preview');
  assert.deepEqual(await evaluate(`[...${modal}.querySelector('.modal-footer').querySelectorAll('button')].map(n=>n.textContent)`),['Đóng','Xem trước']);
  await footerVisible();
  await value('#generation-mode','grade');await value('#generation-grade',7);
  assert.equal(await evaluate("!!document.querySelector('#generation-class')"),false);
  await value('#generation-month',month);await value('#generation-year',2027);
  if (role==='center-manager' && viewport==='desktop') {
    failPreviewOnce=true; await previewInvoices(); await until(`${modal}.textContent.includes('Simulated preview outage')`,'Preview API error');
    assert.equal(await evaluate("document.querySelector('#generation-grade').value"),'7','form retained after API failure');
    assert.equal((await request('tuitioninvoices')).length,before);
    await click('Tải lại dữ liệu',modal);await until(`!${modal}.querySelector('[role=alert]')`,'Retry reload succeeds with form retained');
    delayPreviewOnce=true;
  }
  await previewInvoices();
  if (role==='center-manager'&&viewport==='desktop') {
    await until(`${modal}.querySelector('.modal-body').getAttribute('aria-busy')==='true'`,'Preview loading state');
    assert.equal(await evaluate(`${modal}.querySelector('fieldset').disabled`),true,'configuration locked while request is pending');
  }
  await until(`!!${modal}.querySelector('[data-testid=generation-preview]')`,'backend Preview');
  await until(`(()=>{const h=${modal}.querySelector('#generation-summary-title').getBoundingClientRect(),body=${modal}.querySelector('.modal-body').getBoundingClientRect();return h.top>=body.top-1&&h.bottom<=body.bottom;})()`,'Preview summary brought into view');
  assert.equal((await request('tuitioninvoices')).length,before,'opening modal and Preview never create invoices');
  assert.equal(await evaluate(`${stat('eligible')}.textContent`),'4');
  assert.equal(await evaluate(`${stat('confirm')}.textContent`),'Tạo 4 hóa đơn');
  assert.equal(await evaluate(`${modal}.textContent.includes('3 học sinh')`),true);
  assert.equal(await evaluate(`!!${stat('created')}||!!${stat('failed')}`),false,'Created/Failed hidden before execution');
  assert.equal(await evaluate(`${modal}.querySelector('[data-testid=generation-details]').open`),false,'details collapsed by default');
  await evaluate(`${modal}.querySelector('[data-testid=generation-details] summary').click()`);
  assert.equal(await evaluate(`${modal}.querySelectorAll('.tuition-generation-class').length`),3,'details grouped by Class');
  assert.equal(await evaluate(`${modal}.querySelector('.tuition-generation-student').textContent.includes('Hạn:')`),true,'Student details keep amount/date/reason');
  await footerVisible();
  await send('Page.captureScreenshot',{format:'png'}).then(shot=>fs.writeFileSync(path.join(output,`${viewport}-${role}-preview.png`),Buffer.from(shot.data,'base64')));
  if (role==='center-manager'&&viewport==='desktop') {
    await value('#generation-year',2028);await previewInvoices();await until(`${stat('eligible')}?.textContent==='4'`,'Entire Grade ready');
    await confirmInvoices();await until(`${stat('created')}?.textContent==='4'`,'Entire Grade UI creates real invoices');
    assert.equal((await request('tuitioninvoices')).length,before+4);before+=4;
  }
  await value('#generation-month',11);await value('#generation-year',2026);
  await previewInvoices();
  await until(`${modal}.querySelector('[data-testid=generation-preview]')?.textContent.includes('11/2026')`,'first enrollment month preview');
  assert.equal(await evaluate(`[...${modal}.querySelectorAll('.tuition-generation-student')].some(row=>row.textContent.includes('Tuition Student 6')&&row.textContent.includes('Ghi danh giữa tháng'))`),true,'mid-month Student skipped with explanation');
  assert.equal((await request('tuitioninvoices')).length,before);
  await value('#generation-month',month);await value('#generation-year',2027);
  await previewInvoices();await until(`${modal}.querySelector('[data-testid=generation-preview]')?.textContent.includes('${month}/2027')`,'regular monthly preview restored');
  await value('#generation-mode','class');assert.equal(await evaluate(`!!${modal}.querySelector('[data-testid=generation-preview]')`),false,'mode change invalidates preview');
  assert.equal(await evaluate("document.querySelector('#generation-class').value"),'0');
  await value('#generation-class',601);await previewInvoices();
  await until(`!!${modal}.querySelector('[data-testid=generation-preview]')`,'Class preview');
  const ambiguous=role==='center-manager'&&viewport==='desktop';
  if (role==='admin-staff'&&viewport==='desktop') {
    staleConfirmOnce=true;await confirmInvoices();await until(`${modal}.textContent.includes('Dữ liệu thay đổi')`,'stale preview API rejection');
    assert.equal(await evaluate(`!!${stat('confirm')}||!!${stat('created')}`),false,'stale preview cannot report success or keep Confirm');
    assert.equal(await evaluate("document.querySelector('#generation-class').value"),'601','configuration retained after Confirm error');
    assert.equal((await request('tuitioninvoices')).length,before);
    await previewInvoices();await until(`${stat('eligible')}?.textContent==='3'`,'new Preview after stale result');
  }
  if (ambiguous) loseConfirmOnce=true;
  await confirmInvoices();
  if (ambiguous) await until(`${modal}.textContent.includes('Result not confirmed')`,'ambiguous HTTP result cannot claim success');
  else { await until(`${stat('created')}?.textContent==='3'`,'Class confirm result'); assert.equal(await evaluate(`${stat('failed')}.textContent`),'0'); }
  if (ambiguous) assert.equal(await evaluate(`!!${stat('created')}`),false,'lost response cannot show success');
  assert.equal((await request('tuitioninvoices')).length,before+3);
  await previewInvoices();await until(`${stat('existing')}?.textContent==='3'`,'retry preview skips persisted invoices');
  assert.equal(await evaluate(`${stat('confirm')}.disabled`),true,'all existing cannot resubmit');
  assert.equal(await evaluate(`!!${stat('zero')}`),true,'zero eligible explains why Confirm is disabled');
  await value('#generation-grade',8);await value('#generation-class',603);await previewInvoices();
  await until(`!!${stat('zero')}`,'no eligible Students');
  assert.equal(await evaluate(`${stat('existing')}.textContent`),'0');
  assert.equal(await evaluate(`${stat('confirm')}.disabled`),true,'empty eligible list cannot confirm');
  await value('#generation-grade',7);
  await value('#generation-mode','individual');await value('#generation-class',602);
  await until("document.querySelector('#generation-student').options.length===2",'only eligible enrolled student');
  await value('#generation-student',1001);
  await value('#generation-grade',8);assert.equal(await evaluate("document.querySelector('#generation-class').value"),'0');
  assert.equal(await evaluate("document.querySelector('#generation-student').value"),'0');
  await value('#generation-class',603);await until(`${modal}.textContent.includes('Không có học sinh đủ điều kiện trong kỳ này.')`,'empty eligible Student list');
  assert.equal(await evaluate("document.querySelector('#generation-student').options.length"),1);
  await value('#generation-grade',7);await value('#generation-class',602);
  await until("document.querySelector('#generation-student').options.length===2",'eligible Student reload');
  await value('#generation-student',1001);await value('#generation-amount',1250000);
  await previewInvoices();await until(`${stat('eligible')}?.textContent==='1'`,'individual monthly fee preview');
  await footerVisible();await confirmInvoices();await until(`${stat('created')}?.textContent==='1'`,'individual manual fee persists');
  assert.equal(await evaluate(`!!${stat('confirm')}`),false,'result cannot submit again without Preview');
  assert.equal(await evaluate(`${modal}.querySelector('[data-testid=generation-details]').open`),false,'result details also collapsed by default');
  const invoices=await request('tuitioninvoices');assert.equal(invoices.length,before+4);
  const created=invoices.filter(i=>i.periodYear===2027&&i.periodMonth===month);assert.equal(created.length,4);
  assert.equal(created.find(i=>i.classId===602).amountDue,1250000);
  assert.equal(created.find(i=>i.classId===601&&i.studentId===1006).amountDue,1000000,'regular period never silently includes first-month agreed fee');
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth+2"),true,'viewport has no horizontal overflow');
  await send('Page.captureScreenshot',{format:'png'}).then(shot=>fs.writeFileSync(path.join(output,`${viewport}-${role}-generation.png`),Buffer.from(shot.data,'base64')));
  await evaluate(`${modal}.querySelector('[aria-label="Đóng lập hóa đơn"]').click()`);await until(`!${modal}`,'close');
  await value('#tuition-grade-filter',7);await value('#tuition-month-filter',month);await value('#tuition-year-filter',2027);
  await until("document.querySelector('tbody').textContent.includes('Tuition Student')",'filtered real invoices');
  await until("[...document.querySelectorAll('.dashboard-kpi--currency h3')].map(n=>n.textContent.trim()).join('|')==='4.250.000 VND|0 VND|4.250.000 VND|0 VND'",'Grade/period KPI cohort includes every created invoice');
  const invoiceId=created.find(i=>i.classId===601&&i.studentId===1001).invoiceId;
  const invoiceRow = `(()=>[...document.querySelectorAll('tbody tr')].find(r=>r.querySelectorAll('td')[1]?.textContent.trim()==='INV-${invoiceId}'))()`;
  await evaluate(`[...${invoiceRow}.querySelectorAll('button')].find(b=>b.textContent.trim()==='Sửa').click()`);
  await until("!!document.querySelector('[data-testid=invoice-edit-status]')",'Edit system status');
  assert.equal(await evaluate("document.querySelectorAll('.modal select').length"),0,'Edit has no manual status dropdown');
  await click('Lưu thay đổi',"document.querySelector('.modal')");await until("!document.querySelector('.modal')",'no-payment edit succeeds');
  assert.equal(Object.hasOwn(lastEditRequest,'status'),false,'frontend never sends a manual status');
  await evaluate(`(()=>{const r=[...document.querySelectorAll('tbody tr')].find(r=>r.querySelectorAll('td')[1]?.textContent.trim()==='INV-${invoiceId}');[...r.querySelectorAll('button')].find(b=>b.textContent.trim()==='Thanh toán').click();})()`);
  await until("!!document.querySelector('#manager-payment-amount')",'Payment modal');
  assert.equal(await evaluate("document.querySelector('.modal select').value"),'cash');
  assert.equal(await evaluate("document.querySelector('.modal select').options[0].value"),'cash');
  await value('#manager-payment-amount',300000);
  if (role==='admin-staff' && viewport==='desktop') {
    const paymentsBefore=(await request('payments')).length;
    await value('.modal select','bank_transfer');await value('.modal input[maxlength="100"]','BROWSER_VERIFIED_BANK');
    await click('Xác nhận thanh toán',"document.querySelector('.modal')");
    await until("document.querySelector('.modal').textContent.includes('Cần mã giao dịch')",'unverified external payment blocked in UI');
    assert.equal((await request('payments')).length,paymentsBefore);
    await evaluate("document.querySelector('.modal label.form-check input').click()");
  }
  const ambiguousPayment=role==='center-manager'&&viewport==='desktop';
  if (ambiguousPayment) losePaymentOnce=true;
  await evaluate("const paymentForm=document.querySelector('.modal form');paymentForm.requestSubmit();paymentForm.requestSubmit();");
  if (ambiguousPayment) {
    await until("document.querySelector('.modal').textContent.includes('Payment result not confirmed')",'lost Payment response handled');
    assert.equal(await evaluate("document.querySelector('.modal button[type=submit]').disabled"),true,'ambiguous Payment cannot be blindly resubmitted');
    await click('Đóng và tải lại công nợ/Payments',"document.querySelector('.modal')");
  }
  await until("!document.querySelector('.modal')",'Payment modal closes after confirmation/reconciliation');
  const receipts=(await request('payments')).filter(p=>p.invoiceId===invoiceId);assert.equal(receipts.length,1);assert.equal(receipts[0].amount,300000);
  await until("[...document.querySelectorAll('.dashboard-kpi--currency h3')].map(n=>n.textContent.trim()).join('|')==='4.250.000 VND|300.000 VND|3.950.000 VND|0 VND'",'actual Payment updates filtered balance and Vietnam collection month');
  assert.equal(await evaluate(`${invoiceRow}.textContent.includes('Thanh toán một phần')`),true,'partial invoice clearly identified');
  assert.equal(await evaluate(`[...${invoiceRow}.querySelectorAll('button')].some(b=>b.textContent.trim()==='Sửa')`),false,'receipt locks normal Edit');
  assert.equal(await evaluate(`[...${invoiceRow}.querySelectorAll('button')].some(b=>b.textContent.trim()==='Thanh toán')`),true,'partial balance remains payable');
  await evaluate(`[...${invoiceRow}.querySelectorAll('button')].find(b=>b.textContent.trim()==='Thanh toán').click()`);
  await until("!!document.querySelector('#manager-payment-amount')",'remaining balance modal');
  await value('#manager-payment-amount',700000);await click('Xác nhận thanh toán',"document.querySelector('.modal')");
  await until("!document.querySelector('.modal')",'remaining payment confirmed');
  await until("[...document.querySelectorAll('.dashboard-kpi--currency h3')].map(n=>n.textContent.trim()).join('|')==='4.250.000 VND|1.000.000 VND|3.250.000 VND|0 VND'",'full payment settles filtered balance');
  assert.deepEqual(await evaluate(`[...${invoiceRow}.querySelectorAll('button')].map(b=>b.textContent.trim())`),['Xem hóa đơn'],'Paid invoice exposes View only');
  if (role==='center-manager'&&viewport==='desktop') {
    delayReceiptReadOnce=true;await evaluate(`${invoiceRow}.querySelector('button').click()`);
    await until("!!document.querySelector('.modal')",'loading detail visible');
    await click('Đóng',"document.querySelector('.modal')");await delay(1000);
    assert.equal(await evaluate("!!document.querySelector('.modal')"),false,'late receipt response cannot reopen closed details');
  }
  await evaluate(`${invoiceRow}.querySelector('button').click()`);
  await until("!!document.querySelector('[data-testid=invoice-payment-history]')",'Paid invoice history loaded');
  assert.equal(await evaluate("document.querySelectorAll('[data-testid=invoice-payment-history] li').length"),2,'both real receipts remain visible');
  assert.equal(await evaluate("[...document.querySelectorAll('.modal small')].find(n=>n.textContent.trim()==='Còn nợ').parentElement.querySelector('h6').textContent.trim()"),'0 VND','Paid details show zero remaining');
  await click('Đóng',"document.querySelector('.modal')");await until("!document.querySelector('.modal')",'close Paid invoice details');
  assert.equal(await evaluate("document.querySelector('tbody').textContent.includes('Tuition Class 603')"),false);
  await value('[aria-label="Lọc Class"]',601);await value('#tuition-grade-filter',8);
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Lọc Class\"]').value"),'All','Grade change resets Class filter');
  summary.push(`${role} ${viewport}: configuration/preview/result UX, three modes, zero eligible, expandable details, visible footer, real issuance/retry, Payment/KPI`);console.log('PASS '+summary.at(-1));
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
  assert.deepEqual(faults,[]);assert.ok(traffic.some(t=>t.path==='/api/tuitioninvoices/generation/confirm'&&t.status===200));
  assert.equal(confirmCalls,expectedConfirmCalls,'double-click issues one HTTP Confirm per intentional action');
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,traffic,faults},null,2));
  console.log(`RESULT: ${summary.length} real HTTP browser scenario groups passed. Artifacts: ${output}`);
}catch(error){fs.writeFileSync(path.join(output,'failure.json'),JSON.stringify({error:error.stack,summary,traffic,faults},null,2));console.error('Browser failure artifacts: '+output);throw error;}
finally{
  if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}chrome?.kill();for(const p of pending.values())clearTimeout(p.timer);
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
}
