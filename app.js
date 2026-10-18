function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"\"":'&quot;',"'":'&#39;'}[c]));}

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
  navigator.serviceWorker.register('./sw.js').catch(()=>alert('Cache offline indisponível neste navegador.'));
}
if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
	  // A workerSrc é definida no index.html para garantir que o pdf.js esteja carregado antes de app.js
	  // window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js';
}

	const DB_NAME='despesasDB'; const DB_VERSION=5; let db;
function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded=(ev)=>{
      const db=ev.target.result;
      if(!db.objectStoreNames.contains('events')) db.createObjectStore('events',{keyPath:'id'});
      if(!db.objectStoreNames.contains('settings')) db.createObjectStore('settings',{keyPath:'id'});
	      // Migração V3 -> V4 (se DB_VERSION for 4)
	      if(ev.oldVersion < 4) {
	        if(!db.objectStoreNames.contains('expenses')){ const os=db.createObjectStore('expenses',{keyPath:'id',autoIncrement:true}); os.createIndex('by_date','date',{unique:false});}
	        if(!db.objectStoreNames.contains('categories')){ db.createObjectStore('categories',{keyPath:'id',autoIncrement:true}); }
	        if(!db.objectStoreNames.contains('cards')){ db.createObjectStore('cards',{keyPath:'id',autoIncrement:true}); }
	        if(!db.objectStoreNames.contains('invoices')){ const os=db.createObjectStore('invoices',{keyPath:'id',autoIncrement:true}); os.createIndex('hash', 'hash', { unique: true }); }
	        if(!db.objectStoreNames.contains('blobs')){ db.createObjectStore('blobs',{keyPath:'id',autoIncrement:true}); }
	      }
	      // Garantir o índice 'hash' em 'invoices' para idempotência
	      if(db.objectStoreNames.contains('invoices')) {
	        const os = req.transaction.objectStore('invoices');
	        if (!os.indexNames.contains('hash')) {
	          os.createIndex('hash', 'hash', { unique: true });
	        }
	      }
    };
    req.onsuccess=async(ev)=>{try{db=ev.target.result;db.onversionchange=()=>db.close();await seedIfNeeded();resolve(db);}catch(e){reject(e);}};
    req.onblocked=()=>reject(new Error('Feche outras abas do aplicativo para atualizar o banco.'));
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
function addCategory(value){return Ledger.write(db,'categories',{...value,version:value.version||1});}
function updateCategory(value){return Ledger.write(db,'categories',{...value,version:value.version||1});}
function deleteCategory(id){ return new Promise((res,rej)=>{ const r=tx('categories','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addExpense(value){return Ledger.write(db,'expenses',{...value,version:value.version||1});}
function listExpensesAll(){ return new Promise((res,rej)=>{ const r=tx('expenses').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error);}); }
function deleteExpense(id){ return new Promise((res,rej)=>{ const r=tx('expenses','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addCard(value){return Ledger.write(db,'cards',{...value,version:value.version||1});}
function listCards(){ return new Promise((res,rej)=>{ const r=tx('cards').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error);}); }
function deleteCard(id){ return new Promise((res,rej)=>{ const r=tx('cards','readwrite').delete(id); r.onsuccess=()=>res(true); r.onerror=()=>rej(r.error);}); }
function addInvoice(value){return Ledger.write(db,'invoices',{...value,version:value.version||1});}
	function saveBlob(buf){ return new Promise((res,rej)=>{ const r=tx('blobs','readwrite').add({data:buf}); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error);}); }
	
	// Função para calcular o hash SHA-256 de um ArrayBuffer
	async function sha256(buffer) {
	  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	  const hashArray = Array.from(new Uint8Array(hashBuffer));
	  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	  return hashHex;
	}
	
function yyyymm(d){ const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'); }
function withinMonth(date,yymm){ const d=new Date(String(date).slice(0,10)+'T12:00:00'); const [y,m]=yymm.split('-').map(n=>parseInt(n,10)); return d.getFullYear()===y && (d.getMonth()+1)===m; }
function fmtCurrency(n){ try{ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0);}catch{return 'R$ '+(n||0).toFixed(2).replace('.',',');} }
function toNumberLocale(s){ return Fatura.money(s)/100; }
function dateISO(d){const x=new Date(d);return yyyymm(x)+'-'+String(x.getDate()).padStart(2,'0');}

// UI bits
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
  categoriaSel.innerHTML='<option value=\"\">Selecione...</option>'+cats.map(c=>`<option value=\"${escapeHTML(c.id)}\">${escapeHTML(c.icon||'💸')} ${escapeHTML(c.name)}</option>`).join('');
  if(selectOnly) return;
  listaCats.innerHTML='';
  for(const c of cats){
    const item=document.createElement('div'); item.className='item';
    const budgetText=(c.budgetMonthly!=null && c.budgetMonthly!=='')?fmtCurrency(Number(c.budgetMonthly)):'—';
    item.innerHTML=`<div class=\"grow\"><div class=\"title\">${escapeHTML(c.icon||'🧰')} ${escapeHTML(c.name)}</div><div class=\"sub\">Orçamento: ${budgetText}</div></div><div class=\"actions\"><button class=\"ghost\" data-edit=\"${escapeHTML(c.id)}\">Editar</button><button class=\"ghost danger\" data-del=\"${escapeHTML(c.id)}\">Excluir</button></div>`;
    listaCats.appendChild(item);
  }
  listaCats.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click', async()=>{
    const id=Number(btn.dataset.del); if(confirm('Excluir esta categoria?')){ await deleteCategory(id); await refreshCategories(); await renderResumo(); }
  }));
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
  const list=all.filter(e=>withinMonth(e.invoiceMonth?e.invoiceMonth+'-01':e.date,yymm)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  listaLanc.innerHTML=''; let any=false;
  for(const e of list){
    any=true; const c=e.categoryId?mapCat[e.categoryId]:null; const icone=c?.icon||'💸'; const nomeCat=c?.name||'Sem categoria';
    const parcel=(e.installmentsTotal && e.installmentNumber)?` • ${e.installmentNumber}/${e.installmentsTotal}`:''; const via=e.cardName?` • ${escapeHTML(e.cardName)}`:'';
    const item=document.createElement('div'); item.className='item';
    item.innerHTML=`<div class=\"grow\"><div class=\"title\">${escapeHTML(icone)} ${escapeHTML(nomeCat)} • ${fmtCurrency(Fatura.cents(e)/100)}${parcel}${via}</div><div class=\"sub\">${new Date(e.date.slice(0,10)+'T12:00:00').toLocaleDateString('pt-BR')} ${e.note?('• '+escapeHTML(e.note)):''}</div></div><div class=\"actions\"><button class=\"ghost danger\" data-del=\"${escapeHTML(e.id)}\">Apagar</button></div>`;
    listaLanc.appendChild(item);
  }
  emptyLanc.hidden=any;
  listaLanc.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click', async()=>{
    const id=Number(btn.dataset.del); if(confirm('Apagar este lançamento?')){ await deleteExpense(id); await renderLanc(); await renderResumo(); if(typeof refreshIntelligence==='function')await refreshIntelligence(); }
  }));
}

