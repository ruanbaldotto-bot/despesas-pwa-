
// Despesas PWA - tudo local (IndexedDB) e offline com Service Worker
// UI em pt-BR. Dados: despesas (valor, data, nota, categoria) e categorias com orçamento mensal.

// ---- PWA install hint (Android/desktop; no iOS prompt automático) ----
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

// ---- Service worker ----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// ---- IndexedDB helpers ----
const DB_NAME = 'despesasDB';
const DB_VERSION = 1;
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains('expenses')) {
        const os = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
        os.createIndex('by_date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = async (ev) => {
      db = ev.target.result;
      await seedIfNeeded();
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode='readonly') {
  return db.transaction(store, mode).objectStore(store);
}

// ---- Seed categorias base ----
async function seedIfNeeded() {
  const count = await countStore('categories');
  if (count === 0) {
    const base = [
      { name: 'Alimentação', icon: '🍽️', budgetMonthly: 1200 },
      { name: 'Transporte',  icon: '🚌',  budgetMonthly: 400  },
      { name: 'Casa',        icon: '🏠',  budgetMonthly: 1500 },
      { name: 'Lazer',       icon: '🎉',  budgetMonthly: 300  },
      { name: 'Saúde',       icon: '🩺',  budgetMonthly: 300  },
      { name: 'Outros',      icon: '🧰',  budgetMonthly: null }
    ];
    for (const c of base) await addCategory(c);
  }
}

function countStore(store) {
  return new Promise((resolve, reject) => {
    const req = tx(store).count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error);
  });
}

