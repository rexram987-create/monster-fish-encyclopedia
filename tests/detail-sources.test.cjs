const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

test('opening a fish shows its checked references and unresolved scientific caveats',async()=>{
  const nodes=new Map();
  const document={getElementById(id){
    if(!nodes.has(id)) nodes.set(id,{value:id==='groupFilter'?'all':'',innerHTML:'',dataset:{},addEventListener(){},querySelectorAll(){return[];},showModal(){this.open=true;},close(){this.open=false;}});
    return nodes.get(id);
  }};
  const context={document,window:{addEventListener(){}},navigator:{},fetch:async()=>({json:async()=>({})})};
  vm.createContext(context);
  const root=path.join(__dirname,'..');
  vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
  context.FISH_DATA=context.window.FISH_DATA;
  vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
  for(let i=0;i<context.FISH_DATA.length;i++){
    await vm.runInContext(`openFish(${i})`,context);
    const html=nodes.get('dialogContent').innerHTML;
    const fish=context.FISH_DATA[i];
    for(const ref of fish.references) assert.ok(html.includes(`href="${ref.url}"`),`${fish.sci}: ${ref.label}`);
    assert.ok(html.includes(fish.reviewNote),`${fish.sci}: caveat`);
    assert.ok(html.includes('17.10.2026'));
    assert.equal(nodes.get('fishDialog').open,true);
  }
});
