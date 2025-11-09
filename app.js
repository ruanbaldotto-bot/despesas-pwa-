
let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.hidden = false;
});
if (btnInstall) {
  btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.hidden = true;
  });
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const DB_NAME='despesasDB'; const DB_VERSION=2; let db;
function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded=(ev)=>{
      const db=ev.target.result;
      if(!db.objectStoreNames.contains('expenses')){ const os=db.createObjectStore('expenses',{keyPath:'id',autoIncrement:true}); os.createIndex('by_date','date',{unique:false});}
      if(!db.objectStoreNames.contains('categories')){ db.createObjectStore('categories',{keyPath:'id',autoIncrement:true}); }
      if(!db.objectStoreNames.contains('cards')){ db.createObjectStore('cards',{keyPath:'id',autoIncrement:true}); }
      if(!db.objectStoreNames.contains('invoices')){ db.createObjectStore('invoices',{keyPath:'id',autoIncrement:true}); }
      if(!db.objectStoreNames.contains('blobs')){ db.createObjectStore('blobs',{keyPath:'id',autoIncrement:true}); }
    };
    req.onsuccess=async(ev)=>{ db=ev.target.result; await seedIfNeeded(); resolve(db);};
    req.onerror=()=>reject(req.error);
  });
}
function tx(name,mode='readonly'){ return db.transaction(name,mode).objectStore(name); }
function countStore(store){ return new Promise((res,rej)=>{ const r=tx(store).count(); r.onsuccess=()=>res(r.result||0); r.onerror=()=>rej(r.error); }); }
async function seedIfNeeded(){ if(await countStore('categories')===0){ for(const c of [
  {name:'Alimentação',icon:'🍽️',budgetMonthly:1200},
  {name:'Transporte',icon:'🚌',budgetMonthly:400},
  {name:'Casa',icon:'🏠',budgetMonthly:1500},
  {name:'Lazer',icon:'🎉',budgetMonthly:300},
  {name:'Saúde',icon:'🩺',budgetMonthly:300},
  {name:'Outros',icon:'🧰',budgetMonthly:null}
]) await addCategory(c);} }
function listCategories(){ return new Promise((res,rej)=>{ const r=tx('categories').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error);}); }
function addCategory(cat){ return new Promise((res,rej)=>{ const r=tx('categories','readwrite').add(cat); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
function updateCategory(cat){ return new Promise((res,rej)=>{ const r=tx('categories','readwrite').put(cat); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function deleteCategory(id){ return new Promise((res,rej)=>{ const r=tx('categories','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addExpense(e){ return new Promise((res,rej)=>{ const r=tx('expenses','readwrite').add(e); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
function listExpensesAll(){ return new Promise((res,rej)=>{ const r=tx('expenses').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error);}); }
function deleteExpense(id){ return new Promise((res,rej)=>{ const r=tx('expenses','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addCard(c){ return new Promise((res,rej)=>{ const r=tx('cards','readwrite').add(c); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
function listCards(){ return new Promise((res,rej)=>{ const r=tx('cards').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error);}); }
function deleteCard(id){ return new Promise((res,rej)=>{ const r=tx('cards','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addInvoice(inv){ return new Promise((res,rej)=>{ const r=tx('invoices','readwrite').add(inv); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
function saveBlob(buf){ return new Promise((res,rej)=>{ const r=tx('blobs','readwrite').add({data:buf}); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
function yyyymm(d){ const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'); }
function withinMonth(date,yymm){ const d=new Date(date); const [y,m]=yymm.split('-').map(n=>parseInt(n,10)); return d.getFullYear()===y && (d.getMonth()+1)===m; }
function fmtCurrency(n){ try{ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0);}catch{return 'R$ '+(n||0).toFixed(2).replace('.',',');} }
function toNumberLocale(s){ if(typeof s==='number') return s; if(!s) return 0; return parseFloat(String(s).replace(/\./g,'').replace(',','.')); }
function dateISO(d){ const x=new Date(d); return x.toISOString().slice(0,10); }

const tabs=document.querySelectorAll('.tab'); const panels=document.querySelectorAll('.tab-panel');
tabs.forEach(b=>b.addEventListener('click',()=>{ tabs.forEach(x=>x.classList.remove('active')); panels.forEach(p=>p.classList.remove('active')); b.classList.add('active'); document.getElementById(b.dataset.tab).classList.add('active'); }));

const mes=document.getElementById('mes'); const mesResumo=document.getElementById('mesResumo'); const today=new Date(); mes.value=yyyymm(today); mesResumo.value=yyyymm(today);
const formAdd=document.getElementById('formAdd'); const valor=document.getElementById('valor'); const dataIn=document.getElementById('data'); const categoriaSel=document.getElementById('categoria'); const nota=document.getElementById('nota'); dataIn.value=dateISO(today);
const listaLanc=document.getElementById('listaLancamentos'); const emptyLanc=document.getElementById('emptyLanc');
const totalMes=document.getElementById('totalMes'); const listaResumoCats=document.getElementById('listaResumoCats'); const emptyResumo=document.getElementById('emptyResumo');
const formCat=document.getElementById('formCat'); const catNome=document.getElementById('catNome'); const catIcone=document.getElementById('catIcone'); const catOrc=document.getElementById('catOrcamento'); const listaCats=document.getElementById('listaCategorias');
const formCard=document.getElementById('formCard'); const cardNome=document.getElementById('cardNome'); const cardFech=document.getElementById('cardFechamento'); const cardVenc=document.getElementById('cardVencimento'); const listaCards=document.getElementById('listaCartoes');
const formFatura=document.getElementById('formFatura'); const selCard=document.getElementById('selCard'); const faturaMes=document.getElementById('faturaMes'); const faturaPDF=document.getElementById('faturaPDF'); const previewCard=document.getElementById('previewCard'); const previewList=document.getElementById('previewList'); const btnSalvarImport=document.getElementById('btnSalvarImport');

async function refreshCategories(selectOnly=false){
  const cats=await listCategories();
  categoriaSel.innerHTML='<option value=\"\">Selecione...</option>'+cats.map(c=>`<option value=\"${c.id}\">${(c.icon||'💸')} ${c.name}</option>`).join('');
  if(selectOnly) return;
  listaCats.innerHTML='';
  for(const c of cats){
    const item=document.createElement('div'); item.className='item';
    const budgetText=(c.budgetMonthly!=null && c.budgetMonthly!=='')?fmtCurrency(Number(c.budgetMonthly)):'—';
    item.innerHTML=`<div class=\"grow\"><div class=\"title\">${c.icon||'🧰'} ${c.name}</div><div class=\"sub\">Orçamento: ${budgetText}</div></div><div class=\"actions\"><button class=\"ghost\" data-edit=\"${c.id}\">Editar</button><button class=\"ghost danger\" data-del=\"${c.id}\">Excluir</button></div>`;
    listaCats.appendChild(item);
  }
  listaCats.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click', async()=>{
    const id=Number(btn.dataset.del); if(confirm('Excluir esta categoria?')){ await deleteCategory(id); await refreshCategories(); await renderResumo(); }}));
  listaCats.querySelectorAll('button[data-edit]').forEach(btn=>btn.addEventListener('click', async()=>{
    const id=Number(btn.dataset.edit); const cats=await listCategories(); const c=cats.find(x=>x.id===id); if(!c) return;
    const nome=prompt('Nome da categoria:', c.name) ?? c.name;
    const icone=prompt('Ícone (emoji):', c.icon||'') ?? c.icon;
    const orc=prompt('Orçamento mensal (R$) - vazio = nenhum:', c.budgetMonthly ?? '');
    c.name=nome.trim()||c.name; c.icon=(icone||'').trim()||c.icon; c.budgetMonthly=(orc===''||orc===null)?null:toNumberLocale(orc);
    await updateCategory(c); await refreshCategories(); await renderResumo(); await renderLanc();
  }));
}

async function renderLanc(){
  const yymm=mes.value; const all=await listExpensesAll(); const cats=await listCategories(); const mapCat=Object.fromEntries(cats.map(c=>[c.id,c]));
  const list=all.filter(e=>withinMonth(e.date,yymm)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  listaLanc.innerHTML=''; let any=false;
  for(const e of list){
    any=true; const c=e.categoryId?mapCat[e.categoryId]:null; const icone=c?.icon||'💸'; const nomeCat=c?.name||'Sem categoria';
    const parcel=(e.installmentsTotal && e.installmentNumber)?` • ${e.installmentNumber}/${e.installmentsTotal}`:''; const via=e.cardName?` • ${e.cardName}`:'';
    const item=document.createElement('div'); item.className='item';
    item.innerHTML=`<div class=\"grow\"><div class=\"title\">${icone} ${nomeCat} • ${fmtCurrency(e.amount)}${parcel}${via}</div><div class=\"sub\">${new Date(e.date).toLocaleDateString('pt-BR')} ${e.note?('• '+e.note):''}</div></div><div class=\"actions\"><button class=\"ghost danger\" data-del=\"${e.id}\">Apagar</button></div>`;
    listaLanc.appendChild(item);
  }
  emptyLanc.hidden=any;
  listaLanc.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click', async()=>{ const id=Number(btn.dataset.del); if(confirm('Apagar este lançamento?')){ await deleteExpense(id); await renderLanc(); await renderResumo(); }}));
}

async function renderResumo(){
  const yymm=mesResumo.value; const all=await listExpensesAll(); const cats=await listCategories(); const mapCat=Object.fromEntries(cats.map(c=>[c.id,c]));
  const list=all.filter(e=>withinMonth(e.date,yymm)); const total=list.reduce((s,e)=>s+Number(e.amount||0),0); totalMes.textContent=fmtCurrency(total);
  const group={}; for(const e of list){ const id=e.categoryId||0; group[id]=(group[id]||{total:0}); group[id].total+=Number(e.amount||0); }
  const entries=Object.entries(group).map(([id,info])=>{ const cat=mapCat[Number(id)]; return {id:Number(id), cat, total:info.total, budget:cat?.budgetMonthly??null}; }).sort((a,b)=>(a.cat?.name||'').localeCompare(b.cat?.name||''));
  listaResumoCats.innerHTML=''; if(entries.length===0){ emptyResumo.hidden=false; return; } emptyResumo.hidden=true;
  for(const row of entries){ const pct=row.budget?Math.min(row.total/(row.budget||1),1):null; const wrap=document.createElement('div'); wrap.className='item';
    wrap.innerHTML=`<div class=\"grow\"><div class=\"title\">${(row.cat?.icon||'💸')} ${(row.cat?.name||'Sem categoria')}</div><div class=\"sub\">${fmtCurrency(row.total)} ${row.budget?`• Orçamento: ${fmtCurrency(row.budget)}`:''}</div>${row.budget?`<div class=\"progress\"><span style=\"width:${(pct*100).toFixed(1)}%\"></span></div>`:''}</div>`;
    listaResumoCats.appendChild(wrap);
  }
}

async function refreshCards(){
  const cards=await listCards();
  selCard.innerHTML='<option value=\"\">Selecione...</option>'+cards.map(c=>`<option value=\"${c.id}\">${c.name}</option>`).join('');
  listaCards.innerHTML='';
  for(const c of cards){
    const item=document.createElement('div'); item.className='item';
    item.innerHTML=`<div class=\"grow\"><div class=\"title\">💳 ${c.name}</div><div class=\"sub\">Fechamento: ${c.closeDay||'—'} • Vencimento: ${c.dueDay||'—'}</div></div><div class=\"actions\"><button class=\"ghost danger\" data-del=\"${c.id}\">Excluir</button></div>`;
    listaCards.appendChild(item);
  }
  listaCards.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click', async()=>{ const id=Number(btn.dataset.del); if(confirm('Excluir este cartão?')){ await deleteCard(id); await refreshCards(); }}));
}

async function exportCSV(){
  const yymm=mes.value; const all=await listExpensesAll(); const cats=await listCategories(); const mapCat=Object.fromEntries(cats.map(c=>[c.id,c]));
  const list=all.filter(e=>withinMonth(e.date,yymm)); if(list.length===0){ alert('Não há lançamentos neste mês.'); return; }
  const rows=[['Data','Valor','Categoria','Nota','Via','Parcela']];
  for(const e of list){
    const cat=e.categoryId?(mapCat[e.categoryId]?.name||'Sem categoria'):'Sem categoria';
    const valor=Number(e.amount||0).toFixed(2).replace('.',',');
    const parcela=(e.installmentsTotal&&e.installmentNumber)?`${e.installmentNumber}/${e.installmentsTotal}`:'';
    rows.push([new Date(e.date).toISOString().slice(0,10), valor, cat, (e.note||'').replace(/,/g,';'), e.cardName||'', parcela]);
  }
  const csv=rows.map(r=>r.join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`despesas_${yymm}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

async function parseInvoicePDF(file){
  if(!window['pdfjsLib']) throw new Error('pdf.js não carregou');
  const data=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data}).promise;
  let lines=[];
  for(let p=1;p<=pdf.numPages;p++){
    const page=await pdf.getPage(p);
    const content=await page.getTextContent();
    const text=content.items.map(i=>i.str).join(' ');
    const split=text.split(/(?=\d{1,2}[\/\-\s](?:\d{1,2}|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez))/i);
    if(split.length>1) lines=lines.concat(split); else lines.push(text);
  }
  lines=lines.map(s=>s.replace(/\s{2,}/g,' ').replace(/\u00A0/g,' ').trim()).filter(s=>s.length>0);
  const items=[];
  const reDate=/(?<d>\d{1,2})[\/\-\s](?<m>\d{1,2}|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i;
  const reAmount=/R\$\s*([\d\.\,]+)/;
  const reInstall=/(?:(\d{1,2})\s*\/\s*(\d{1,2}))|(?:(\d{1,2})\s*x)/i;
  for(const raw of lines){
    const s=raw; const mAmount=s.match(reAmount); if(!mAmount) continue;
    let desc=s; let day=1; const mDate=s.match(reDate);
    if(mDate){ const idx=mDate.index+(mDate[0]||'').length; day=parseInt(mDate.groups?.d||'1',10); desc=s.slice(idx).trim(); }
    desc=desc.replace(reAmount,'').trim();
    let instNum=null,instTot=null; const mInst=s.match(reInstall);
    if(mInst){ if(mInst[1]&&mInst[2]){ instNum=parseInt(mInst[1]); instTot=parseInt(mInst[2]); } else if(mInst[3]){ instTot=parseInt(mInst[3]); } }
    const amt=parseFloat(String(mAmount[1]).replace(/\./g,'').replace(',','.'));
    items.push({day, desc, amount:amt, installmentsTotal:instTot, installmentNumber:instNum});
  }
  const unique=[]; const seen=new Set();
  for(const it of items){ const key=[it.day,it.amount,(it.desc||'').slice(0,30)].join('|'); if(it.amount>=0.01 && !seen.has(key)){ unique.push(it); seen.add(key);} }
  return unique;
}

document.getElementById('btnExport').addEventListener('click', exportCSV);
mes.addEventListener('change', renderLanc);
mesResumo.addEventListener('change', renderResumo);
formAdd.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const val=parseFloat(String(valor.value).replace(/\./g,'').replace(',','.'));
  const dt=dataIn.value||dateISO(new Date());
  const catId=Number(categoriaSel.value);
  if(!val||!catId){ alert('Informe valor e categoria.'); return; }
  await addExpense({amount:Number(val), date:new Date(dt).toISOString(), note:(nota.value||'').trim(), categoryId:catId});
  valor.value=''; nota.value=''; dataIn.value=dateISO(new Date());
  await renderLanc(); await renderResumo();
});
formCat.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nome=(catNome.value||'').trim(); const icone=(catIcone.value||'').trim()||'🧰'; const orc=catOrc.value===''?null:parseFloat(String(catOrc.value).replace(/\./g,'').replace(',','.'));
  if(!nome){ alert('Informe um nome.'); return; }
  await addCategory({name:nome, icon:icone, budgetMonthly:orc}); catNome.value=''; catIcone.value=''; catOrc.value=''; await refreshCategories(); await renderResumo();
});
formCard.addEventListener('submit', async (e)=>{
  e.preventDefault(); const name=(cardNome.value||'').trim(); const closeDay=cardFech.value?parseInt(cardFech.value,10):null; const dueDay=cardVenc.value?parseInt(cardVenc.value,10):null;
  if(!name){ alert('Informe o nome do cartão.'); return; } await addCard({name, closeDay, dueDay}); cardNome.value=''; cardFech.value=''; cardVenc.value=''; await refreshCards();
});

let importBuffer=[];
formFatura.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const cardId=Number(selCard.value); const cardName=selCard.options[selCard.selectedIndex]?.text||''; const yymm=faturaMes.value; const file=faturaPDF.files[0];
  if(!cardId||!yymm||!file){ alert('Selecione cartão, mês e o PDF.'); return; }
  const buf=await file.arrayBuffer(); const blobId=await saveBlob(buf); await addInvoice({cardId, yymm, blobId, createdAt:new Date().toISOString()});
  previewList.innerHTML='<div class=\"sub\">Lendo fatura e tentando identificar compras…</div>'; previewCard.style.display='block';
  try{
    const parsed=await parseInvoicePDF(file);
    if(!parsed||parsed.length===0){ previewList.innerHTML='<div class=\"sub\">Não consegui identificar itens automaticamente. Você ainda pode manter o PDF anexado à fatura para consulta.</div>'; importBuffer=[]; return; }
    importBuffer=parsed.map(it=>({...it, categoryId:null}));
    await buildPreview(cardName, yymm);
  }catch(err){ console.error(err); previewList.innerHTML='<div class=\"sub\">Erro ao ler o PDF. Talvez seja necessário exportar CSV pelo app do banco.</div>'; importBuffer=[]; }
});
async function buildPreview(cardName, yymm){
  const cats=await listCategories(); previewList.innerHTML='';
  for(let i=0;i<importBuffer.length;i++){
    const it=importBuffer[i]; const row=document.createElement('div'); row.className='item';
    const sel='<select data-idx=\"'+i+'\" class=\"selCat\">' + ['<option value=\"\">Categoria…</option>'].concat(cats.map(c=>`<option value=\"${c.id}\">${c.icon||'💸'} ${c.name}</option>`)).join('') + '</select>';
    row.innerHTML=`<div class=\"grow\"><div class=\"title\">${fmtCurrency(it.amount)} • ${it.desc||'—'} • ${it.installmentNumber?it.installmentNumber:'?'}${it.installmentsTotal?'/'+it.installmentsTotal:''}</div><div class=\"sub\">Dia ${String(it.day).padStart(2,'0')} • ${cardName}</div><div class=\"row\">${sel}</div></div>`;
    previewList.appendChild(row);
  }
  previewList.querySelectorAll('select.selCat').forEach(sel=>sel.addEventListener('change',(ev)=>{ const idx=Number(ev.target.getAttribute('data-idx')); importBuffer[idx].categoryId=Number(ev.target.value)||null; }));
  btnSalvarImport.onclick=async()=>{
    if(importBuffer.length===0){ alert('Nada para importar.'); return; }
    const [year,month]=yymm.split('-').map(n=>parseInt(n,10));
    for(const it of importBuffer){
      const d=new Date(year, month-1, Math.max(1, Math.min(28, Number(it.day)||1)));
      await addExpense({amount:Number(it.amount||0), date:d.toISOString(), note:it.desc||'', categoryId:it.categoryId||null, cardName:cardName, installmentsTotal:it.installmentsTotal||null, installmentNumber:it.installmentNumber||null});
    }
    importBuffer=[]; previewCard.style.display='none'; await renderLanc(); await renderResumo(); alert('Importação concluída!');
  };
}

(async function init(){ await openDB(); await refreshCategories(); await renderLanc(); await renderResumo(); await refreshCards(); faturaMes.value=yyyymm(new Date()); })();
