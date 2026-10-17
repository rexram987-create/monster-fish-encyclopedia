const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
test('every species has its own real local WebP included in the offline cache',()=>{
  const swContext={self:{addEventListener(){}}};
  vm.createContext(swContext);
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),swContext);
  const core=vm.runInContext('CORE',swContext);
  const paths=new Set();
  for(const fish of context.window.FISH_DATA){
    assert.match(fish.image,/^images\/fish\/[a-z-]+\.webp$/);
    assert.ok(!paths.has(fish.image),fish.sci);paths.add(fish.image);
    const bytes=fs.readFileSync(path.join(root,fish.image));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
    assert.ok(core.includes('./'+fish.image),fish.sci);
    assert.match(fish.imageCaption,/בינה מלאכותית/);
  }
  assert.equal(paths.size,23);
});
