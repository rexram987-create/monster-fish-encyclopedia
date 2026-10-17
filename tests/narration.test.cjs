const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
function setup(supported=true){
  const nodes=new Map(),events={},spoken=[];
  const localVoice={lang:'he-IL',localService:true},remoteVoice={lang:'he-IL',localService:false};
  const synth={cancelCount:0,getVoices:()=>[remoteVoice,localVoice],cancel(){this.cancelCount++;},speak(u){spoken.push(u);}};
  const window={addEventListener(type,fn){events[type]=fn;}};
  if(supported){window.speechSynthesis=synth;window.SpeechSynthesisUtterance=function(text){this.text=text;};}
  const document={getElementById(id){
    if(!nodes.has(id))nodes.set(id,{value:id==='groupFilter'?'all':'',innerHTML:'',textContent:'',disabled:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();}});
    return nodes.get(id);
  }};
  const ctx={window,document,navigator:{}};vm.createContext(ctx);
  const root=path.join(__dirname,'..');
  vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);ctx.FISH_DATA=ctx.window.FISH_DATA;
  vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);
  return {ctx,nodes,events,spoken,synth,localVoice,run:s=>vm.runInContext(s,ctx)};
}
test('narration starts only on request and reads the full fish entry in bounded Hebrew chunks',async()=>{
  const s=setup();await s.run('openFish(0)');assert.equal(s.spoken.length,0);
  s.run('startNarration()');
  assert.equal(s.spoken[0].lang,'he-IL');assert.equal(s.spoken[0].voice,s.localVoice);
  let index=0;while(index<s.spoken.length){assert.ok(index<100);const u=s.spoken[index++];assert.ok(u.text.length<=220);u.onend();}
  const text=s.spoken.map(u=>u.text).join(' ');
  assert.ok(text.includes(s.ctx.FISH_DATA[0].he));
  assert.ok(text.includes(s.ctx.FISH_DATA[0].ety));
  assert.ok(text.includes('הערות בדיקה.'));
  assert.ok(text.includes('דיווחי שיא היסטוריים גדולים יותר'));
  assert.equal(text,s.run('narrationText(FISH_DATA[0])').replace(/\s+/g,' ').trim());
  assert.ok(!text.includes('https://'));
  assert.equal(s.nodes.get('stopNarration').disabled,true);
});
test('stopping, closing and changing fish invalidate old speech callbacks',async()=>{
  const s=setup();await s.run('openFish(0)');s.run('startNarration()');const old=s.spoken[0];
  s.run('stopNarration()');old.onend();assert.equal(s.spoken.length,1);
  s.run('startNarration()');const second=s.spoken.at(-1);await s.run('openFish(1)');second.onend();assert.equal(s.spoken.length,2);
  s.run('startNarration()');s.nodes.get('fishDialog').close();assert.equal(s.nodes.get('stopNarration').disabled,true);
  assert.ok(s.synth.cancelCount>=3);
});
test('missing browser support and voice errors leave usable controls',async()=>{
  const unsupported=setup(false);await unsupported.run('openFish(0)');assert.equal(unsupported.nodes.get('readNarration').disabled,true);
  const s=setup();s.synth.getVoices=()=>[];await s.run('openFish(0)');s.run('startNarration()');assert.equal(s.spoken[0].lang,'he-IL');
  s.spoken[0].onerror({error:'language-unavailable'});
  assert.equal(s.nodes.get('stopNarration').disabled,true);
  assert.equal(s.nodes.get('readNarration').disabled,false);
  assert.match(s.nodes.get('narrationStatus').textContent,/קול עברי/);
});