// ---- Categories CRUD ----
function listCategories() {
  return new Promise((resolve, reject) => {
    const req = tx('categories').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function addCategory(cat) {
  return new Promise((resolve, reject) => {
    const req = tx('categories','readwrite').add(cat);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function updateCategory(cat) {
  return new Promise((resolve, reject) => {
    const req = tx('categories','readwrite').put(cat);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    const req = tx('categories','readwrite').delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ---- Expenses CRUD ----
function addExpense(exp) {
  return new Promise((resolve, reject) => {
    const req = tx('expenses','readwrite').add(exp);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function listExpensesAll() {
  return new Promise((resolve, reject) => {
    const req = tx('expenses').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function deleteExpense(id) {
  return new Promise((resolve, reject) => {
    const req = tx('expenses','readwrite').delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// ---- Helpers ----
function yyyymm(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}
function withinMonth(date, yymm) {
  const d = new Date(date);
  const [y,m] = yymm.split('-').map(n => parseInt(n,10));
  return d.getFullYear()===y && (d.getMonth()+1)===m;
}
function fmtCurrency(n) {
  try { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n || 0); }
  catch { return 'R$ ' + (n||0).toFixed(2).replace('.',','); }
}
function toNumberLocale(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  // aceita "12,34" ou "12.34"
  return parseFloat(String(str).replace('.','').replace(',','.'));
}
function dateISO(d) {
  const x = new Date(d);
  const s = x.toISOString();
  return s.slice(0,10);
}

// ---- UI state ----
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b=>b.classList.remove('active'));
  panels.forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

const mes = document.getElementById('mes');
const mesResumo = document.getElementById('mesResumo');
const today = new Date();
mes.value = yyyymm(today);
mesResumo.value = yyyymm(today);

// Forms
const formAdd = document.getElementById('formAdd');
const valor = document.getElementById('valor');
const dataIn = document.getElementById('data');
const categoriaSel = document.getElementById('categoria');
const nota = document.getElementById('nota');
dataIn.value = dateISO(today);

const listaLanc = document.getElementById('listaLancamentos');
const emptyLanc = document.getElementById('emptyLanc');

const totalMes = document.getElementById('totalMes');
const listaResumoCats = document.getElementById('listaResumoCats');
const emptyResumo = document.getElementById('emptyResumo');

const formCat = document.getElementById('formCat');
const catNome = document.getElementById('catNome');
const catIcone = document.getElementById('catIcone');
const catOrc = document.getElementById('catOrcamento');
const listaCats = document.getElementById('listaCategorias');

const btnExport = document.getElementById('btnExport');

// ---- Render functions ----
async function refreshCategories(selectOnly=false) {
  const cats = await listCategories();
  // select
  categoriaSel.innerHTML = '<option value="">Selecione...</option>' + 
    cats.map(c => `<option value="${c.id}">${(c.icon||'💸')} ${c.name}</option>`).join('');
  if (selectOnly) return;
  // list
  listaCats.innerHTML = '';
  for (const c of cats) {
    const item = document.createElement('div');
    item.className = 'item';
    const budgetText = (c.budgetMonthly != null && c.budgetMonthly !== '') ? fmtCurrency(Number(c.budgetMonthly)) : '—';
    item.innerHTML = `
      <div class="grow">
        <div class="title">${c.icon||'🧰'} ${c.name}</div>
        <div class="sub">Orçamento: ${budgetText}</div>
      </div>
      <div class="actions">
        <button class="ghost" data-edit="${c.id}">Editar</button>
        <button class="ghost danger" data-del="${c.id}">Excluir</button>
      </div>
    `;
    listaCats.appendChild(item);
  }
  // listeners
  listaCats.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.del);
      if (confirm('Excluir esta categoria? (não remove lançamentos existentes)')) {
        await deleteCategory(id);
        await refreshCategories();
      }
    });
  });
  listaCats.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.edit);
      const cats = await listCategories();
      const c = cats.find(x => x.id===id);
      if (!c) return;
      const nome = prompt('Nome da categoria:', c.name) ?? c.name;
      const icone = prompt('Ícone (emoji):', c.icon||'') ?? c.icon;
      const orc = prompt('Orçamento mensal (R$) - deixe vazio para nenhum:', c.budgetMonthly ?? '');
      c.name = nome.trim()||c.name;
      c.icon = (icone||'').trim() || c.icon;
      c.budgetMonthly = (orc==='' || orc===null) ? null : toNumberLocale(orc);
      await updateCategory(c);
      await refreshCategories();
      await renderResumo();
      await renderLanc();
    });
  });
}

async function renderLanc() {
  const yymm = mes.value;
  const all = await listExpensesAll();
  const cats = await listCategories();
  const mapCat = Object.fromEntries(cats.map(c => [c.id, c]));
  const list = all
    .filter(e => withinMonth(e.date, yymm))
    .sort((a,b) => new Date(b.date)-new Date(a.date));
  listaLanc.innerHTML = '';
  let any = false;
  for (const e of list) {
    any = true;
    const c = e.categoryId ? mapCat[e.categoryId] : null;
    const item = document.createElement('div');
    item.className = 'item';
    const icone = c?.icon || '💸';
    const nomeCat = c?.name || 'Sem categoria';
    item.innerHTML = `
      <div class="grow">
        <div class="title">${icone} ${nomeCat} • ${fmtCurrency(e.amount)}</div>
        <div class="sub">${new Date(e.date).toLocaleDateString('pt-BR')} ${e.note ? '• ' + e.note : ''}</div>
      </div>
      <div class="actions">
        <button class="ghost danger" data-del="${e.id}">Apagar</button>
      </div>
    `;
    listaLanc.appendChild(item);
  }
  emptyLanc.hidden = any;
  listaLanc.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.del);
      if (confirm('Apagar este lançamento?')) {
        await deleteExpense(id);
        await renderLanc();
        await renderResumo();
      }
    });
  });
}

async function renderResumo() {
  const yymm = mesResumo.value;
  const all = await listExpensesAll();
  const cats = await listCategories();
  const mapCat = Object.fromEntries(cats.map(c => [c.id, c]));

  const list = all.filter(e => withinMonth(e.date, yymm));
  const total = list.reduce((s,e)=>s+Number(e.amount||0),0);
  totalMes.textContent = fmtCurrency(total);

  // por categoria
  const group = {};
  for (const e of list) {
    const id = e.categoryId || 0;
    group[id] = group[id] || { total:0, ids:[] };
    group[id].total += Number(e.amount||0);
    group[id].ids.push(e.id);
  }

  const entries = Object.entries(group).map(([id, info]) => {
    const cat = mapCat[Number(id)];
    return { id:Number(id), cat, total: info.total, budget: cat?.budgetMonthly ?? null };
  }).sort((a,b) => (a.cat?.name||'').localeCompare(b.cat?.name||''));

  listaResumoCats.innerHTML = '';
  if (entries.length===0) {
    emptyResumo.hidden = false;
    return;
  }
  emptyResumo.hidden = true;

  for (const row of entries) {
    const pct = row.budget ? Math.min(row.total / (row.budget || 1), 1) : null;
    const wrap = document.createElement('div');
    wrap.className = 'item';
    wrap.innerHTML = `
      <div class="grow">
        <div class="title">${(row.cat?.icon||'💸')} ${(row.cat?.name||'Sem categoria')}</div>
        <div class="sub">${fmtCurrency(row.total)} ${row.budget ? `• Orçamento: ${fmtCurrency(row.budget)}` : ''}</div>
        ${row.budget ? `<div class="progress"><span style="width:${(pct*100).toFixed(1)}%"></span></div>` : ''}
      </div>
    `;
    listaResumoCats.appendChild(wrap);
  }
}

// ---- CSV export ----
async function exportCSV() {
  const yymm = mes.value;
  const all = await listExpensesAll();
  const cats = await listCategories();
  const mapCat = Object.fromEntries(cats.map(c => [c.id, c]));
  const list = all.filter(e => withinMonth(e.date, yymm));
  if (list.length === 0) {
    alert('Não há lançamentos neste mês.');
    return;
  }
  const rows = [['Data','Valor','Categoria','Nota']];
  for (const e of list) {
    const cat = e.categoryId ? (mapCat[e.categoryId]?.name || 'Sem categoria') : 'Sem categoria';
    const valor = Number(e.amount||0).toFixed(2).replace('.',',');
    rows.push([new Date(e.date).toISOString().slice(0,10), valor, cat, (e.note||'').replace(/,/g,';')]);
  }
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `despesas_${yymm}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- Event bindings ----
mes.addEventListener('change', renderLanc);
mesResumo.addEventListener('change', renderResumo);

formAdd.addEventListener('submit', async (e) => {
  e.preventDefault();
  const val = toNumberLocale(valor.value);
  const dt = dataIn.value || dateISO(new Date());
  const catId = Number(categoriaSel.value);
  if (!val || !catId) {
    alert('Informe valor e categoria.');
    return;
  }
  await addExpense({ amount: Number(val), date: new Date(dt).toISOString(), note: (nota.value||'').trim(), categoryId: catId });
  valor.value=''; nota.value=''; dataIn.value = dateISO(new Date());
  await renderLanc();
  await renderResumo();
});

formCat.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = (catNome.value||'').trim();
  const icone = (catIcone.value||'').trim() || '🧰';
  const orc = catOrc.value==='' ? null : toNumberLocale(catOrc.value);
  if (!nome) { alert('Informe um nome.'); return; }
  await addCategory({ name:nome, icon:icone, budgetMonthly: orc });
  catNome.value=''; catIcone.value=''; catOrc.value='';
  await refreshCategories();
  await renderResumo();
});

btnExport.addEventListener('click', exportCSV);

// ---- Boot ----
(async function init(){
  await openDB();
  await refreshCategories();
  await renderLanc();
  await renderResumo();
})();
