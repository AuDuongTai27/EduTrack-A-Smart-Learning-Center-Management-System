import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

// Only the migrated, isolated test assembly accepts this nonce. No production identity bypass.
const origin=process.env.EDUTRACK_SCHEDULE_TEST_ORIGIN,nonce=process.env.EDUTRACK_SCHEDULE_TEST_NONCE;
assert.match(origin??'',/^http:\/\/127\.0\.0\.1:\d+$/);assert.match(nonce??'',/^[a-f0-9]{32}$/);
const output=fs.mkdtempSync(path.join(os.tmpdir(),'edutrack-schedule-version-browser-'));
const bootstrap=fs.readFileSync('src/assets/css/bootstrap.min.css'),icons=fs.readFileSync('src/assets/css/bootstrap-icons.css');
const pending=new Map(),failures=[],requests=[],summary=[];
let chrome,socket,session,sequence=0;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const query=selector=>'document.querySelector('+JSON.stringify(selector)+')';
function send(method,params={},target=session){return new Promise((resolve,reject)=>{
  const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(target?{sessionId:target}:{})}));
});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expression,label){const end=Date.now()+15000;while(Date.now()<end){if(await evaluate('Boolean('+expression+')'))return;await delay(40);}throw Error('Timed out '+label+'\n'+await evaluate('document.body.innerText.slice(-4500)'));}
async function click(selector){assert.ok(await evaluate('Boolean('+query(selector)+')'),selector);await evaluate(query(selector)+'.click()');}
async function clickText(text,scope='body'){const expr='Array.from(document.querySelectorAll('+JSON.stringify(scope+' button')+')).find(b=>b.textContent.trim()==='+JSON.stringify(text)+')';assert.ok(await evaluate('Boolean('+expr+')'),'Button '+text);await evaluate(expr+'.click()');}
async function setInput(label,value){const selector='[aria-label="'+label+'"]';await evaluate('(()=>{const input='+query(selector)+';const setter=Object.getOwnPropertyDescriptor(input.tagName==="SELECT"?HTMLSelectElement.prototype:HTMLInputElement.prototype,"value").set;setter.call(input,'+JSON.stringify(value)+');input.dispatchEvent(new Event(input.tagName==="SELECT"?"change":"input",{bubbles:true}));})()');}
async function chooseClass(id){await setInput('Class quản lý lịch',String(id));await until(query('.schedule-template-table'),'templates loaded');}
async function navigate(actor,route){await send('Network.setCookie',{name:'schedule_test_actor',value:nonce+':'+actor,url:origin,httpOnly:true});await send('Page.navigate',{url:origin+'/'+route+'/schedule'});await until('document.querySelector(".et-schedule-summary")&&!document.querySelector(".et-schedule-state")?.textContent.includes("Đang tải")','Calendar/List ready');}
async function openManagement(text){await clickText(text);await until(query('[aria-label="Class quản lý lịch"]'),'capabilities');}
async function shot(name,selector){await evaluate(query(selector)+'.scrollIntoView({block:"start",behavior:"instant"})');await delay(100);const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(r.data,'base64'));}
async function templates(){return evaluate('fetch("/api/schedule/management/templates?classId=803",{credentials:"include",cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.json();})');}
async function previewGeneration(){await clickText('Xem trước phiên học');await until(query('.schedule-generation-preview'),'generation preview');}
async function confirmGeneration(){const label=await evaluate('Array.from(document.querySelectorAll(".schedule-generation-preview button")).find(b=>b.textContent.includes("Xác nhận tạo")).textContent.trim()');await clickText(label);await until('document.querySelector(".schedule-generation-preview").textContent.includes("Kết quả xác nhận")','generation confirmed');}
async function confirmTemplate(){await clickText('Xác nhận thay đổi lịch');await until('document.querySelector(".schedule-management [role=status]")?.textContent.includes("Đã lưu")','timeline confirmed');await until(query('.schedule-template-table'),'updated timeline');}
async function paused(event){
  const url=new URL(event.request.url);
  if(url.origin!==origin){
    if(url.pathname.endsWith('/bootstrap.min.css')||url.pathname.endsWith('/bootstrap-icons.min.css')){await send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/css'}],body:(url.pathname.endsWith('/bootstrap.min.css')?bootstrap:icons).toString('base64')});return;}
    await send('Fetch.failRequest',{requestId:event.requestId,errorReason:'BlockedByClient'});return;
  }
  if(url.pathname.startsWith('/api/')){
    requests.push({path:url.pathname,method:event.request.method,body:event.request.postData});
    if(url.pathname.startsWith('/api/schedule/')){await send('Fetch.continueRequest',{requestId:event.requestId});return;}
    assert.equal(event.request.method,'GET','No writes outside Schedule');
    await send('Fetch.fulfillRequest',{requestId:event.requestId,responseCode:503,body:Buffer.from('{}').toString('base64')});return;
  }
  await send('Fetch.continueRequest',{requestId:event.requestId});
}
try{
  const ws=await new Promise((resolve,reject)=>{
    chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-sandbox','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+path.join(output,'profile'),'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
    const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),10000);chrome.on('error',reject);chrome.stderr.on('data',chunk=>{const m=chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
  });
  socket=new WebSocket(ws);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}}else if(m.method==='Fetch.requestPaused')paused(m.params).catch(e=>failures.push(e.message));});
  const target=await send('Target.createTarget',{url:'about:blank'},null);({sessionId:session}=await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*'}]});
  await send('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:'(()=>{const D=Date,fixed=D.parse("2027-01-04T01:00:00Z");window.Date=class extends D{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};})()'});
  for(const [viewport,width,height,start,end,newStart,newEnd] of [['desktop',1440,1100,'10:00','11:00','06:00','07:00'],['mobile',390,844,'12:00','13:00','08:00','09:00'],['small-mobile',360,780,'14:00','15:00','10:00','11:00']]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    const manager=viewport==='mobile'?'admin-staff':'center-manager';
    await navigate(manager,manager);await openManagement('Quản lý lịch cố định');await chooseClass(803);
    await setInput('Tuần hiệu lực','2027-01-04');await setInput('Thứ template','Tuesday');await setInput('Giờ bắt đầu template',start);await setInput('Giờ kết thúc template',end);await setInput('Phòng template','QA Browser '+viewport);
    const templateConfirms=requests.filter(r=>r.path.endsWith('/templates/confirm')).length;
    await clickText('Xem trước thay đổi lịch');await until(query('.schedule-template-preview'),'template Preview');
    assert.equal(requests.filter(r=>r.path.endsWith('/templates/confirm')).length,templateConfirms,'Template Preview does not auto-confirm');await confirmTemplate();
    const root=(await templates()).find(s=>s.room==='QA Browser '+viewport);assert.ok(root);const templateId=String(root.scheduleId);const originalVersion=root.versions[0].scheduleVersionId;
    await navigate('teacher','teacher');await openManagement('Tạo phiên học');await chooseClass(803);
    assert.equal(await evaluate('Boolean('+query('[aria-label="Cấp lịch cố định"]')+')'),false,'Teacher cannot allocate versions');
    await setInput('Khung giờ được cấp',templateId);await setInput('Ngày học','2027-01-06');await clickText('Xem trước phiên học');
    await until('document.querySelector(".schedule-management [role=alert]")?.textContent.includes("đúng thứ")','backend planned weekday error');
    await setInput('Ngày học','2027-01-05');const confirms=requests.filter(r=>r.path.endsWith('/sessions/confirm')).length;
    const countBefore=await evaluate('document.querySelectorAll(".et-schedule-session").length');await previewGeneration();
    assert.equal(requests.filter(r=>r.path.endsWith('/sessions/confirm')).length,confirms);assert.equal(await evaluate('document.querySelectorAll(".et-schedule-session").length'),countBefore);
    await evaluate('(()=>{const b=Array.from(document.querySelectorAll(".schedule-generation-preview button")).find(b=>b.textContent.includes("Xác nhận tạo"));b.click();b.click();})()');
    await until('document.querySelector(".schedule-generation-preview [data-outcome=created]")','single occurrence saved');
    assert.equal(requests.filter(r=>r.path.endsWith('/sessions/confirm')).length,confirms+1,'Double click submits one command');
    const firstId=await evaluate('document.querySelector(".schedule-generation-preview [data-outcome=created]").textContent.match(/#([0-9]+)/)[1]');
    await until(query('.et-schedule-session[data-session-id="'+firstId+'"]'),'same actual Session in Calendar');
    await clickText('List');assert.ok(await evaluate('Boolean('+query('.et-schedule-table [data-session-id="'+firstId+'"]')+')'),'same Session in List');await clickText('Calendar');
    await setInput('Chế độ tạo phiên','month');await setInput('Tháng tạo phiên','2027-01');await previewGeneration();
    assert.equal(await evaluate('document.querySelectorAll(".schedule-generation-preview [data-outcome=eligible]").length'),3);await confirmGeneration();
    const sourceSessions=await evaluate('fetch("/api/schedule/sessions?from=2027-01-01&toExclusive=2027-02-01",{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(rows=>rows.filter(s=>s.scheduleId==='+templateId+'))');assert.equal(sourceSessions.length,4);
    await navigate(manager,manager);await openManagement('Quản lý lịch cố định');await chooseClass(803);
    await click('[data-template-id="'+templateId+'"] button.btn-outline-primary');await setInput('Tuần hiệu lực','2027-01-11');await setInput('Thứ template','Wednesday');await setInput('Giờ bắt đầu template',newStart);await setInput('Giờ kết thúc template',newEnd);await setInput('Phòng template','QA New '+viewport);
    await clickText('Xem trước thay đổi lịch');await until(query('.schedule-template-preview'),'future version Preview');
    assert.equal(await evaluate('document.querySelectorAll("[data-retained-session]").length'),3,'All already generated future occurrences retained');
    await shot('future-version-preview-'+viewport,'.schedule-template-preview');await confirmTemplate();
    const changed=(await templates()).find(s=>s.scheduleId===root.scheduleId);assert.equal(changed.versions.length,2);assert.equal(changed.versions[0].effectiveTo,'2027-01-11');assert.equal(changed.versions[1].dayOfWeek,'Wednesday');
    const retained=await evaluate('fetch("/api/schedule/sessions?from=2027-01-01&toExclusive=2027-02-01",{credentials:"include",cache:"no-store"}).then(r=>r.json()).then(rows=>rows.filter(s=>s.scheduleId==='+templateId+'))');
    assert.deepEqual(retained,sourceSessions,'Template change leaves Session IDs/source/planned/actual intact');
    await navigate('teacher','teacher');await openManagement('Tạo phiên học');await chooseClass(803);await setInput('Chế độ tạo phiên','month');await setInput('Tháng tạo phiên','2027-01');await previewGeneration();
    assert.equal(await evaluate('document.querySelectorAll(".schedule-generation-preview [data-outcome=eligible]").length'),0);
    assert.ok(await evaluate('document.querySelector(".schedule-generation-preview").textContent.includes("version trước")'));
    assert.ok(retained.every(s=>s.scheduleVersionId===originalVersion));await shot('retained-old-version-'+viewport,'.schedule-generation-preview');
    await setInput('Tháng tạo phiên','2027-02');await previewGeneration();
    const prefix='[data-occurrence-key^="'+templateId+':"]';
    assert.equal(await evaluate('document.querySelectorAll('+JSON.stringify(prefix+'[data-outcome=eligible]')+').length'),4,'Uncreated future weeks use new version');await confirmGeneration();
    await navigate(manager,manager);await openManagement('Quản lý lịch cố định');await chooseClass(803);await click('[data-template-id="'+templateId+'"] button.btn-outline-danger');await setInput('Tuần hiệu lực','2027-02-15');
    await clickText('Xem trước thay đổi lịch');await until(query('.schedule-template-preview'),'retire Preview');assert.equal(await evaluate('document.querySelectorAll("[data-retained-session]").length'),2);await confirmTemplate();
    const retired=(await templates()).find(s=>s.scheduleId===root.scheduleId);assert.equal(retired.versions[1].effectiveTo,'2027-02-15');
    await navigate('teacher','teacher');await openManagement('Tạo phiên học');await chooseClass(803);await setInput('Chế độ tạo phiên','month');await setInput('Tháng tạo phiên','2027-02');await previewGeneration();
    assert.equal(await evaluate('document.querySelectorAll('+JSON.stringify(prefix+'[data-outcome=existing]')+').length'),4,'Retire preserves generated February Sessions');
    await shot('retired-future-occurrences-'+viewport,'.schedule-generation-preview');
    await setInput('Tháng tạo phiên','2027-03');await previewGeneration();assert.equal(await evaluate('document.querySelectorAll('+JSON.stringify(prefix)+').length'),0,'No new occurrence after retire');
    assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth+2'),false,'Version panel stays contained at '+viewport);
    summary.push(viewport);console.log('PASS migrated version UI '+viewport+': create/replace/retire Preview/Confirm, retained source/planned/actual, no re-generation, Calendar/List IDs, containment');
  }
  for(const role of ['teaching-assistant','student']){await navigate(role,role);assert.equal(await evaluate('Array.from(document.querySelectorAll("button")).some(b=>["Tạo phiên học","Quản lý lịch cố định"].includes(b.textContent.trim()))'),false);}
  await navigate('teaching-assistant','teacher');await clickText('Tạo phiên học');await until(query('.schedule-management [role=alert]'),'TA cannot obtain Teacher capabilities');
  assert.equal(await evaluate('Boolean('+query('[aria-label="Tạo phiên học"]')+')'),false);
  await send('Network.deleteCookies',{name:'schedule_test_actor',url:origin});await send('Page.navigate',{url:origin+'/teacher/schedule'});await until(query('.et-schedule-error'),'anonymous Calendar denied');await clickText('Tạo phiên học');await until('document.querySelector(".schedule-management [role=alert]")?.textContent.includes("Chưa xác thực")','anonymous management denied');
  assert.deepEqual(failures,[]);fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({summary,requests,failures},null,2));console.log('BROWSER RESULTS: '+summary.length+' migrated version/occurrence viewport groups. ARTIFACTS: '+output);
}finally{if(socket?.readyState===1){await send('Browser.close',{},null).catch(()=>{});socket.close();}chrome?.kill();for(const p of pending.values())clearTimeout(p.timer);}
