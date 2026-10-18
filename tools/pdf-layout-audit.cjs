// Strictly local positional probes. Only fixed aggregate fields leave result().
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const dated=/^(?:\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})\b/;
const amount=/(?:r\$\s*)?-?[\d.]+,\d{2}\s*[dc-]?\s*$/i;
const total=/^(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar)\b/;
function positionedRows(items){
 const rows=[];
 for(const item of items.filter(i=>typeof i.str==='string'&&i.str.trim()&&Array.isArray(i.transform)).slice().sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){
  const last=rows.at(-1),y=item.transform[5];if(last&&Math.abs(last.y-y)<=2)last.items.push(item);else rows.push({y,items:[item]});
 }
 return rows.map(r=>r.items.sort((a,b)=>a.transform[4]-b.transform[4]));
}
function createLayoutProbe(){
 const metrics={pages:0,rows:0,multiAmountRows:0,multiDateRows:0,dateCellsAfterAmount:0,sourceOrderBacktracks:0,amountOnlyCells:0,totalRowsWithMultipleAmounts:0,totalRowsWithTrailingText:0,tableHeadingRows:0,splitCandidateRows:0};
 const alternative=[];
 function addPage(items){
  metrics.pages++;
  let prior;
  for(const item of items){if(typeof item.str!=='string'||!item.str.trim())continue;if(prior&&Math.abs(prior.transform[5]-item.transform[5])<=2&&item.transform[4]<prior.transform[4]-2)metrics.sourceOrderBacktracks++;prior=item;if(/^(?:r\$\s*)?-?[\d.]+,\d{2}\s*[dc-]?\s*$/i.test(item.str.trim()))metrics.amountOnlyCells++;}
  for(const row of positionedRows(items)){
   metrics.rows++;const text=row.map(i=>i.str).join(' '),n=normalize(text),amounts=text.match(/-?[\d.]+,\d{2}\b/g)||[],dates=text.match(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g)||[];
   if(amounts.length>1)metrics.multiAmountRows++;if(dates.length>1)metrics.multiDateRows++;
   if(total.test(n)){if(amounts.length>1)metrics.totalRowsWithMultipleAmounts++;if(amounts.length&&!amount.test(text))metrics.totalRowsWithTrailingText++;}
   if(/^(?:lancamentos|compras e saques|pagamentos e creditos|transacoes do cartao)\b/.test(n))metrics.tableHeadingRows++;
   let chunk=[],parts=[];
   for(const item of row){const prefix=chunk.map(i=>i.str).join(' '),last=chunk.at(-1),gap=last?item.transform[4]-(last.transform[4]+(last.width||0)):0;
    if(last&&dated.test(item.str.trim())&&amount.test(prefix)){metrics.dateCellsAfterAmount++;}
    // Candidate only: independent date/total block after a completed monetary block and large gutter.
    if(last&&gap>=Math.max(40,4*Math.abs(item.transform[0]||1))&&amount.test(prefix)&&(dated.test(item.str.trim())||total.test(normalize(item.str)))){parts.push(prefix);chunk=[];}
    chunk.push(item);
   }
   parts.push(chunk.map(i=>i.str).join(' '));if(parts.length>1)metrics.splitCandidateRows++;alternative.push(...parts);
  }
 }
 function result(F,bank){
  const parsed=F.parse(alternative.join('\n'),bank,'pdf');
  return {metrics:{...metrics},columnCandidate:{mode:'diagnóstico; não usado para importar',transactions:parsed.items.length,exceptions:parsed.diagnostics?.exceptions?.length||0,totalRecognized:parsed.reportedTotalCents!=null,reconciliation:parsed.reportedTotalCents==null?'total não reconhecido':F.reconcile(parsed.items,parsed.reportedTotalCents).ok?'exata':'divergente',installmentPurchases:parsed.items.filter(e=>e.kind==='purchase'&&e.installmentNumber).length,financialLinesOutsideReview:parsed.diagnostics?.coverage?.financialLinesOutsideReview??null}};
 }
 return {addPage,result};
}
module.exports={createLayoutProbe,positionedRows};
