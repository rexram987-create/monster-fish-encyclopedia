const grid=document.getElementById('fishGrid');
const search=document.getElementById('searchInput');
const group=document.getElementById('groupFilter');
const count=document.getElementById('resultCount');
const dialog=document.getElementById('fishDialog');
const content=document.getElementById('dialogContent');
const closeBtn=document.getElementById('closeDialog');
const randomBtn=document.getElementById('randomBtn');
const installBtn=document.getElementById('installBtn');
let deferredPrompt=null;
function tags(f){
  const labels={monster:'Monster Fish','fake-shark':'Shark בשם בלבד',dangerous:'עלול לפצוע'};
  return f.groups.map(g=>`<span class="chip">${labels[g]}</span>`).join('');
}
function card(f,i){
  return `<article class="card" tabindex="0" role="button" data-i="${i}" aria-label="פתיחת פרטים על ${f.he}">
    <div class="card__image"><img loading="lazy" decoding="async" src="${f.image}" alt="${f.he} — המחשה שנוצרה בבינה מלאכותית"></div>
    <div class="card__body"><h2>${f.he}</h2><div>${f.en}</div><div class="latin">${f.sci}</div><div class="chips">${tags(f)}</div>
      <div class="stats"><div class="stat"><b>אורך</b>${f.length}</div><div class="stat"><b>משקל</b>${f.weight}</div></div>
    </div></article>`;
}
function filtered(){
  const q=search.value.trim().toLowerCase(); const g=group.value;
  return FISH_DATA.map((f,i)=>({...f,_i:i})).filter(f=>{
    const text=`${f.he} ${f.en} ${f.sci}`.toLowerCase(); return (!q||text.includes(q))&&(g==='all'||f.groups.includes(g));
  });
}
function render(){
  const list=filtered(); count.textContent=`${list.length} דגים`;
  grid.innerHTML=list.map(f=>card(f,f._i)).join('');
}
async function openFish(i){
  const f=FISH_DATA[i]; if(!f)return; const image=f.image;
  content.innerHTML=`<div class="detail-hero">${image?`<img src="${image}" alt="${f.he} — המחשה שנוצרה בבינה מלאכותית">`:''}</div>
  <div class="detail-body"><p class="image-caption">${f.imageCaption}</p><div class="chips">${tags(f)}</div><h2>${f.he}</h2><div>${f.en}</div><div class="latin">${f.sci}</div>
    <div class="detail-section"><h3>גודל ומשקל</h3><p><strong>אורך:</strong> ${f.length}<br><strong>משקל:</strong> ${f.weight}</p><p class="notice">נתוני שיא משתנים בין מקורות. היישום מעדיף טווחים מדעיים ומדידות מתועדות על פני סיפורי דיג לא־מאומתים.</p></div>
    <div class="detail-section"><h3>אטימולוגיה</h3><p>${f.ety}</p></div>
    <div class="detail-section"><h3>סיפור התיעוד המדעי האירופי</h3><p>${f.doc}</p></div>
    <div class="detail-section"><h3>תפוצה ובית גידול</h3><p><strong>תפוצה:</strong> ${f.range||'מידע יתווסף בהמשך'}<br><strong>בית גידול:</strong> ${f.habitat||'מידע יתווסף בהמשך'}</p></div>
    <div class="detail-section"><h3>תזונה</h3><p>${f.diet||'מידע יתווסף בהמשך'}</p></div>
    <div class="detail-section"><h3>מצב שימור</h3><p>${f.conservation||'יש לבדוק ברשימת IUCN העדכנית'}</p></div>
    <div class="detail-section"><h3>סכנה לבני אדם</h3><p>${f.danger}</p></div>
    <div class="detail-section"><h3>מקורות והערות בדיקה</h3><p>הצלבת מקורות: ${f.reviewedAt==='2026-10-17'?'17.10.2026':f.reviewedAt||'טרם תועדה'}. תאריך זה אינו תאריך הערכת השימור.</p>${f.reviewNote?`<p class="notice">${f.reviewNote}</p>`:''}<div class="source-links">${(f.references||[]).map(r=>`<a target="_blank" rel="noopener" href="${r.url}">${r.label}</a>`).join(' • ')}</div><p>מצבי השימור הוצלבו עם הערכות IUCN המוצגות ב־FishBase; לא כל דפי IUCN היו נגישים ישירות בזמן הבדיקה.</p></div>
  </div>`;
  dialog.showModal();
}
grid.addEventListener('click',e=>{const c=e.target.closest('.card'); if(c)openFish(+c.dataset.i)});
grid.addEventListener('keydown',e=>{const c=e.target.closest('.card'); if(c&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openFish(+c.dataset.i)}});
closeBtn.addEventListener('click',()=>dialog.close()); dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
search.addEventListener('input',render); group.addEventListener('change',render);
randomBtn.addEventListener('click',()=>openFish(Math.floor(Math.random()*FISH_DATA.length)));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});
installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
render();
