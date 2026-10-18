import './file-reader.js';
export async function readPageTextContent(page) {
  // getReader is supported without ReadableStream[Symbol.asyncIterator] on WebKit.
  const reader = page.streamTextContent().getReader();
  const content = { items: [] };
  let done = false, characters = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) { done = true; return content; }
      for (const item of chunk.value.items) {
        characters += item.str?.length || 0;
        if (characters > 2_000_000) throw new Error('Texto do PDF excede o limite de leitura.');
        content.items.push(item);
      }
    }
  } finally {
    try { if (!done) await reader.cancel(); } finally { reader.releaseLock(); }
  }
}
export function textRows(items) {
  const rows=[];
  for (const item of items.filter(i=>typeof i.str==='string'&&i.str.trim()).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])) {
    const y=item.transform[5],last=rows[rows.length-1];
    if(last&&Math.abs(last.y-y)<=2)last.items.push(item);else rows.push({y,items:[item]});
  }
  return rows.map(row=>row.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' '));
}
// Positional Itaú reconstruction. Every nonempty item is emitted exactly once.
// Headers and money/date boundaries delimit independent visual blocks; uncertainty stays textual.
export function itauTextRows(items, options = {}) {
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const dateStart=/^(?:\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})\b/;
  const dateOnly=/^(?:\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})$/;
  const moneyEnd=/(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?\s*$/i;
  const moneyOnly=/^(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?\s*$/i;
  const heading=/^(?:lancamentos(?:\b|:)|compras e saques|pagamentos (?:e creditos|efetuados|anteriores)|transacoes do cartao|resumo da fatura|opcoes de parcelamento|parcelamento da fatura|parcelas futuras|compras parceladas.*proximas)/;
  const total=/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar|total (?:dos |de )?lancamentos atuais)\s*(?:\(r\$\))?\s*[:=]?\s*$/;
  const info=/^(?:total|limite|saldo|vencimento|fechamento|data|descricao|valor|encargos|juros|taxa|cet|iof|sac|central|ouvidoria|cnpj|cpf|pagina|resumo|proxima|demais)\b/;
  const source=items.filter(i=>typeof i.str==='string'&&i.str.trim()&&Array.isArray(i.transform));
  const x=i=>i.transform[4],y=i=>i.transform[5],join=cells=>cells.map(i=>i.str).join(' ');
  const bins=new Map();for(const item of source){const key=Math.floor(y(item)/3);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(item);}
  const nearbyCache=new Map(),nearby=item=>{const key=y(item);if(!nearbyCache.has(key)){const bin=Math.floor(key/3);nearbyCache.set(key,[-1,0,1].flatMap(n=>bins.get(bin+n)||[]).filter(i=>Math.abs(y(i)-key)<=2).sort((a,b)=>x(a)-x(b)));}return nearbyCache.get(key);};
  const anchors=[];
  for(const item of source){
    const same=nearby(item),after=same.filter(i=>x(i)>x(item)&&x(i)-x(item)<300);
    if(norm(item.str)==='data'&&after.some(i=>/^(?:descricao|estabelecimento|lancamento|historico)\b/.test(norm(i.str)))&&after.some(i=>/^(?:valor|r\$)/.test(norm(i.str))))anchors.push({x:x(item),header:true});
    if(dateOnly.test(item.str.trim())){const before=same.filter(i=>x(i)<x(item));if(!before.length||moneyEnd.test(join(before)))anchors.push({x:x(item),header:false});}
  }
  const clusters=[];
  for(const a of anchors.sort((a,b)=>a.x-b.x)){let c=clusters.find(c=>Math.abs(c.x-a.x)<=8);if(!c){c={x:a.x,count:0,header:false};clusters.push(c);}c.count++;c.header||=a.header;}
  const reliable=clusters.filter(c=>c.header||c.count>=3).map(c=>c.x),columns=[];
  for(const a of reliable)if(!columns.length||a-columns.at(-1)>=120)columns.push(a);
  // Partition original elements into independent columns BEFORE Y ordering and row grouping.
  const blocks=(columns.length>1?columns:[-Infinity]).map(()=>[]),assigned=new Map();
  const columnOf=item=>{let c=0;for(let n=1;n<columns.length;n++)if(x(item)>=columns[n]-3)c=n;return c;};
  for(const item of source){
    if(!/^(?:total|valor total)\b/.test(norm(item.str)))continue;
    const same=nearby(item),text=join(same);if(same[0]!==item||!(text.match(/[\d.]+,\d{2}\b/g)||[]).length)continue;
    // A unique explicit total is a single summary block even when its value is right-aligned.
    if(/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar|total (?:dos |de )?lancamentos atuais)\b/.test(norm(text))&&(text.match(/[\d.]+,\d{2}\b/g)||[]).length===1)for(const cell of same)assigned.set(cell,columnOf(item));
  }
  for(const item of source)blocks[assigned.has(item)?assigned.get(item):columnOf(item)].push(item);
  const output=[],sections=[];
  for(const elements of blocks){
    const blockStart=output.length;
    const rows=[];
    for(const item of elements.slice().sort((a,b)=>y(b)-y(a)||x(a)-x(b))){const last=rows.at(-1);if(last&&Math.abs(last.y-y(item))<=2)last.items.push(item);else rows.push({y:y(item),items:[item]});}
    const chunks=[];
    for(const row of rows){let current=[];const flush=()=>{if(current.length)chunks.push({y:row.y,items:current});current=[];};
      for(const item of row.items.sort((a,b)=>x(a)-x(b))){const prefix=join(current),last=current.at(-1),gap=last?x(item)-(x(last)+(last.width||0)):0;
        if(current.length&&((moneyEnd.test(prefix)&&dateStart.test(item.str.trim()))||(gap>=Math.max(35,Math.abs(item.transform[0]||1)*3)&&(heading.test(norm(item.str))||heading.test(norm(prefix))))))flush();
        current.push(item);
      }flush();
    }
    for(let n=0;n<chunks.length;n++){
      const row=chunks[n],cells=row.items,text=join(cells);let line=text,used=0;
      // A wrapped, explicit label is joined only within the same column and a nearby baseline.
      if(/^(?:total (?:dos |de )?lancamentos|total dos)\s*:?$/.test(norm(text))&&chunks[n+1]){
        const next=chunks[n+1],extra=join(next.items),distance=row.y-next.y;
        if(distance>2&&distance<=Math.max(8,Math.abs(cells[0].transform[0]||10))*2.2&&Math.abs(x(next.items[0])-x(cells[0]))<=40&&/^(?:atuais|lancamentos atuais)(?:\s*:?\s*(?:r\$\s*)?-?[\d.]+,\d{2})?\s*:?$/.test(norm(extra))){line=text.replace(/:\s*$/,'')+' '+extra;used=1;}
      }
      if(dateStart.test(text)){
        const height=Math.max(8,Math.abs(cells[0].transform[0]||10)),descriptionX=dateOnly.test(cells[0].str.trim())&&cells[1]?x(cells[1]):x(cells[0])+Math.min(40,height*3);let combined=text,lastY=row.y;
        for(let k=n+1;k<chunks.length&&k<=n+4;k++){
          const next=chunks[k],extra=join(next.items),gap=lastY-next.y;
          if(gap<=2||gap>height*2.2||dateStart.test(extra)||heading.test(norm(extra))||info.test(norm(extra)))break;
          if(moneyOnly.test(extra)&&!moneyEnd.test(combined)&&x(next.items[0])>descriptionX){combined+=' '+extra;used++;lastY=next.y;break;}
          if(!/^[A-Za-zÀ-ÿ]/.test(extra)||/[\d.]+,\d{2}/.test(extra)||x(next.items[0])<descriptionX-5)break;
          const match=combined.match(/^(.*?)(\s+(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?)$/i);
          if(match){const suffix=match[1].match(/\s+(\(?\d{1,3}\s*\/\s*\d{1,3}\)?)$/);combined=(suffix?match[1].slice(0,suffix.index):match[1])+' '+extra+(suffix?' '+suffix[1]:'')+match[2];}
          else combined+=' '+extra;
          used++;lastY=next.y;
        }
        line=combined;
      }
      if(used){output.push(line);n+=used;continue;}
      let handled=false;
      for(let end=0;end<cells.length;end++){
        const label=join(cells.slice(0,end+1));if(!total.test(norm(label)))continue;
        const tail=cells.slice(end+1),values=tail.filter(i=>moneyOnly.test(i.str.trim())),valueIndex=tail.indexOf(values[0]),currency=valueIndex===1&&/^r\$$/.test(norm(tail[0].str));
        if(values.length===1&&(valueIndex===0||currency)&&!tail.slice(valueIndex+1).some(i=>/[\d.]+,\d{2}/.test(i.str))){output.push(label+' '+join(tail.slice(0,valueIndex+1)));if(tail.length>valueIndex+1)output.push(join(tail.slice(valueIndex+1)));handled=true;break;}
      }
      if(!handled)output.push(line);
    }
    // Scope is local to a physical column, never inherited from another column/page.
    let scope='unknown',unknownStart=blockStart;
    for(let i=blockStart;i<output.length;i++){
      const n=norm(output[i]);
      if(/^(?:lancamentos(?: atuais|: compras e saques|: produtos e servicos)?|compras e saques|pagamentos e creditos|transacoes do cartao)(?:\s*\(continuacao\))?$/.test(n))scope='current';
      else if(/^(?:pagamentos efetuados|pagamentos anteriores)(?:\s*\(continuacao\))?$/.test(n))scope='previousPayments';
      else if(/^(?:compras parceladas.*proximas|parcelas futuras|compromissos futuros)\b/.test(n))scope='future';
      else if(/^(?:opcoes de parcelamento|parcelamento da fatura|simulacao|oferta de parcelamento)\b/.test(n))scope='offer';
      else if(/^resumo da fatura$/.test(n))scope='summary';
      if(scope!=='unknown')unknownStart=i+1;
      sections[i]=scope;
      // A closing current-total label can delimit an otherwise unlabelled continuation table.
      if(/^total (?:dos |de )?lancamentos atuais\b/.test(n)&&scope==='unknown'){
        const table=output.slice(unknownStart,i),hasHeader=table.some(s=>/^data\s+/i.test(s)),datedRows=table.filter(s=>dateStart.test(s)&&moneyEnd.test(s)).length;
        if(hasHeader||datedRows>=3)for(let j=unknownStart;j<=i;j++)sections[j]='current';
        sections[i]='current';
      }
    }
  }
  return options.withSections?{rows:output,sections}:output;
}
export async function readPDF(file, options = {}) {
  const password = options.password || undefined;
  delete options.password;
  if (file.size != null && file.size > 20 * 1024 * 1024) {
    throw new Error('Arquivo excede 20 MB.');
  }
  const pdfjs = await import('./vendor/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.mjs', import.meta.url).href;
  let cmapUrl = new URL('./vendor/cmaps/', import.meta.url).href;
  let fontUrl = new URL('./vendor/standard_fonts/', import.meta.url).href;
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { fileURLToPath } = await import('node:url');
    cmapUrl = fileURLToPath(new URL(cmapUrl)).replaceAll('\\','/');
    fontUrl = fileURLToPath(new URL(fontUrl)).replaceAll('\\','/');
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(options.data || await globalThis.LocalFiles.readBuffer(file)),
    isEvalSupported: false,
    password,
    cMapUrl: cmapUrl,
    cMapPacked: true,
    standardFontDataUrl: fontUrl,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 100) throw new Error('PDF excede 100 páginas.');
    const lines = [], layoutSections = [];
    let characters = 0;
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const content = pdf.isPureXfa ? await page.getTextContent() : await readPageTextContent(page);
      for (const item of content.items) {
        if (typeof item.str !== 'string') continue;
        characters += item.str.length;
        if (characters > 2_000_000) throw new Error('Texto do PDF excede o limite de leitura.');
      }
      // Optional local audit hook: the normal import path never installs it.
      if (typeof options.onPage === 'function') await options.onPage(content.items);
      if(options.bank==='Itaú'){const layout=itauTextRows(content.items,{withSections:true});lines.push(...layout.rows);layoutSections.push(...layout.sections);}else lines.push(...textRows(content.items));
      page.cleanup();
    }
    if(options.bank==='Itaú'&&typeof options.onLayout==='function')options.onLayout({sections:layoutSections});
    const text = lines.join('\n');
    if (!text.trim()) throw new Error('PDF sem texto extraível. Use CSV; não há OCR.');
    return text;
  } catch (error) {
    if (error?.name === 'PasswordException') throw new Error('PDF protegido: informe a senha temporária correta ou importe uma cópia desbloqueada.');
    throw error;
  } finally {
    // Also release the worker after password, invalid-document and text-limit failures.
    await task.destroy();
  }
}
