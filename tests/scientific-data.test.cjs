const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const fish=context.window.FISH_DATA;

test('all 23 records retain their searchable identities and complete descriptions',()=>{
  assert.equal(fish.length,23);
  assert.equal(new Set(fish.map(f=>f.sci)).size,23);
  for(const f of fish) for(const key of ['he','en','sci','range','habitat','diet','conservation','length','weight','danger','ety','doc']) assert.ok(f[key],`${f.sci}: ${key}`);
});

test('every reviewed record has a dated, species-specific FishBase reference and a name reference',()=>{
  for(const f of fish){
    assert.equal(f.reviewedAt,'2026-10-17',f.sci);
    assert.ok(f.references?.length>=2,f.sci);
    const expected=f.sci.replaceAll(' ','-');
    const fb=f.references.find(r=>r.label==='FishBase');
    assert.ok(fb,`${f.sci}: FishBase`);
    assert.equal(new URL(fb.url).pathname.replace(/\.html$/,''),`/summary/${expected}`,f.sci);
    for(const r of f.references){
      assert.equal(new URL(r.url).protocol,'https:');
      assert.ok(r.label);
    }
  }
});

test('known scientific identity errors are corrected without losing the old goonch name',()=>{
  assert.match(fish.find(f=>f.sci==='Balantiocheilos melanopterus').doc,/1850/);
  assert.doesNotMatch(fish.find(f=>f.sci==='Pangasianodon gigas').doc,/Jean Chevey/);
  const goonch=fish.find(f=>f.sci==='Bagarius bagarius');
  assert.ok(goonch);
  assert.match(goonch.en,/Bagarius yarrelli/);
});
