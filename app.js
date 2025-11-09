
// (code trimmed for execution space) — full parser below
let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; btnInstall.hidden = false; });
if (btnInstall) btnInstall.addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; btnInstall.hidden = true; });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js';

const DB_NAME='despesasDB', DB_VERSION=4; let db;
function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains('expenses')){const os=d.createObjectStore('expenses',{keyPath:'id',autoIncrement:true});os.createIndex('by_date','date',{unique:false});}if(!d.objectStoreNames.contains('categories'))d.createObjectStore('categories',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('cards'))d.createObjectStore('cards',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('invoices'))d.createObjectStore('invoices',{keyPath:'id',autoIncrement:true});if(!d.objectStoreNames.contains('blobs'))d.createObjectStore('blobs',{keyPath:'id',autoIncrement:true});};r.onsuccess=e=>{db=e.target.result;seedIfNeeded().then(()=>res(db));};r.onerror=()=>rej(r.error);});}
function tx(n,m='readonly'){return db.transaction(n,m).objectStore(n);}function countStore(s){return new Promise((res,rej)=>{const r=tx(s).count();r.onsuccess=()=>res(r.result||0);r.onerror=()=>rej(r.error);})}
async function seedIfNeeded(){if(await countStore('categories')===0){for(const c of[{name:'Alimentação',icon:'🍽️',budgetMonthly:1200},{name:'Transporte',icon:'🚌',budgetMonthly:400},{name:'Casa',icon:'🏠',budgetMonthly:1500},{name:'Lazer',icon:'🎉',budgetMonthly:300},{name:'Saúde',icon:'🩺',budgetMonthly:300},{name:'Outros',icon:'🧰',budgetMonthly:null}])await addCategory(c);}}
function listCategories(){return new Promise((res,rej)=>{const r=tx('categories').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);})}
function addCategory(c){return new Promise((res,rej)=>{const r=tx('categories','readwrite').add(c);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
function updateCategory(c){return new Promise((res,rej)=>{const r=tx('categories','readwrite').put(c);r.onsuccess=()=>res(true);r.onerror=()=>rej(r.error);})}
function deleteCategory(id){return new Promise((res,rej)=>{const r=tx('categories','readwrite').delete(id);r.onsuccess=()=>res(true);r.onerror=()=>rej(r.error);})}
function addExpense(e){return new Promise((res,rej)=>{const r=tx('expenses','readwrite').add(e);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
function listExpensesAll(){return new Promise((res,rej)=>{const r=tx('expenses').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);})}
function deleteExpense(id){return new Promise((res,rej)=>{const r=tx('expenses','readwrite').delete(id);r.onsuccess=()=>res(true);r.onerror=()=>rej(r.error);})}
function addCard(c){return new Promise((res,rej)=>{const r=tx('cards','readwrite').add(c);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
function listCards(){return new Promise((res,rej)=>{const r=tx('cards').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);})}
function deleteCard(id){return new Promise((res,rej)=>{const r=tx('cards','readwrite').delete(id);r.onsuccess=()=>res(true);r.onerror=()=>rej(r.error);})}
function addInvoice(i){return new Promise((res,rej)=>{const r=tx('invoices','readwrite').add(i);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
function saveBlob(buf){return new Promise((res,rej)=>{const r=tx('blobs','readwrite').add({data:buf});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
function yyyymm(d){const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0');}
function withinMonth(date,yymm){const d=new Date(date);const [y,m]=yymm.split('-').map(n=>parseInt(n,10));return d.getFullYear()===y&&(d.getMonth()+1)===m;}
function fmtCurrency(n){try{return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n||0);}catch{return 'R$ '+(n||0).toFixed(2).replace('.',',');}}
function toNumberLocale(s){if(typeof s==='number')return s;if(!s)return 0;return parseFloat(String(s).replace(/\./g,'').replace(',','.'));}
function dateISO(d){const x=new Date(d);return x.toISOString().slice(0,10);}

const tabs=document.querySelectorAll('.tab'); const panels=document.querySelectorAll('.tab-panel');
tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(p=>p.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active');}));
const mes=document.getElementById('mes'); const mesResumo=document.getElementById('mesResumo'); const today=new Date(); mes.value=yyyymm(today); mesResumo.value=yyyymm(today);
const formAdd=document.getElementById('formAdd'); const valor=document.getElementById('valor'); const dataIn=document.getElementById('data'); const categoriaSel=document.getElementById('categoria'); const nota=document.getElementById('nota'); dataIn.value=dateISO(today);
const listaLanc=document.getElementById('listaLancamentos'); const emptyLanc=document.getElementById('emptyLanc');
const totalMes=document.getElementById('totalMes'); const listaResumoCats=document.getElementById('listaResumoCats'); const emptyResumo=document.getElementById('emptyResumo');
const formCat=document.getElementById('formCat'); const catNome=document.getElementById('catNome'); const catIcone=document.getElementById('catIcone'); const catOrc=document.getElementById('catOrcamento'); const listaCats=document.getElementById('listaCategorias');
const formCard=document.getElementById('formCard'); const cardNome=document.getElementById('cardNome'); const cardFech=document.getElementById('cardFechamento'); const cardVenc=document.getElementById('cardVencimento'); const listaCards=document.getElementById('listaCartoes');
const formFatura=document.getElementById('formFatura'); const selCard=document.getElementById('selCard'); const faturaMes=document.getElementById('faturaMes'); const faturaPDF=document.getElementById('faturaPDF'); const previewCard=document.getElementById('previewCard'); const previewList=document.getElementById('previewList'); const btnSalvarImport=document.getElementById('btnSalvarImport');

async function refreshCategories(selectOnly=false){const cats=await listCategories();categoriaSel.innerHTML='<option value=\"\">Selecione...</option>'+cats.map(c=>`<option value=\"${c.id}\">${(c.icon||'💸')} ${c.name}</option>`).join('');if(selectOnly)return;listaCats.innerHTML='';for(const c of cats){const it=document.createElement('div');it.className='item';const b=(c.budgetMonthly!=null&&c.budgetMonthly!=='')?fmtCurrency(Number(c.budgetMonthly)):'—';it.innerHTML=`<div class=\"grow\"><div class=\"title\">${c.icon||'🧰'} ${c.name}</div><div class=\"sub\">Orçamento: ${b}</div></div><div class=\"actions\"><button class=\"ghost\" data-edit=\"${c.id}\">Editar</button><button class=\"ghost danger\" data-del=\"${c.id}\">Excluir</button></div>`;listaCats.appendChild(it);}listaCats.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click',async()=>{const id=Number(btn.dataset.del);if(confirm('Excluir esta categoria?')){await deleteCategory(id);await refreshCategories();await renderResumo();}}));listaCats.querySelectorAll('button[data-edit]').forEach(btn=>btn.addEventListener('click',async()=>{const id=Number(btn.dataset.edit);const cats=await listCategories();const c=cats.find(x=>x.id===id);if(!c)return;const nome=prompt('Nome da categoria:',c.name)??c.name;const icone=prompt('Ícone (emoji):',c.icon||'')??c.icon;const orc=prompt('Orçamento mensal (R$) - vazio = nenhum:',c.budgetMonthly??'');c.name=nome.trim()||c.name;c.icon=(icone||'').trim()||c.icon;c.budgetMonthly=(orc===''||orc===null)?null:toNumberLocale(orc);await updateCategory(c);await refreshCategories();await renderResumo();await renderLanc();}));}

async function renderLanc(){const yymm=mes.value;const all=await listExpensesAll();const cats=await listCategories();const map=Object.fromEntries(cats.map(c=>[c.id,c]));const list=all.filter(e=>withinMonth(e.date,yymm)).sort((a,b)=>new Date(b.date)-new Date(a.date));listaLanc.innerHTML='';let any=false;for(const e of list){any=true;const c=e.categoryId?map[e.categoryId]:null;const ic=c?.icon||'💸';const nm=c?.name||'Sem categoria';const parc=(e.installmentsTotal&&e.installmentNumber)?` • ${e.installmentNumber}/${e.installmentsTotal}`:'';const via=e.cardName?` • ${e.cardName}`:'';const it=document.createElement('div');it.className='item';it.innerHTML=`<div class=\"grow\"><div class=\"title\">${ic} ${nm} • ${fmtCurrency(e.amount)}${parc}${via}</div><div class=\"sub\">${new Date(e.date).toLocaleDateString('pt-BR')} ${e.note?('• '+e.note):''}</div></div><div class=\"actions\"><button class=\"ghost danger\" data-del=\"${e.id}\">Apagar</button></div>`;listaLanc.appendChild(it);}emptyLanc.hidden=any;listaLanc.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click',async()=>{const id=Number(btn.dataset.del);if(confirm('Apagar este lançamento?')){await deleteExpense(id);await renderLanc();await renderResumo();}}));}

async function renderResumo(){const yymm=mesResumo.value;const all=await listExpensesAll();const cats=await listCategories();const map=Object.fromEntries(cats.map(c=>[c.id,c]));const list=all.filter(e=>withinMonth(e.date,yymm));const total=list.reduce((s,e)=>s+Number(e.amount||0),0);totalMes.textContent=fmtCurrency(total);const group={};for(const e of list){const id=e.categoryId||0;group[id]=(group[id]||{total:0});group[id].total+=Number(e.amount||0);}const entries=Object.entries(group).map(([id,info])=>{const cat=map[Number(id)];return {id:Number(id),cat,total:info.total,budget:cat?.budgetMonthly??null};}).sort((a,b)=>(a.cat?.name||'').localeCompare(b.cat?.name||''));listaResumoCats.innerHTML='';if(entries.length===0){emptyResumo.hidden=false;return;}emptyResumo.hidden=true;for(const row of entries){const pct=row.budget?Math.min(row.total/(row.budget||1),1):null;const w=document.createElement('div');w.className='item';w.innerHTML=`<div class=\"grow\"><div class=\"title\">${(row.cat?.icon||'💸')} ${(row.cat?.name||'Sem categoria')}</div><div class=\"sub\">${fmtCurrency(row.total)} ${row.budget?`• Orçamento: ${fmtCurrency(row.budget)}`:''}</div>${row.budget?`<div class=\"progress\"><span style=\"width:${(pct*100).toFixed(1)}%\"></span></div>`:''}</div>`;listaResumoCats.appendChild(w);}}

async function refreshCards(){const cards=await listCards();selCard.innerHTML='<option value=\"\">Selecione...</option>'+cards.map(c=>`<option value=\"${c.id}\">${c.name}</option>`).join('');listaCards.innerHTML='';for(const c of cards){const it=document.createElement('div');it.className='item';it.innerHTML=`<div class=\"grow\"><div class=\"title\">💳 ${c.name}</div><div class=\"sub\">Fechamento: ${c.closeDay||'—'} • Vencimento: ${c.dueDay||'—'}</div></div><div class=\"actions\"><button class=\"ghost danger\" data-del=\"${c.id}\">Excluir</button></div>`;listaCards.appendChild(it);}listaCards.querySelectorAll('button[data-del]').forEach(btn=>btn.addEventListener('click',async()=>{const id=Number(btn.dataset.del);if(confirm('Excluir este cartão?')){await deleteCard(id);await refreshCards();}}));}

async function exportCSV(){const yymm=mes.value;const all=await listExpensesAll();const cats=await listCategories();const map=Object.fromEntries(cats.map(c=>[c.id,c]));const list=all.filter(e=>withinMonth(e.date,yymm));if(list.length===0){alert('Não há lançamentos neste mês.');return;}const rows=[['Data','Valor','Categoria','Nota','Via','Parcela']];for(const e of list){const cat=e.categoryId?(map[e.categoryId]?.name||'Sem categoria'):'Sem categoria';const val=Number(e.amount||0).toFixed(2).replace('.',',');const parc=(e.installmentsTotal&&e.installmentNumber)?`${e.installmentNumber}/${e.installmentsTotal}`:'';rows.push([new Date(e.date).toISOString().slice(0,10),val,cat,(e.note||'').replace(/,/g,';'),e.cardName||'',parc]);}const csv=rows.map(r=>r.join(',')).join('\\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`despesas_${yymm}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}

// Robust parser (Mercado Pago)
function normalizeDigits(s){const map={'O':'0','o':'0','S':'5','s':'5','l':'1','I':'1','í':'5','%':'5','+':'1',')':'9','(':'9','B':'8'};return s.split('').map(ch=>map[ch]??ch).join('');}
function stripAccents(s){try{return s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}catch(_){return s;}}
async function parseInvoicePDF(file){
  if(!window['pdfjsLib']) throw new Error('pdf.js não carregou');
  const data=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data}).promise;
  let chunks=[];
  for(let p=1;p<=pdf.numPages;p++){
    const page=await pdf.getPage(p);
    const content=await page.getTextContent();
    for(const it of content.items){ if(it.str) chunks.push(it.str); }
    chunks.push('\\n');
  }
  let text=chunks.join(' ').replace(/\\s{2,}/g,' ').replace(/\\u00A0/g,' ').trim();
  let low=stripAccents(text).toLowerCase();
  low=low.replace(/\\br[\\$\\s]?m\\b/g,'r$').replace(/\\brs\\b/g,'r$');
  let lines=low.split(/(?=\\b\\d{1,2}[\\/\\-]\\d{1,2}\\b)|(?=\\bparcela\\b)|(?=\\br\\$\\s*\\d)/g);
  lines=lines.map(s=>normalizeDigits(s)).map(s=>s.trim()).filter(Boolean);

  const items=[];
  const reDate=/(\\d{1,2})[\\/\\-](\\d{1,2})/;
  const reValue=/r\\$\\s*([\\d\\.]*\\d+,\\d{2})|(^|[^\\d])([\\d\\.]*\\d+,\\d{2})($|[^\\d])/;
  const reInst=/parcela\\s+(\\d{1,2})\\s*de\\s*(\\d{1,2})|(\\d{1,2})\\s*\\/\\s*(\\d{1,2})|(\\d{1,2})\\s*x/;

  for(const s of lines){
    if(/pagamento da fatura/.test(s)) continue;
    const mVal=s.match(reValue);
    if(!mVal) continue;
    const vStr=(mVal[1]||mVal[3]||'').replace(/\\./g,'').replace(',','.');
    const amount=parseFloat(vStr);
    if(!isFinite(amount)||amount<=0) continue;
    let day=1; const mDate=s.match(reDate); if(mDate) day=parseInt(mDate[1],10);
    let instNum=null,instTot=null; const mInst=s.match(reInst);
    if(mInst){ if(mInst[1]&&mInst[2]){instNum=parseInt(mInst[1],10);instTot=parseInt(mInst[2],10);} else if(mInst[3]&&mInst[4]){instNum=parseInt(mInst[3],10);instTot=parseInt(mInst[4],10);} else if(mInst[5]){instTot=parseInt(mInst[5],10);} }
    let desc=s.replace(/parcela\\s+\\d+\\s+de\\s+\\d+/,'').replace(/\\d+\\s*\\/\\s*\\d+/,'').replace(/r\\$\\s*[\\d\\.]*\\d+,\\d{2}/,'').replace(/[\\d\\.]*\\d+,\\d{2}/,'').replace(/\\b\\d{1,2}[\\/\\-]\\d{1,2}\\b/,'').replace(/\\s{2,}/g,' ').trim();
    if(!desc) desc='Compra cartão';
    items.push({day,desc,amount,installmentsTotal:instTot,installmentNumber:instNum});
  }
  const unique=[]; const seen=new Set();
  for(const it of items){ const key=[it.day,it.amount.toFixed(2),(it.desc||'').slice(0,40)].join('|'); if(!seen.has(key)){unique.push(it); seen.add(key);} }
  return unique;
}

document.getElementById('btnExport').addEventListener('click', exportCSV);
mes.addEventListener('change', renderLanc); mesResumo.addEventListener('change', renderResumo);

formAdd.addEventListener('submit', async (e)=>{e.preventDefault();const val=toNumberLocale(valor.value);const dt=dataIn.value||dateISO(new Date());const catId=Number(categoriaSel.value);if(!val||!catId){alert('Informe valor e categoria.');return;}await addExpense({amount:Number(val),date:new Date(dt).toISOString(),note:(nota.value||'').trim(),categoryId:catId});valor.value='';nota.value='';dataIn.value=dateISO(new Date());await renderLanc();await renderResumo();});

formCat.addEventListener('submit', async (e)=>{e.preventDefault();const nome=(catNome.value||'').trim();const icone=(catIcone.value||'').trim()||'🧰';const orc=catOrc.value===''?null:parseFloat(String(catOrc.value).replace(/\\./g,'').replace(',','.'));if(!nome){alert('Informe um nome.');return;}await addCategory({name:nome,icon:icone,budgetMonthly:orc});catNome.value='';catIcone.value='';catOrc.value='';await refreshCategories();await renderResumo();});

formCard.addEventListener('submit', async (e)=>{e.preventDefault();const name=(cardNome.value||'').trim();const closeDay=cardFech.value?parseInt(cardFech.value,10):null;const dueDay=cardVenc.value?parseInt(cardVenc.value,10):null;if(!name){alert('Informe o nome do cartão.');return;}await addCard({name,closeDay,dueDay});cardNome.value='';cardFech.value='';cardVenc.value='';await refreshCards();});

let importBuffer=[];
formFatura.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const cardId=Number(selCard.value); const cardName=selCard.options[selCard.selectedIndex]?.text||''; const yymm=faturaMes.value; const file=faturaPDF.files[0];
  if(!cardId||!yymm||!file){ alert('Selecione cartão, mês e o PDF.'); return; }
  const buf=await file.arrayBuffer(); const blobId=await saveBlob(buf); await addInvoice({cardId,yymm,blobId,createdAt:new Date().toISOString()});
  previewList.innerHTML='<div class=\"sub\">Lendo fatura e tentando identificar compras…</div>'; previewCard.style.display='block';
  try{
    const parsed=await parseInvoicePDF(file);
    if(!parsed||parsed.length===0){ previewList.innerHTML='<div class=\"sub\">Não consegui identificar itens automaticamente. Você ainda pode manter o PDF anexado e lançar manualmente.</div>'; importBuffer=[]; return; }
    importBuffer=parsed.map(it=>({...it,categoryId:null}));
    await buildPreview(cardName,yymm);
  }catch(err){ console.error(err); previewList.innerHTML='<div class=\"sub\">Erro ao ler o PDF. Talvez seja necessário exportar CSV pelo app do banco.</div>'; importBuffer=[]; }
});
async function buildPreview(cardName,yymm){
  const cats=await listCategories(); previewList.innerHTML='';
  for(let i=0;i<importBuffer.length;i++){
    const it=importBuffer[i]; const row=document.createElement('div'); row.className='item';
    const sel='<select data-idx=\"'+i+'\" class=\"selCat\">'+['<option value=\"\">Categoria…</option>'].concat(cats.map(c=>`<option value=\"${c.id}\">${c.icon||'💸'} ${c.name}</option>`)).join('')+'</select>';
    row.innerHTML=`<div class=\"grow\"><div class=\"title\">${fmtCurrency(it.amount)} • ${it.desc||'—'} • ${it.installmentNumber?it.installmentNumber:'?'}${it.installmentsTotal?'/'+it.installmentsTotal:''}</div><div class=\"sub\">Dia ${String(it.day).padStart(2,'0')} • ${cardName}</div><div class=\"row\">${sel}</div></div>`;
    previewList.appendChild(row);
  }
  previewList.querySelectorAll('select.selCat').forEach(sel=>sel.addEventListener('change',(ev)=>{const idx=Number(ev.target.getAttribute('data-idx'));importBuffer[idx].categoryId=Number(ev.target.value)||null;}));
  btnSalvarImport.onclick=async()=>{
    if(importBuffer.length===0){alert('Nada para importar.');return;}
    const [year,month]=yymm.split('-').map(n=>parseInt(n,10));
    for(const it of importBuffer){
      const d=new Date(year,month-1,Math.max(1,Math.min(28,Number(it.day)||1)));
      await addExpense({amount:Number(it.amount||0),date:d.toISOString(),note:it.desc||'',categoryId:it.categoryId||null,cardName:cardName,installmentsTotal:it.installmentsTotal||null,installmentNumber:it.installmentNumber||null});
    }
    importBuffer=[]; previewCard.style.display='none'; await renderLanc(); await renderResumo(); alert('Importação concluída!');
  };
}

(async function init(){ await openDB(); await refreshCategories(); await renderLanc(); await renderResumo(); await refreshCards(); faturaMes.value=yyyymm(new Date()); })();
