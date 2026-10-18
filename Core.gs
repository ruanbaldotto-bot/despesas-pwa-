(function(root){
'use strict';
const fail=m=>{throw new Error(m);};
function integer(n){if(!Number.isSafeInteger(n))fail('Valor fora do intervalo seguro.');return n;}
function money(v){
 let s=String(v).replace(/[\u00a0\u202f]/g,' ').replace(/\u2212/g,'-').trim();
 const parentheses=/^\(.*\)$/.test(s);if(parentheses)s=s.slice(1,-1).trim();
 s=s.replace(/^(-?)\s*R\$\s*/i,(_,sign)=>sign).replace(/^-\s+(?=\d)/,'-');
 if(parentheses){if(s.startsWith('-'))fail('Sinal monetário ambíguo.');s='-'+s;}
 if(/^-?\d{1,3}(?: \d{3})+(?:,\d{1,2})?$/.test(s))s=s.replaceAll(' ','');
 if(s.includes(',')){if(!/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(s))fail('Valor monetário inválido.');s=s.replaceAll('.','').replace(',','.');}
 if(!/^-?\d+(?:\.\d{1,2})?$/.test(s))fail('Use no máximo duas casas decimais.');
 const neg=s.startsWith('-');s=s.replace('-','');const [a,b='']=s.split('.');return integer(Number((neg?-1n:1n)*(BigInt(a)*100n+BigInt(b.padEnd(2,'0')))));
}
function cents(e){return e.amountCents!=null?integer(e.amountCents):money(Number(e.amount).toFixed(2));}
function month(s){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(s))fail('Mês inválido.');return s;}
function addMonth(s,n){month(s);let d=new Date(s+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,7);}
function date(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))fail('Data ISO inválida.');const d=new Date(s+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)fail('Data ISO inválida.');return s;}
function split(total,parts,percent=false){
 integer(total);const sign=total<0?-1:1;total=Math.abs(total);
 if(!parts.length||new Set(parts.map(p=>p.personId)).size!==parts.length)fail('Responsáveis repetidos ou ausentes.');
 parts.forEach(p=>{if(!p.personId||!Number.isSafeInteger(p.value)||p.value<0)fail('Divisão inválida.');});
 const sum=parts.reduce((s,p)=>integer(s+p.value),0);
 if(sum!==(percent?10000:total))fail(percent?'Percentuais devem somar 100%.':'Valores devem somar a compra.');
 if(!percent)return parts.map(p=>({personId:p.personId,amountCents:sign*p.value}));
 const rows=parts.map((p,i)=>{const v=BigInt(total)*BigInt(p.value);return {personId:p.personId,amountCents:Number(v/10000n),rem:Number(v%10000n),i};});
 let rest=total-rows.reduce((s,p)=>s+p.amountCents,0);
 [...rows].sort((a,b)=>b.rem-a.rem||a.i-b.i).slice(0,rest).forEach(p=>p.amountCents++);
 return rows.map(({personId,amountCents})=>({personId,amountCents:sign*amountCents}));
}
function csvRows(text){
 text=String(text).replace(/^\uFEFF/,'');const directive=text.match(/^sep=([;,\t])\r?\n/i);if(directive)text=text.slice(directive[0].length);
 const first=text.split(/\r?\n/)[0];let inside=false,commas=0,semicolons=0;
 for(const c of first){if(c==='"')inside=!inside;else if(!inside){if(c===',')commas++;if(c===';')semicolons++;}}
 const sep=directive?directive[1]:semicolons>commas?';':',';
 const rows=[];let row=[],cell='',quote=false,closed=false;
 function finishCell(){row.push(cell);cell='';closed=false;}
 function finishRow(){finishCell();rows.push(row);row=[];}
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quote){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quote=false;closed=true;}}else cell+=c;continue;}
  if(c===sep){finishCell();continue;}
  if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;finishRow();continue;}
  if(closed){if(c===' '||c==='\t')continue;fail('Texto fora das aspas do campo CSV.');}
  if(c==='"'){if(cell.trim().length)fail('Aspas fora do início do campo CSV.');cell='';quote=true;continue;}
  cell+=c;
 }
 if(quote)fail('CSV com aspas incompletas.');if(cell||row.length||closed)finishRow();return rows;
}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const adapters={
 'Santander':{date:['data','data da compra'],desc:['descricao','estabelecimento'],value:['valor','valor (r$)']},
 'Porto Bank':{date:['data','data compra'],desc:['descricao','estabelecimento'],value:['valor','valor r$']},
 'Mercado Pago':{date:['data','date'],desc:['descricao','description'],value:['valor','amount']},
 'Nubank':{date:['date','data'],desc:['title','descricao'],value:['amount','valor']},
 'Itaú':{date:['data','data da compra'],desc:['lancamento','descricao','historico'],value:['valor em r$','valor (r$)','valor'],readPDF:readItau},
 'Bradesco / Bradescard':{date:['data','data da compra'],desc:['estabelecimento','descricao','historico'],value:['valor r$','valor (r$)','valor'],readPDF:readBradesco}
};
function canonicalBank(bank){if(['Bradesco','Bradescard'].includes(bank))return 'Bradesco / Bradescard';if(bank==='Itau')return 'Itaú';return bank;}
function detectBank(text){const found=new Set();for(const line of text.split(/\r?\n/).slice(0,20)){const s=normalize(line);if(/^(?:banco )?itau(?:\b|$)/.test(s))found.add('Itaú');if(/^(?:banco )?(?:bradesco|bradescard)(?:\b|$)/.test(s))found.add('Bradesco / Bradescard');for(const bank of ['Santander','Porto Bank','Mercado Pago','Nubank'])if(s.startsWith(normalize(bank)))found.add(bank);}return found.size===1?[...found][0]:null;}
function ambiguousPDFRow_(line){return /[.,]\d{2}\s+(?:\d{2}\/(?:0[1-9]|1[0-2])(?:\/\d{4})?|\d{4}-\d{2}-\d{2})\s+\S/.test(line);}
function datedBankRow(line){
 if(ambiguousPDFRow_(line))fail('Possíveis transações de colunas diferentes na mesma linha; separar e revisar.');
 const m=line.match(/^\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+(?:R\$\s*)?(-?[\d.]+,\d{2})\s*([DC-])?\s*$/i);
 if(!m)return null;if(/^\d{2}\/\d{2}$/.test(m[1]))fail('Data sem ano: confira e complete a data no texto de revisão.');
 let value=money(m[3]);if(m[4]&&/C|-/.test(m[4].toUpperCase()))value=-Math.abs(value);
 return make(parseDate(m[1]),m[2].trim(),value);
}
function bankResult(items,issues,totals,metadata,bank){const unique=[...new Set(totals)];if(unique.length>1)issues.push('Totais declarados conflitantes; confira o total manualmente.');return {items,issues,reportedTotalCents:unique.length===1?unique[0]:null,metadata,bank};}
// Short dates require an explicit transaction period, never the current year or due year alone.
function reviewPeriod_(value){
 if(!value||value.confirmed!==true)fail('Confirme explicitamente o período aplicável às datas dos lançamentos.');
 const from=date(value.from),to=date(value.to),days=(Date.parse(to)-Date.parse(from))/86400000;
 if(days<0||days>366)fail('Período de revisão inválido: informe até 366 dias; datas com mais de um ano possível exigem correção individual.');
 return {from,to};
}
function itauCycle_(lines){
 const ranges=[];
 for(const raw of lines){const n=normalize(raw),m=n.match(/^(?:periodo (?:de lancamentos|da fatura)|ciclo da fatura)\s*:?\s*(\d{2}\/\d{2}\/\d{4})\s+(?:a|ate|-)\s+(\d{2}\/\d{2}\/\d{4})$/);if(!m)continue;
  try{const from=parseDate(m[1]),to=parseDate(m[2]),days=(Date.parse(to)-Date.parse(from))/86400000;if(days<0||days>62)return null;ranges.push({from,to});}catch{return null;}
 }
 const unique=[...new Map(ranges.map(r=>[r.from+'|'+r.to,r])).values()];return unique.length===1?unique[0]:null;
}
function itauRow_(line,cycle,explicitSection){
 if(ambiguousPDFRow_(line))fail('Possíveis transações de colunas diferentes na mesma linha; separar e revisar.');
 const m=line.match(/^\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+(?:R\$\s*)?(-?[\d.]+,\d{2})\s*([DC-])?\s*$/i);if(!m)return null;
 let resolved=m[1];
 if(/^\d{2}\/\d{2}$/.test(resolved)){
  if(!cycle||!explicitSection)fail('Data sem ano: período explícito dos lançamentos e seção de transações necessários.');
  const candidates=[];
  for(let year=Number(cycle.from.slice(0,4));year<=Number(cycle.to.slice(0,4));year++){try{const d=parseDate(resolved+'/'+year);if(d>=cycle.from&&d<=cycle.to)candidates.push(d);}catch{}}
  if(candidates.length!==1)fail('Data curta fora do período explícito ou ambígua; revisão necessária.');resolved=candidates[0];
 }
 const note=m[2].trim(),suffix=note.match(/(?:\(\s*)?(?:parcela\s*)?(\d{1,3})\s*(?:\/| de )\s*(\d{1,3})\s*\)?\s*$/i);
 const rest=suffix?note.slice(0,suffix.index).trim():note;
 if(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/.test(rest)||suffix&&/\b(?:em|dia|data|desde|ate)\s*$/i.test(normalize(rest)))fail('Data adicional ou sufixo ambíguo na descrição; confira as colunas e parcelas.');
 let value=money(m[3]);if(m[4]&&/C|-/.test(m[4].toUpperCase()))value=-Math.abs(value);
 // Payments and credits are never anchors for future purchase installments.
 const credit=/^(?:pagamento|estorno|credito)\b/.test(normalize(note))||value<0;
 const row=make(parseDate(resolved),credit&&suffix?rest:note,value);
 if(credit){row.note=note;delete row.installmentNumber;delete row.installmentsTotal;}
 return row;
}
function itauTotal_(line){
 const n=normalize(line),label='(?:total (?:desta |da )?fatura|valor total (?:desta |da )?fatura|total a pagar|total (?:dos |de )?lancamentos atuais)';
 const m=n.match(new RegExp('^'+label+'\\s*(?:\\(r\\$\\))?\\s*[:=\\-]?\\s*(?:r\\$\\s*)?(-?[\\d.]+,\\d{2})\\s*$'));
 return {value:m?money(m[1]):null,label:new RegExp('^'+label+'\\s*(?:\\(r\\$\\))?\\s*[:=]?\\s*$').test(n)};
}
function readItau(text,options={}){
 const items=[],issues=[],totals=[],metadata={},lines=text.split(/\r?\n/).map(s=>s.replace(/\u00a0/g,' ').trim()),cycle=options.reviewPeriod?reviewPeriod_(options.reviewPeriod):itauCycle_(lines);let section='transactions',explicitSection=false;
 metadata.dateContext=cycle?(options.reviewPeriod?'período confirmado na revisão':'período explícito'):'ausente ou ambíguo';if(options.reviewPeriod)metadata.reviewPeriod={from:cycle.from,to:cycle.to};
 const consumed=new Set(),recognizedSources=new Set(),summarySources=new Set(),futureReferences={},futureLines=new Set(),previousPayments=[],reportedPreviousPayments=[],previousLines=new Set();let previousConflict=false;
 lines.forEach((line,i)=>{const n=normalize(line);if(!line||consumed.has(i))return;
  if(/^(?:opcoes de parcelamento|parcelamento da fatura|simulacao|oferta de parcelamento)\b/.test(n)){section='offer';explicitSection=false;issues.push('Linha '+(i+1)+': oferta de financiamento excluída das compras.');return;}
  if(/^(?:compras parceladas.*proximas|parcelas futuras|compromissos futuros)\b/.test(n)){section='future';explicitSection=false;return;}
  if(/^(?:pagamentos efetuados|pagamentos anteriores)(?:\s*\(continuacao\))?$/.test(n)){section='previousPayments';explicitSection=false;return;}
  if(/^(?:lancamentos(?: atuais|: compras e saques|: produtos e servicos)?|compras e saques|pagamentos e creditos|transacoes do cartao)(?:\s*\(continuacao\))?$/.test(n)){section='transactions';explicitSection=true;return;}
  if(/^resumo da fatura$/.test(n)){section='summary';explicitSection=false;return;}
  try{
   if(section==='future'){
    const f=n.match(/^(proxima fatura(?: parcelada)?|demais (?:faturas|parcelas)(?: parceladas| futuras)?|total futuro|total (?:para |das )?proximas faturas)\s*[:=]?\s*(?:r\$\s*)?([\d.]+,\d{2})$/);
    if(f){const key=/^proxima/.test(f[1])?'nextCents':/^demais/.test(f[1])?'remainingCents':'totalCents';(futureReferences[key]||=[]).push(money(f[2]));futureLines.add(i);summarySources.add(i);return;}
   }
   if(section==='previousPayments'){
    const pay=line.match(/^\s*(?:\d{2}\/\d{2}(?:\/\d{4})?|\d{4}-\d{2}-\d{2})\s+(?:PAGAMENTO|PAGTO)\b.*?\s+(?:R\$\s*)?(-?[\d.]+,\d{2})\s*[DC-]?\s*$/i);
    if(pay&&!ambiguousPDFRow_(line)){previousPayments.push(Math.abs(money(pay[1])));summarySources.add(i);previousLines.add(i);return;}
    const sum=n.match(/^total (?:de )?pagamentos(?: efetuados| anteriores)?\s*:?\s*(?:r\$\s*)?(-?[\d.]+,\d{2})$/);
    if(sum){reportedPreviousPayments.push(Math.abs(money(sum[1])));summarySources.add(i);previousLines.add(i);return;}
   }
   if(section!=='offer'&&section!=='future'&&section!=='previousPayments'){

    const total=itauTotal_(line);if((total.label||total.value!=null)&&/^total (?:dos |de )?lancamentos atuais/.test(n))metadata.totalScope='currentCharges';if(total.value!=null){totals.push(total.value);summarySources.add(i);if(/^total (?:dos |de )?lancamentos atuais/.test(n))metadata.totalScope='currentCharges';return;}
    if(total.label){const next=(lines[i+1]||'').match(/^(?:R\$\s*)?(-?[\d.]+,\d{2})$/i);if(next){totals.push(money(next[1]));consumed.add(i+1);summarySources.add(i);summarySources.add(i+1);}else issues.push('Linha '+(i+1)+': referência ao total sem valor adjacente; conferir.');return;}
   }
   const due=n.match(/^(?:data de )?vencimento\s*:?\s*(\d{2}\/\d{2}\/\d{4})$/);if(due){metadata.dueDate=parseDate(due[1]);summarySources.add(i);return;}
   if(/^(?:periodo (?:de lancamentos|da fatura)|ciclo da fatura)\b/.test(n))return;
   if(section!=='transactions'){if(/^\d/.test(n)||/[\d.]+,\d{2}\s*$/.test(n))issues.push('Linha '+(i+1)+(section==='summary'?': registro em resumo exige revisão; não importado.':': item em seção de oferta/futuro não importado.'));return;}
   if(/^(?:itau\b|data\s+(?:lancamento|descricao))/.test(n))return;
   let combined=line,used=[];
   // Reassemble only a bounded, unambiguous fragment inside an explicit transaction section.
   if(explicitSection&&/^\d{2}\/\d{2}(?:\/\d{4})?(?:\s+[^\d].*)?$/.test(line)&&!/[\d.]+,\d{2}\s*[DC-]?\s*$/i.test(line)){
    const next=lines[i+1]||'',after=lines[i+2]||'',amountOnly=/^(?:R\$\s*)?-?[\d.]+,\d{2}\s*[DC-]?\s*$/i;
    if(!/^\d{2}\/\d{2}(?:\/\d{4})?\s*$/.test(line)&&amountOnly.test(next)){combined=line+' '+next;used=[i+1];}
    else if(/^\d{2}\/\d{2}(?:\/\d{4})?\s*$/.test(line)&&/^[A-Za-zÀ-ÿ]/.test(next)&&!/[\d.]+,\d{2}|^(?:total|limite|saldo|vencimento|lancamentos|resumo|opcoes|parcelas futuras|compras e saques|pagamentos e creditos)\b/.test(normalize(next))&&amountOnly.test(after)){combined=line+' '+next+' '+after;used=[i+1,i+2];}
   }
   const row=itauRow_(combined,cycle,explicitSection);if(row){items.push(row);recognizedSources.add(i);used.forEach(n=>{consumed.add(n);recognizedSources.add(n);});}else issues.push('Linha '+(i+1)+': formato Itaú não reconhecido; confira o documento.');
  }catch(e){issues.push('Linha '+(i+1)+': '+e.message);}
 });
 if(previousPayments.length||reportedPreviousPayments.length){const reported=[...new Set(reportedPreviousPayments)],calculated=previousPayments.reduce((s,v)=>integer(s+v),0);previousConflict=reported.length>1||previousPayments.length&&reported.length===1&&reported[0]!==calculated;metadata.previousPaymentsCents=previousPayments.length?calculated:reported.length===1?reported[0]:0;metadata.previousPaymentsCheck=previousConflict?'divergente':'seção separada';if(previousConflict){for(const i of previousLines)summarySources.delete(i);issues.push('Pagamentos anteriores divergentes; confira as referências sem alterar compras atuais.');}else issues.push('Pagamentos anteriores conferidos como histórico; não reduzem os lançamentos atuais.');}
 if(Object.keys(futureReferences).length){
  metadata.future={};let conflicting=false;
  for(const [key,values]of Object.entries(futureReferences)){const unique=[...new Set(values)];if(unique.length===1)metadata.future[key]=unique[0];else conflicting=true;}
  const f=metadata.future;if(f.nextCents!=null&&f.remainingCents!=null&&f.totalCents!=null&&integer(f.nextCents+f.remainingCents)!==f.totalCents)conflicting=true;
  metadata.futureCheck=conflicting?'divergente':Object.keys(f).length===3?'coerente':'incompleto';
  if(conflicting){for(const i of futureLines)summarySources.delete(i);issues.push('Resumo futuro divergente; nenhuma parcela foi criada a partir do resumo.');}
  else issues.push('Resumo de próximas faturas usado somente para conferência; não cria compras ou parcelas.');
 }
 return {...bankResult(items,issues,totals,metadata,'Itaú'),sourceAccounting:{recognized:[...recognizedSources],summary:[...summarySources]}};
}
function readBradesco(text){
 const items=[],issues=[],totals=[],metadata={future:{}};let section='transactions';
 text.split(/\r?\n/).forEach((raw,i)=>{const line=raw.replace(/\u00a0/g,' ').trim(),n=normalize(line);if(!line)return;
  if(/^(?:oferta|opcoes de parcelamento|parcelamento da fatura|simulacao)/.test(n)){section='offer';issues.push(`Linha ${i+1}: oferta de parcelamento da fatura excluída.`);return;}
  if(/^(?:resumo (?:das )?compras parceladas|compras parceladas futuras|compromissos futuros)$/.test(n)){section='future';return;}
  if(/^(?:lancamentos|transacoes(?: nacionais| internacionais)?|despesas do cartao|pagamentos e creditos)$/.test(n)){section='transactions';return;}
  try{
   const summary=n.match(/^(proxima fatura parcelada|demais parcelas futuras|total futuro)\s*:?\s*(?:r\$\s*)?([\d.]+,\d{2})$/);
   if(summary&&section!=='offer'){const keys={'proxima fatura parcelada':'nextCents','demais parcelas futuras':'remainingCents','total futuro':'totalCents'};metadata.future[keys[summary[1]]]=money(summary[2]);return;}
   if(section!=='transactions'){if(/^\d/.test(n))issues.push(`Linha ${i+1}: valor em oferta/resumo não virou lançamento.`);return;}
   const total=n.match(/^(?:total desta fatura|saldo da fatura|saldo desta fatura|total da fatura|valor desta fatura)\s*:?\s*(?:r\$\s*)?(-?[\d.]+,\d{2})$/);if(total){totals.push(money(total[1]));return;}
   const due=n.match(/^vencimento\s*:?\s*(\d{2}\/\d{2}\/\d{4})$/);if(due){metadata.dueDate=parseDate(due[1]);return;}
   if(/^(?:bradesco\b|bradescard\b|data\s+estabelecimento|resumo da fatura$)/.test(n))return;
   const row=datedBankRow(line);if(row)items.push(row);else issues.push(`Linha ${i+1}: formato Bradesco/Bradescard não reconhecido; confira o documento.`);
  }catch(e){issues.push(`Linha ${i+1}: ${e.message}`);}
 });
 const f=metadata.future;if(f.nextCents!=null&&f.remainingCents!=null&&f.totalCents!=null&&f.nextCents+f.remainingCents!==f.totalCents)issues.push('Resumo futuro divergente; não foi usado para criar parcelas.');
 return bankResult(items,issues,totals,metadata,'Bradesco / Bradescard');
}
function parseDate(s){s=String(s).trim();if(/^\d{2}\/\d{2}\/\d{4}$/.test(s))s=s.split('/').reverse().join('-');return date(s);}
function installment(desc){const m=desc.match(/(?:\(\s*)?(?:parcela\s*)?(\d{1,3})\s*(?:\/| de )\s*(\d{1,3})\s*\)?\s*$/i);if(!m)return {};const n=+m[1],t=+m[2];if(!n||n>t)fail('Parcelamento inválido.');const result={installmentNumber:n,installmentsTotal:t};validateInstallments(result);return result;}
function extractTotal(text){
 const values=[],lines=text.split(/\r?\n/).map(normalize);
 const label='(?:total da fatura|total desta fatura|total a pagar|valor total da fatura|valor total desta fatura|valor desta fatura|total liquido)';
 const inline=new RegExp('^'+label+'\\s*[:\\-]?\\s*(?:r\\$\\s*)?(-?[\\d.]+,\\d{2})$');
 const onlyLabel=new RegExp('^'+label+'\\s*:?$');
 for(let n=0;n<lines.length;n++){const m=lines[n].match(inline);if(m)values.push(money(m[1]));else if(onlyLabel.test(lines[n])){const next=(lines[n+1]||'').match(/^(?:r\$\s*)?(-?[\d.]+,\d{2})$/);if(next)values.push(money(next[1]));}}
 const unique=[...new Set(values)];return unique.length===1?unique[0]:null;
}
function parseBase(text,bank,format,options={}){
 bank=canonicalBank(bank);const adapter=adapters[bank];if(!adapter)fail('Banco não suportado.');if(format!=='csv'&&adapter.readPDF)return adapter.readPDF(text,options);const items=[],issues=[],exceptions=[];
 if(format==='csv'){
 const rows=csvRows(text.replace(/^\uFEFF/,''));const heads=(rows.shift()||[]).map(normalize);
 const col=names=>{const found=heads.map((h,i)=>names.includes(h)?i:-1).filter(i=>i>=0);if(found.length>1)fail('Cabeçalho ambíguo: há colunas repetidas para o mesmo campo.');return found[0]??-1;};const di=col(adapter.date),ni=col(adapter.desc),vi=col(adapter.value);
 if([di,ni,vi].includes(-1))fail('Cabeçalho não reconhecido. Use data, descricao, valor; datas com ano.');
 rows.forEach((r,i)=>{if(r.every(v=>!v.trim()))return;try{if(r.length!==heads.length)fail('Quantidade de colunas divergente do cabeçalho.');const note=r[ni]?.trim();if(!note)fail('Descrição ausente.');items.push(make(parseDate(r[di]),note,money(r[vi])));}catch(e){issues.push(`Linha ${i+2}: ${e.message}`);exceptions.push({line:i+2,source:r.join(' | '),reason:e.message,resolved:false});}});
 }else{
 text.split(/\r?\n/).forEach((line,i)=>{line=line.replace(/\u00a0/g,' ');if(!line.trim()||extractTotal(line)!==null)return;if(ambiguousPDFRow_(line)){issues.push(`Linha ${i+1}: possíveis transações de colunas diferentes; separar e revisar.`);return;}const m=line.match(/^\s*(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(?:R\$\s*)?(-?[\d.]+,\d{2})\s*$/);if(!m){issues.push(`Linha ${i+1} não reconhecida: revise no documento.`);return;}try{items.push(make(parseDate(m[1]),m[2],money(m[3])));}catch(e){issues.push(`Linha ${i+1}: ${e.message}`);}});
 }
 return {items,issues,reportedTotalCents:format==='csv'?null:extractTotal(text),diagnostics:{exceptions,informational:0,unresolved:exceptions.length}};
}
function pdfDiagnostics(text,result){
 const lines=text.split(/\r?\n/),exceptions=[],informationalLines=new Set();let informational=0;
 const retained=[];
 for(const issue of result.issues){const number=issue.match(/^Linha (\d+)/);if(!number){retained.push(issue);continue;}
 const index=Number(number[1])-1,line=lines[index]||'',n=normalize(line);
 const obviousInfo=/^(?:total|saldo|limite|vencimento|fechamento|encargos|juros|cet|iof|taxa|pagamento minimo|codigo|cnpj|cpf|pagina|central|sac|ouvidoria|oferta|opcoes|simulacao|proxima fatura|demais parcelas|valor total)/.test(n);
 const dated=/^\s*(?:\d{4}-\d{2}-\d{2}|\d{1,2}[\/.-]\d{2}|\d{1,2}\s+[a-zç]{3})(?:\b|\s)/i.test(line);
 const monetary=/^\s*(?:R\$\s*)?-?[\d.,]+[,.]\d{2}\s*[DC-]?\s*$/i.test(line)||/(?:R\$|[\d.]+,\d{2})\s*[DC-]?\s*$/i.test(line);
 const excluded=/oferta|resumo não virou|item em seção/.test(issue);
 if(!obviousInfo&&!excluded&&(dated||monetary))exceptions.push({line:index+1,source:line,reason:issue,resolved:false});else {informational++;informationalLines.add(index);}
 }
 // Itaú coverage is a review obligation, even for candidates previously grouped as information.
 if(result.sourceAccounting){
  const recognized=new Set(result.sourceAccounting.recognized),summary=new Set(result.sourceAccounting.summary),reviewed=new Set(exceptions.map(e=>e.line-1));
  lines.forEach((line,i)=>{if(recognized.has(i)||summary.has(i)||reviewed.has(i))return;
   if(!/^\s*(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2})\b/.test(line)&&!/[\d.]+,\d{2}\s*[DC-]?\s*$/i.test(line))return;
   const reason='Linha '+(i+1)+': candidato financeiro fora do reconhecimento; revisar seção, tipo e valor, inclusive ofertas e resumos. Nenhum lançamento criado.';
   exceptions.push({line:i+1,source:line,reason,resolved:false});reviewed.add(i);if(informationalLines.has(i)){informational--;informationalLines.delete(i);}
  });
 }
 const issues=[...exceptions.map(e=>e.reason),...retained];if(informational)issues.push(informational+' linhas informativas ou excluídas agrupadas; confira o documento (inclui ofertas quando presentes).');
 const {sourceAccounting,...clean}=result;
 const diagnostics={exceptions,informational,unresolved:exceptions.length};
 if(sourceAccounting){
  const recognized=new Set(sourceAccounting.recognized),summary=new Set(sourceAccounting.summary),reviewed=new Set(exceptions.map(e=>e.line-1));
  const coverage={financialCandidateLines:0,recognizedSourceLines:0,exceptionSourceLines:0,summarySourceLines:0,financialLinesOutsideReview:0};
  lines.forEach((line,i)=>{if(!/^\s*(?:\d{4}-\d{2}-\d{2}|\d{2}\/\d{2})\b/.test(line)&&!/[\d.]+,\d{2}\s*[DC-]?\s*$/i.test(line))return;coverage.financialCandidateLines++;if(recognized.has(i))coverage.recognizedSourceLines++;else if(reviewed.has(i))coverage.exceptionSourceLines++;else if(summary.has(i))coverage.summarySourceLines++;else coverage.financialLinesOutsideReview++;});
  diagnostics.coverage=coverage;
 }
 return {...clean,issues,diagnostics};
}
function parse(text,bank,format,options={}){const result=parseBase(text,bank,format,options);if(format!=='csv'&&result.bank!=='Itaú'&&result.reportedTotalCents==null&&!result.issues.some(s=>/conflitantes/.test(s)))result.reportedTotalCents=extractTotal(text);return format==='csv'?result:pdfDiagnostics(text,result);}
function reviewItem(fields){
 const item={date:date(fields.date),note:String(fields.note||'').trim(),kind:fields.kind,amountCents:money(fields.value)};
 if(!item.note||!['purchase','refund','bankPayment'].includes(item.kind))fail('Informe descrição e tipo válidos.');
 if(item.kind!=='purchase')item.amountCents=-Math.abs(item.amountCents);
 if(item.kind==='purchase'&&item.amountCents<0)fail('Compra não pode ter valor negativo; selecione crédito/estorno.');
 if(fields.installmentNumber!==''&&fields.installmentNumber!=null)item.installmentNumber=Number(fields.installmentNumber);
 if(fields.installmentsTotal!==''&&fields.installmentsTotal!=null)item.installmentsTotal=Number(fields.installmentsTotal);
 validateInstallments(item);return item;
}
function make(dateValue,note,value){const label=normalize(note);const kind=/^pagamento(?: recebido| efetuado| de fatura| da fatura)?(?:\s|$)/.test(label)?'bankPayment':/^(?:estorno|credito)(?:\s|$)/.test(label)||value<0?'refund':'purchase';return {date:dateValue,note,amountCents:kind==='purchase'?value:-Math.abs(value),kind,...installment(note)};}
function validateInstallments(e){const n=e.installmentNumber,t=e.installmentsTotal;if(n==null&&t==null)return;if(!Number.isInteger(n)||!Number.isInteger(t)||n<1||t<n||t>120)fail('Parcelamento inválido: use parcela e total de 1 a 120.');}
function fingerprint(e){return JSON.stringify([e.cardId,e.invoiceMonth,e.date?.slice(0,10),normalize(e.note||''),cents(e),e.installmentNumber||null,e.installmentsTotal||null]);}
function reconcile(items,total){integer(total);const sum=items.reduce((s,e)=>integer(s+cents(e)),0);return {sum,difference:integer(total-sum),ok:sum===total};}
function validateImport(items,existing,total){if(!items.length)fail('Sem lançamentos.');items.forEach(e=>{date(e.date);month(e.invoiceMonth);cents(e);validateInstallments(e);if(!e.note?.trim()||!e.cardId)fail('Compra incompleta.');});if(!reconcile(items,total).ok)fail('Total não conciliado.');
 const old=new Set(existing.map(fingerprint)),seen=new Set();for(const e of items){const key=fingerprint(e);if(old.has(key)||seen.has(key))fail('Possível duplicidade. Revise as compras coincidentes antes de importar.');seen.add(key);}return items;}
