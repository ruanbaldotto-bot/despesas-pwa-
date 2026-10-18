(function(root){
'use strict';
const Fatura=typeof module!=='undefined'?require('./core.js'):root.Fatura;
const names=['expenses','categories','cards','invoices','blobs','events'];
function all(db,name){return new Promise((resolve,reject)=>{const t=db.transaction(name),r=t.objectStore(name).getAll();let rows;r.onsuccess=()=>rows=r.result;t.oncomplete=()=>resolve(rows);t.onabort=()=>reject(t.error);});}
function write(db,store,value){return new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite'),r=t.objectStore(store).put(value);let id;r.onsuccess=()=>id=r.result;t.oncomplete=()=>resolve(id);t.onabort=()=>reject(t.error||new Error('Operação cancelada.'));});}
function event(db,e){return new Promise((resolve,reject)=>{const t=db.transaction('events','readwrite'),store=t.objectStore('events'),r=store.getAll();r.onsuccess=()=>{const sequence=r.result.reduce((max,e)=>Math.max(max,e.sequence||0),0)+1;store.add({...e,id:crypto.randomUUID(),sequence,version:1,createdAt:new Date().toISOString()});};t.oncomplete=()=>resolve();t.onabort=()=>reject(t.error);});}
function importInvoice(db,invoice,items,total){return new Promise((resolve,reject)=>{
 const t=db.transaction(['expenses','invoices'],'readwrite'),es=t.objectStore('expenses'),ins=t.objectStore('invoices');let error;
 t.onabort=()=>reject(error||t.error||new Error('Importação cancelada.'));t.oncomplete=()=>resolve();
 const ir=ins.index('hash').get(invoice.hash);ir.onsuccess=()=>{if(ir.result){error=new Error('Arquivo já importado.');t.abort();return;}
 const er=es.getAll();er.onsuccess=()=>{try{Fatura.validateImport(items,er.result,total);const r=ins.add({...invoice,totalCents:total,version:1});r.onsuccess=()=>{items.forEach((e,index)=>es.add({...e,invoiceId:r.result,key:invoice.hash+':'+index,version:1,amount:Fatura.cents(e)/100}));};}catch(e){error=e;t.abort();}};};
 });}
function assign(db,ids,parts,propagate=false){return new Promise((resolve,reject)=>{const t=db.transaction(['expenses','events'],'readwrite');let error;const es=t.objectStore('expenses'),ev=t.objectStore('events');const prior=ev.getAll();prior.onsuccess=()=>{const sequence=prior.result.reduce((max,e)=>Math.max(max,e.sequence||0),0)+1;const r=es.getAll();r.onsuccess=()=>{try{for(const id of ids){const e=r.result.find(x=>x.id===id);if(!e||e.kind==='bankPayment')throw new Error('Lançamento não pode ser atribuído.');const split=Fatura.split(Fatura.cents(e),parts.values,parts.percent);ev.add({id:crypto.randomUUID(),type:'allocation',sequence,effectiveMonth:e.invoiceMonth||e.date.slice(0,7),expenseId:id,groupId:e.groupId||null,propagate,parts:split,version:1,createdAt:new Date().toISOString()});}}catch(e){error=e;t.abort();}};};t.oncomplete=()=>resolve();t.onabort=()=>reject(error||t.error);});}
async function snapshot(db){return new Promise((resolve,reject)=>{const t=db.transaction(names),stores={};for(const n of names){const r=t.objectStore(n).getAll();r.onsuccess=()=>stores[n]=r.result.map(e=>n==='blobs'?{...e,data:Array.from(new Uint8Array(e.data))}:e);}t.oncomplete=()=>resolve({schema:1,stores});t.onabort=()=>reject(t.error);});}
function validateSnapshot(data){
 const invalid=()=>{throw new Error('Backup inválido: estrutura ou valor financeiro inconsistente.');};
 const id=v=>Number.isSafeInteger(v)&&v>0;
 const text=(v,required=false)=>v==null?!required:typeof v==='string'&&v.length<=10000&&(!required||v.trim().length>0);
 const eventId=v=>typeof v==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(v);
 const integer=v=>Number.isSafeInteger(v);
 if(data?.schema!==1||!data.stores||Object.keys(data.stores).sort().join()!==[...names].sort().join())invalid();
 for(const n of names)if(!Array.isArray(data.stores[n])||data.stores[n].length>100000)invalid();
 const sources=new Map(data.stores.expenses.filter(Boolean).map(e=>[e.id,e]));
 for(const n of names){
  if(!Array.isArray(data.stores[n])||data.stores[n].length>100000)invalid();
  const seen=new Set();
  for(const e of data.stores[n]){
   if(!e||typeof e!=='object'||Array.isArray(e)||seen.has(e.id)||(n==='events'?!eventId(e.id):!id(e.id)))invalid();seen.add(e.id);
   if(e.version!=null&&(!integer(e.version)||e.version<1))invalid();
   if(n==='expenses'){
    Fatura.cents(e);if(typeof e.date!=='string')invalid();Fatura.date(e.date.slice(0,10));Fatura.validateInstallments(e);
    if(!text(e.note)||!text(e.cardName))invalid();
    if(e.invoiceMonth!=null)Fatura.month(e.invoiceMonth);
    for(const key of ['cardId','categoryId','invoiceId'])if(e[key]!=null&&!id(e[key]))invalid();
    if(e.kind!=null&&!['purchase','refund','bankPayment'].includes(e.kind))invalid();
    if(e.recurring!=null&&typeof e.recurring!=='boolean')invalid();
   }
   if(n==='categories'&&(!text(e.name,true)||!text(e.icon)||(e.budgetMonthly!=null&&(!Number.isFinite(e.budgetMonthly)||e.budgetMonthly<0))))invalid();
   if(n==='cards'){
    if(!text(e.name,true)||!text(e.bank)||(e.archived!=null&&typeof e.archived!=='boolean'))invalid();
    for(const key of ['closeDay','dueDay'])if(e[key]!=null&&(!integer(e[key])||e[key]<1||e[key]>31))invalid();
    if(e.limitCents!=null&&(!integer(e.limitCents)||e.limitCents<0))invalid();
    if(e.last4!=null&&!/^\d{4}$/.test(e.last4))invalid();
   }
   if(n==='invoices'){
    if(!text(e.hash,true)||e.hash.length>256)invalid();
    if(e.yyyymm!=null)Fatura.month(e.yyyymm);if(e.totalCents!=null&&!integer(e.totalCents))invalid();
   }
   if(n==='blobs'&&(!Array.isArray(e.data)||e.data.some(b=>!Number.isInteger(b)||b<0||b>255)))invalid();
   if(n==='events'){
    if(!['person','allocation','familyPayment','bankPayment'].includes(e.type))invalid();
    if(e.sequence!=null&&(!integer(e.sequence)||e.sequence<1))invalid();
    if(e.createdAt!=null&&(typeof e.createdAt!=='string'||!Number.isFinite(Date.parse(e.createdAt))))invalid();
    if(e.type==='person'&&!text(e.name,true))invalid();
    if(e.type.endsWith('Payment')){
     Fatura.month(e.month);if(!integer(e.amountCents)||e.amountCents<=0)invalid();
     if(e.type==='familyPayment'?!eventId(e.personId):!id(e.cardId))invalid();
    }
    if(e.type==='allocation'){
     if(!id(e.expenseId)||!Array.isArray(e.parts)||!e.parts.length||e.parts.length>100||new Set(e.parts.map(p=>p.personId)).size!==e.parts.length)invalid();
     if(e.parts.some(p=>!eventId(p.personId)||!integer(p.amountCents)))invalid();
     if(e.propagate!=null&&typeof e.propagate!=='boolean')invalid();if(e.effectiveMonth!=null)Fatura.month(e.effectiveMonth);
     const source=sources.get(e.expenseId);
     if(source&&(!Fatura.reconcile(e.parts,Fatura.cents(source)).ok||e.parts.some(p=>p.amountCents!==0&&Math.sign(p.amountCents)!==Math.sign(Fatura.cents(source)))))invalid();
    }
   }
  }
 }
 return data;
}
function restore(db,data){validateSnapshot(data);return new Promise((resolve,reject)=>{const t=db.transaction(names,'readwrite');let error;for(const n of names){const store=t.objectStore(n),r=store.getAll();r.onsuccess=()=>{try{const existing=new Map(r.result.map(e=>[e.id,e]));for(let e of data.stores[n]){if(n==='blobs')e={...e,data:new Uint8Array(e.data).buffer};const prior=existing.get(e.id);if(prior){const serialize=v=>JSON.stringify(v,(k,x)=>x instanceof ArrayBuffer?[...new Uint8Array(x)]:x);if(serialize(prior)!==serialize(e))throw new Error('Conflito de registros. Restauração cancelada sem sobrescrever dados.');}else store.add(e);}}catch(e){error=e;t.abort();}};}t.oncomplete=()=>resolve();t.onabort=()=>reject(error||t.error);});}
const api={all,write,event,importInvoice,assign,snapshot,validateSnapshot,restore};if(typeof module!=='undefined')module.exports=api;else root.Ledger=api;
})(globalThis);
