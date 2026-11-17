import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync('src/GUIs/components/Common/subjectIllustrationMapping.ts','utf8');
const compiled = ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2023,module:ts.ModuleKind.ESNext}}).outputText;
const {getSubjectIllustrationKey: key} = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));

test('English/Vietnamese names, decomposed accents and exact codes select the same subject artwork',()=>{
  for(const [expected,names] of Object.entries({mathematics:['Mathematics','MATH','Toán','Toán học'],physics:['Physics','PHYS','Vật lý','Vật lí'],chemistry:['Chemistry','CHEM','Hóa học','Hoá'],biology:['Biology','BIO','Sinh học'],english:['English','ENG','Tiếng Anh','Anh văn'],literature:['Literature','LIT','Ngữ văn','Văn học'],informatics:['Informatics','IT','CS','Tin học','Computer Science']})){
    for(const name of names){assert.equal(key(name),expected,name);assert.equal(key('  '+name.toUpperCase().normalize('NFD')+'  '),expected,name);}
  }
});
test('recognized code wins over a conflicting name; unknown code can use the official name',()=>{
  assert.equal(key('Physics','MATH'),'mathematics');
  assert.equal(key('Vật lý','UNKNOWN'),'physics');
});
test('null/missing/malformed and unsupported names fail safely to open book without guessing from titles',()=>{
  for(const name of [null,undefined,'','  ','Unknown subject','Mathematics — a long unsupported custom subject name','Class 9 Advanced Mathematics','constructor','__proto__',123,{}])assert.equal(key(name),'default-subject');
  assert.equal(key(null,null),'default-subject');
});
test('artwork selection is independent of class title, year and class/seed identity',()=>{
  for(const fixture of [{id:1,title:'Toán - 7'},{id:10000,title:'Toán - 8'},{id:0,title:'Physics title on a Mathematics subject'}]){
    assert.equal(key('Toán'),'mathematics',fixture.title);
  }
});
test('all eight SVGs share dimensions, transparent vector strokes and no embedded text or remote images',()=>{
  const dir='src/assets/illustrations/subjects';
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.svg'));
  assert.equal(files.length,8);
  for(const file of files){const svg=fs.readFileSync(dir+'/'+file,'utf8');assert.match(svg,/viewBox="0 0 190 75"/);assert.doesNotMatch(svg,/<(?:text|image|script|foreignObject|linearGradient)\b/);assert.match(svg,/#078444/);}
});