function project(expenses,start,horizon){
 month(start);if(![3,6,12,24].includes(horizon))fail('Horizonte inválido.');const out=Array.from({length:horizon},(_,i)=>({month:addMonth(start,i),confirmed:0,estimated:0,items:[]}));
 const actual=new Set(expenses.filter(e=>e.groupId).map(e=>`${e.groupId}|${e.invoiceMonth||e.date.slice(0,7)}`));
 const baseOf=e=>e.invoiceMonth||e.date.slice(0,7);
 const anchors=new Map();for(const e of expenses){if(!e.groupId||e.kind==='bankPayment'||e.kind==='refund')continue;for(const target of out){if(baseOf(e)>=target.month)continue;const key=e.groupId+'|'+target.month,prior=anchors.get(key);if(!prior||baseOf(prior)<baseOf(e))anchors.set(key,e);}}
 for(const e of expenses){const base=e.invoiceMonth||e.date.slice(0,7);const direct=out.find(r=>r.month===base);if(direct&&e.kind!=='bankPayment'){direct.confirmed=integer(direct.confirmed+cents(e));direct.items.push({...e,estimated:false});}
 if(e.kind==='bankPayment'||e.kind==='refund')continue;
 const remaining=e.installmentsTotal&&e.installmentNumber?e.installmentsTotal-e.installmentNumber:0;
 for(const target of out){const m=target.month;const n=(Number(m.slice(0,4))-Number(base.slice(0,4)))*12+Number(m.slice(5))-Number(base.slice(5));if(n<=0||(!e.recurring&&n>remaining))continue;if(actual.has(`${e.groupId}|${m}`))continue;if(e.groupId&&anchors.get(e.groupId+'|'+m)!==e)continue;const row=out.find(r=>r.month===m);if(row){row.estimated=integer(row.estimated+cents(e));row.items.push({...e,invoiceMonth:m,estimated:true,installmentNumber:remaining?e.installmentNumber+n:null});}}
 }return out;
}
function validateGroup(rows){
 if(rows.length<2||rows.some(e=>!e.installmentNumber||!e.cardId||cents(e)<=0||e.kind==='refund'||e.kind==='bankPayment')||new Set(rows.map(e=>e.cardId)).size!==1||new Set(rows.map(e=>e.installmentsTotal)).size!==1||new Set(rows.map(cents)).size!==1||new Set(rows.map(e=>e.installmentNumber)).size!==rows.length)fail('Selecione parcelas distintas do mesmo cartão, valor e total.');
 const first=rows[0];for(const e of rows)if(addMonth(first.invoiceMonth||first.date.slice(0,7),e.installmentNumber-first.installmentNumber)!==(e.invoiceMonth||e.date.slice(0,7)))fail('Meses e sequência das parcelas não conferem.');return true;
}
function groupMembers(expenses,ids){const selected=expenses.filter(e=>ids.includes(e.id));if(selected.length!==ids.length)fail('Seleção de parcelas inválida.');const groups=[...new Set(selected.map(e=>e.groupId).filter(Boolean))];if(groups.length>1)fail('Não associe grupos já distintos sem revisar o histórico.');const rows=groups.length?expenses.filter(e=>e.groupId===groups[0]||ids.includes(e.id)):selected;validateGroup(rows);return rows;}
function allocations(expense,events,allExpenses=[]){const effective=e=>e.effectiveMonth||(()=>{const source=allExpenses.find(x=>x.id===e.expenseId);return source?(source.invoiceMonth||source.date.slice(0,7)):null;})();const relevant=events.filter(e=>e.type==='allocation'&&(e.expenseId===expense.id||(expense.groupId&&e.groupId===expense.groupId&&e.propagate&&effective(e)&&(expense.invoiceMonth||expense.date.slice(0,7))>=effective(e))));return relevant.sort((a,b)=>(a.sequence||0)-(b.sequence||0)||String(a.createdAt||'').localeCompare(b.createdAt||'')).at(-1)?.parts||[];}
function statement(personId,m,expenses,events){month(m);const lines=[];for(const e of expenses){if((e.invoiceMonth||e.date.slice(0,7))!==m||e.kind==='bankPayment')continue;const part=allocations(e,events,expenses).find(p=>p.personId===personId);if(part)lines.push({date:e.date.slice(0,10),note:e.note,amountCents:part.amountCents});}
 const total=lines.reduce((s,e)=>integer(s+e.amountCents),0),payments=events.filter(e=>e.type==='familyPayment'&&e.personId===personId&&e.month===m);const paid=payments.reduce((s,e)=>integer(s+e.amountCents),0);return {personId,month:m,lines,total,paid,pending:integer(total-paid),payments};}
