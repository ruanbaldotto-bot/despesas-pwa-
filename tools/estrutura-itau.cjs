// Fixed counters only: no document text, dates, values or identifiers leave this function.
function structure(text){
 const r={shortRows:0,shortRowsWithAmount:0,amountBeforeAnotherDate:0,trailingInstallmentCandidates:0,fullDateAnchors:0,totalLabels:0,totalInline:0,totalNextLine:0,totalWithoutAdjacentAmount:0,sections:{transactions:0,payments:0,future:0,offers:0,summary:0}};
 const lines=String(text).split(/\r?\n/).map(s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\u00a0/g,' ').trim().toLowerCase());
 const amount='(?:r\\$\\s*)?-?[\\d.]+,\\d{2}';
 for(let i=0;i<lines.length;i++){
  const l=lines[i];
  if(/^\d{2}\/(?:0[1-9]|1[0-2])(?!\/\d{4})\b/.test(l)){r.shortRows++;if(new RegExp(amount+'\\s*[dc-]?\\s*$').test(l))r.shortRowsWithAmount++;}
  if(new RegExp(amount+'\\s+\\d{2}/(?:0[1-9]|1[0-2])(?:/\\d{4})?\\s+\\S').test(l))r.amountBeforeAnotherDate++;
  if(/\b\d{1,3}\/\d{1,3}\)?\s+(?:r\$\s*)?-?[\d.]+,\d{2}\s*[dc-]?\s*$/.test(l))r.trailingInstallmentCandidates++;
  if(/^(?:vencimento|fechamento|data de vencimento|periodo)\b.*(?:\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/.test(l))r.fullDateAnchors++;
  if(/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar)\b/.test(l)){
   r.totalLabels++;
   if(new RegExp(amount+'\\s*$').test(l))r.totalInline++;
   else if(new RegExp('^'+amount+'\\s*$').test(lines[i+1]||''))r.totalNextLine++;
   else r.totalWithoutAdjacentAmount++;
  }
  if(/^(?:lancamentos|compras e saques|transacoes do cartao)\b/.test(l))r.sections.transactions++;
  if(/^pagamentos e creditos\b/.test(l))r.sections.payments++;
  if(/^(?:compras parceladas.*proximas|parcelas futuras|compromissos futuros)\b/.test(l))r.sections.future++;
  if(/^(?:opcoes de parcelamento|parcelamento da fatura|simulacao|oferta de parcelamento)\b/.test(l))r.sections.offers++;
  if(/^resumo da fatura\b/.test(l))r.sections.summary++;
 }
 return r;
}
module.exports={structure};

