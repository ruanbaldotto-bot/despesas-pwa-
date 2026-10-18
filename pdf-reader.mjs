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
export function itauTextRows(items) {
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  const dateStart=/^(?:\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})\b/;
  const moneyEnd=/(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?\s*$/i;
  const moneyOnly=/^(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?\s*$/i;
  const heading=/^(?:lancamentos(?:\b|:)|compras e saques|pagamentos e creditos|transacoes do cartao|resumo da fatura|opcoes de parcelamento|parcelamento da fatura|parcelas futuras|compras parceladas.*proximas)/;
  const total=/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar)\s*(?:\(r\$\))?\s*[:=]?\s*$/;
  const rows=[];
  for(const item of items.filter(i=>typeof i.str==='string'&&i.str.trim()).slice().sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){
    const y=item.transform[5],last=rows.at(-1);if(last&&Math.abs(last.y-y)<=2)last.items.push(item);else rows.push({y,items:[item]});
  }
  const headers=[];
  for(const row of rows){row.items.sort((a,b)=>a.transform[4]-b.transform[4]);
    row.items.forEach((item,index)=>{if(norm(item.str)==='data'&&row.items.slice(index+1).some(x=>/^(?:descricao|estabelecimento|lancamento|historico)\b/.test(norm(x.str)))&&row.items.slice(index+1).some(x=>/^(?:valor|r\$)\b/.test(norm(x.str))))headers.push({x:item.transform[4],y:row.y});});
  }
  const starts=[...new Set(headers.map(h=>Math.round(h.x/5)*5))].sort((a,b)=>a-b);
  // Only explicit multi-table headers enable column-major order. Otherwise use visual rows.
  const columns=starts.filter((x,i)=>!i||x-starts[i-1]>=120),blocks=columns.length>1?columns.map(()=>[]):[[]];
  for(const row of rows){
    let chunks=[row.items];
    const fullRow=row.items.map(i=>i.str).join(' '),singleTotal=/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar)\b/.test(norm(fullRow))&&(fullRow.match(/[\d.]+,\d{2}\b/g)||[]).length===1;
    if(blocks.length>1&&singleTotal){chunks=blocks.map(()=>[]);let column=0;for(let c=1;c<columns.length;c++)if(row.items[0].transform[4]>=columns[c]-3)column=c;chunks[column]=row.items;}
    else if(blocks.length>1){chunks=blocks.map(()=>[]);for(const item of row.items){let index=0;for(let c=1;c<columns.length;c++)if(item.transform[4]>=columns[c]-3)index=c;chunks[index].push(item);}}
    chunks.forEach((chunk,column)=>{
      let current=[];
      const flush=()=>{if(current.length)blocks[column].push({y:row.y,items:current});current=[];};
      for(const item of chunk){const prefix=current.map(i=>i.str).join(' '),last=current.at(-1),gap=last?item.transform[4]-(last.transform[4]+(last.width||0)):0;
        // A parcel suffix has no preceding completed amount and stays with its purchase.
        if(current.length&&((moneyEnd.test(prefix)&&dateStart.test(item.str.trim()))||(gap>=Math.max(35,Math.abs(item.transform[0]||1)*3)&&(heading.test(norm(item.str))||heading.test(norm(prefix))))))flush();
        current.push(item);
      }
      flush();
    });
  }
  const output=[];
  for(const block of blocks){
    for(let n=0;n<block.length;n++){
      const row=block[n],cells=row.items;let handled=false;
      // Separate an explicit total block from trailing unrelated text only when one value is unique.
      for(let end=0;end<cells.length;end++){
        const label=cells.slice(0,end+1).map(i=>i.str).join(' ');
        if(!total.test(norm(label)))continue;
        const tail=cells.slice(end+1),values=tail.filter(i=>moneyOnly.test(i.str.trim()));
        const valueIndex=tail.indexOf(values[0]),currency=valueIndex===1&&/^r\$/.test(norm(tail[0].str));
        if(values.length===1&&(valueIndex===0||currency)&&!tail.slice(valueIndex+1).some(i=>/[\d.]+,\d{2}/.test(i.str))){
          output.push(label+' '+tail.slice(0,valueIndex+1).map(i=>i.str).join(' '));if(tail.length>valueIndex+1)output.push(tail.slice(valueIndex+1).map(i=>i.str).join(' '));handled=true;break;
        }
      }
      if(!handled)output.push(cells.map(i=>i.str).join(' '));
    }
  }
  return output;
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
    const lines = [];
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
      lines.push(...(options.bank==='Itaú'?itauTextRows(content.items):textRows(content.items)));
      page.cleanup();
    }
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