function csvCell(v){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function validBytes(value,min,max){return Array.isArray(value)&&value.length>=min&&value.length<=max&&value.every(v=>Number.isInteger(v)&&v>=0&&v<=255);}
async function key(password,salt,usage){if(!globalThis.crypto?.subtle)fail('Criptografia indisponível. Use navegador compatível e HTTPS.');if(password.length<12)fail('Use uma senha com pelo menos 12 caracteres.');const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);}
async function encrypt(data,password){if(!globalThis.crypto?.subtle)fail('Criptografia indisponível. Use navegador compatível e HTTPS.');const payload=new TextEncoder().encode(JSON.stringify(data));if(payload.byteLength>10*1024*1024)fail('Backup excede 10 MB de dados serializados. Preserve os anexos originais e revise o tamanho antes de exportar.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await key(password,salt,'encrypt');const body=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,payload);return {format:'fatura-backup-v1',salt:[...salt],iv:[...iv],body:[...new Uint8Array(body)]};}
async function decrypt(envelope,password){if(!envelope||envelope.format!=='fatura-backup-v1'||!validBytes(envelope.salt,16,16)||!validBytes(envelope.iv,12,12)||!validBytes(envelope.body,16,16*1024*1024))fail('Backup inválido.');const k=await key(password,new Uint8Array(envelope.salt),'decrypt');const body=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(envelope.iv)},k,new Uint8Array(envelope.body));return JSON.parse(new TextDecoder().decode(body));}
const api={reviewItem,money,cents,month,date,addMonth,split,validateGroup,groupMembers,csvRows,adapters,canonicalBank,detectBank,extractTotal,parse,installment,validateInstallments,fingerprint,reconcile,validateImport,project,allocations,statement,csvCell,encrypt,decrypt};
if(typeof module!=='undefined')module.exports=api;else root.Fatura=api;
})(globalThis);