async function renderResumo(){
  const yymm=mesResumo.value; const all=await listExpensesAll(); const cats=await listCategories(); const mapCat=Object.fromEntries(cats.map(c=>[c.id,c]));
  const list=all.filter(e=>withinMonth(e.invoiceMonth?e.invoiceMonth+'-01':e.date,yymm)&&e.kind!=='bankPayment'); const total=list.reduce((s,e)=>s+Fatura.cents(e),0)/100; totalMes.textContent=fmtCurrency(total);
  const group={}; for(const e of list){ const id=e.categoryId||0; group[id]=(group[id]||{total:0}); group[id].total+=Fatura.cents(e); }
  const entries=Object.entries(group).map(([id,info])=>{ const cat=mapCat[Number(id)]; return {id:Number(id), cat, total:info.total/100, budget:cat?.budgetMonthly??null}; }).sort((a,b)=>(a.cat?.name||'').localeCompare(b.cat?.name||''));
  listaResumoCats.innerHTML=''; if(entries.length===0){ emptyResumo.hidden=false; return; } emptyResumo.hidden=true;
  for(const row of entries){ const pct=row.budget?Math.min(row.total/(row.budget||1),1):null; const wrap=document.createElement('div'); wrap.className='item';
    wrap.innerHTML=`<div class=\"grow\"><div class=\"title\">${escapeHTML(row.cat?.icon||'💸')} ${escapeHTML(row.cat?.name||'Sem categoria')}</div><div class=\"sub\">${fmtCurrency(row.total)} ${row.budget?`• Orçamento: ${fmtCurrency(row.budget)}`:''}</div>${row.budget?`<div class=\"progress\"><span style=\"width:${(pct*100).toFixed(1)}%\"></span></div>`:''}</div>`;
    listaResumoCats.appendChild(wrap);
  }
}

// Export CSV
async function exportCSV(){
  const yymm=mes.value; const all=await listExpensesAll(); const cats=await listCategories(); const mapCat=Object.fromEntries(cats.map(c=>[c.id,c]));
  const list=all.filter(e=>withinMonth(e.date,yymm)); if(list.length===0){ alert('Não há lançamentos neste mês.'); return; }
  const rows=[['Data','Valor','Categoria','Nota','Via','Parcela']];
  for(const e of list){
    const cat=e.categoryId?(mapCat[e.categoryId]?.name||'Sem categoria'):'Sem categoria';
    const valor=(Fatura.cents(e)/100).toFixed(2).replace('.',',');
    const parcela=(e.installmentsTotal&&e.installmentNumber)?`${e.installmentNumber}/${e.installmentsTotal}`:'';
    rows.push([new Date(e.date).toISOString().slice(0,10), valor, cat, (e.note||'').replace(/,/g,';'), e.cardName||'', parcela]);
  }
  const csv=rows.map(r=>r.map(Fatura.csvCell).join(';')).join('\r\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`despesas_${yymm}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

document.getElementById('btnExport').addEventListener('click', exportCSV);
mes.addEventListener('change', renderLanc);
mesResumo.addEventListener('change', renderResumo);

formAdd.addEventListener('submit', async (e)=>{
  e.preventDefault();
  let val;try{val=Fatura.money(valor.value)/100;}catch(err){alert(err.message);return;}
  const dt=dataIn.value||dateISO(new Date());
  const catId=Number(categoriaSel.value);
  if(val<=0||!catId){ alert('Informe valor e categoria.'); return; }
  await addExpense({amountCents:Fatura.money(valor.value), version:1, key:crypto.randomUUID(), amount:Number(val), date:new Date(dt).toISOString(), note:(nota.value||'').trim(), categoryId:catId});
  valor.value=''; nota.value=''; dataIn.value=dateISO(new Date());
  await renderLanc(); await renderResumo();
});

window.legacyReady=(async function init(){ await openDB(); await refreshCategories(); await renderLanc(); await renderResumo(); faturaMes.value=yyyymm(new Date()); })();
