// Local-only audit. Never prints document text, amounts, passwords or source paths.
const fs=require('node:fs'),path=require('node:path');
async function audit(bank,file,password,options={}){
 const engine=require('./audit-engine.cjs').engineInfo();if(!engine.coreSynced||!engine.clientSynced||!engine.importsLocal)return {engine,status:'código gerado divergente; sincronizar antes de auditar'};
 const F=require('../core.js');if(!F.adapters[bank])throw Error('Banco não suportado.');const ext=path.extname(file).toLowerCase();if(!['.pdf','.csv'].includes(ext))throw Error('Formato não suportado.');const result={engine,bank,format:ext.slice(1),status:'pendente',transactions:0,exceptions:0,reconciliation:'não disponível',future:'não verificada'};
 const output={log:console.log,warn:console.warn,error:console.error};console.log=console.warn=console.error=()=>{};
 const oldFetch=global.fetch;global.fetch=async()=>{throw Error('Rede bloqueada durante auditoria local.');};
 try{
 const probe=ext==='.pdf'&&bank==='Itaú'?require('./pdf-layout-audit.cjs').createLayoutProbe():null;
 const bytes=fs.readFileSync(file);if(bytes.length>20*1024*1024)throw Error('Limite');
 const text=ext==='.csv'?bytes.toString('utf8'):await (await import('../pdf-reader.mjs')).readPDF({size:bytes.length,arrayBuffer:async()=>new Uint8Array(bytes).buffer},{password,bank,onPage:probe?items=>probe.addPage(items):undefined});
 if(probe)result.layout=probe.result(F,bank);
 const lines=text.split(/\r?\n/).filter(l=>l.trim());
 result.structure={lines:lines.length,fullDateStart:lines.filter(l=>/^\s*(?:\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/.test(l)).length,shortDateStart:lines.filter(l=>/^\s*\d{2}\/\d{2}(?!\/\d{4})\b/.test(l)).length,dateOnly:lines.filter(l=>/^\s*\d{2}\/\d{2}(?:\/\d{4})?\s*$/.test(l)).length,amountOnly:lines.filter(l=>/^\s*(?:r\$\s*)?-?[\d.]+,\d{2}\s*$/i.test(l)).length,multipleDates:lines.filter(l=>(l.match(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g)||[]).length>1).length};
 if(bank==='Itaú'&&ext==='.pdf')result.itauStructure=require('./estrutura-itau.cjs').structure(text);
 if(options.reviewPeriod){const base=F.parse(text,bank,result.format);result.withoutConfirmedPeriod={transactions:base.items.length,exceptions:base.diagnostics?.exceptions?.length||0,totalRecognized:base.reportedTotalCents!=null,installmentPurchases:base.items.filter(e=>e.kind==='purchase'&&e.installmentNumber).length,financialLinesOutsideReview:base.diagnostics?.coverage?.financialLinesOutsideReview??null};}
 const parsed=F.parse(text,bank,result.format,options);result.transactions=parsed.items.length;result.reviewReasons=require('./estrutura-itau.cjs').reviewReasons(parsed.diagnostics?.exceptions||[]);result.dateContext=parsed.metadata?.dateContext||'não aplicável';if(parsed.diagnostics?.coverage)result.coverage=parsed.diagnostics.coverage;result.installmentPurchases=parsed.items.filter(e=>e.kind==='purchase'&&e.installmentNumber).length;result.exceptions=parsed.diagnostics?.exceptions?.length??parsed.issues.length;result.informational=parsed.diagnostics?.informational||0;result.reconciliation=parsed.reportedTotalCents==null?'total não reconhecido':F.reconcile(parsed.items,parsed.reportedTotalCents).ok?'exata':'divergente';result.future=parsed.items.some(e=>e.installmentNumber)?'parcelas identificadas; revisar cobertura':'nenhuma parcela identificada';result.previousPaymentsRecognized=parsed.metadata?.previousPaymentsCents!=null;
 result.futureSummary={recognizedFields:Object.keys(parsed.metadata?.future||{}).length,arithmetic:parsed.metadata?.futureCheck||'não reconhecido'};
 const f=parsed.metadata?.future,purchases=parsed.items.filter(e=>e.kind==='purchase'&&e.installmentNumber&&e.installmentNumber<e.installmentsTotal);
 if(f&&f.nextCents!=null&&f.totalCents!=null){const next=purchases.reduce((s,e)=>s+BigInt(e.amountCents),0n),remaining=purchases.reduce((s,e)=>s+BigInt(e.amountCents)*BigInt(e.installmentsTotal-e.installmentNumber),0n);result.futureProjectionCheck=next===BigInt(f.nextCents)&&remaining===BigInt(f.totalCents)?(result.exceptions?'valores coincidem; cobertura pendente':'exata'):'divergente ou cobertura incompleta';}else result.futureProjectionCheck='referências insuficientes';
 if(options.referenceTotals){const actual={current:parsed.reportedTotalCents,previousPayment:parsed.metadata?.previousPaymentsCents,next:f?.nextCents,remaining:f?.remainingCents,future:f?.totalCents};result.referenceComparison={};for(const key of ['current','previousPayment','next','remaining','future'])if(options.referenceTotals[key]!=null)result.referenceComparison[key]=actual[key]==null?'não reconhecido':actual[key]===F.money(options.referenceTotals[key])?'confere':'diverge';}
 result.status=result.exceptions===0&&!(result.coverage?.financialLinesOutsideReview)&&result.reconciliation==='exata'&&(!f||result.futureProjectionCheck==='exata')&&parsed.metadata?.futureCheck!=='divergente'&&parsed.metadata?.previousPaymentsCheck!=='divergente'&&!Object.values(result.referenceComparison||{}).some(v=>v!=='confere')?'conciliação automática; revisão humana pendente':'revisão necessária';return result;
 }catch(e){result.status=/senha|PasswordException/i.test(e.message+' '+e.name)?'senha local necessária':'leitura ou estrutura não suportada';return result;
 }finally{global.fetch=oldFetch;Object.assign(console,output);}
}
if(require.main===module){(async()=>{
 const args=process.argv.slice(2),engine=require('./audit-engine.cjs').engineInfo();
 if(args.length===1&&args[0]==='--engine-info'){process.stdout.write(JSON.stringify(engine)+'\n');return;}
 const pairs=[];let expected,passwordStdin=false,privateInput=false;
 for(let i=0;i<args.length;i++){if(args[i]==='--private-input-stdin')privateInput=true;else if(args[i]==='--password-stdin')passwordStdin=true;else if(args[i]==='--expected-engine')expected=args[++i];else pairs.push(args[i]);}
 if(!engine.coreSynced||!engine.clientSynced||!engine.importsLocal||expected&&expected!==engine.codeHash)throw Error('Motor divergente');
 const input=privateInput?JSON.parse(fs.readFileSync(0,'utf8')):null;const secret=input?input.password:passwordStdin?fs.readFileSync(0,'utf8').trimEnd():undefined,results=[];
 for(let i=0;i<pairs.length;i+=2){if(!pairs[i+1])throw Error('Argumentos');results.push(await audit(pairs[i],pairs[i+1],secret,{...(input?.reviewPeriod?{reviewPeriod:input.reviewPeriod}:{}),...(input?.referenceTotals?{referenceTotals:input.referenceTotals}:{})}));}
 process.stdout.write(JSON.stringify(results,null,2)+'\n');
})().catch(()=>{process.stderr.write('Auditoria local não concluída; confira a versão e a sincronização do motor. Nenhum conteúdo foi registrado.\n');process.exitCode=1;});}module.exports={audit};
