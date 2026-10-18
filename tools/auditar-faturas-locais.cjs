// Local-only audit. Never prints document text, amounts, passwords or source paths.
const fs=require('node:fs'),path=require('node:path');
async function audit(bank,file,password){
 const F=require('../core.js');if(!F.adapters[bank])throw Error('Banco não suportado.');const ext=path.extname(file).toLowerCase();if(!['.pdf','.csv'].includes(ext))throw Error('Formato não suportado.');const result={bank,format:ext.slice(1),status:'pendente',transactions:0,exceptions:0,reconciliation:'não disponível',future:'não verificada'};
 const output={log:console.log,warn:console.warn,error:console.error};console.log=console.warn=console.error=()=>{};
 const oldFetch=global.fetch;global.fetch=async()=>{throw Error('Rede bloqueada durante auditoria local.');};
 try{
 const bytes=fs.readFileSync(file);if(bytes.length>20*1024*1024)throw Error('Limite');
 const text=ext==='.csv'?bytes.toString('utf8'):await (await import('../pdf-reader.mjs')).readPDF({size:bytes.length,arrayBuffer:async()=>new Uint8Array(bytes).buffer},{password});
 const lines=text.split(/\r?\n/).filter(l=>l.trim());
 result.structure={lines:lines.length,fullDateStart:lines.filter(l=>/^\s*(?:\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/.test(l)).length,shortDateStart:lines.filter(l=>/^\s*\d{2}\/\d{2}(?!\/\d{4})\b/.test(l)).length,dateOnly:lines.filter(l=>/^\s*\d{2}\/\d{2}(?:\/\d{4})?\s*$/.test(l)).length,amountOnly:lines.filter(l=>/^\s*(?:r\$\s*)?-?[\d.]+,\d{2}\s*$/i.test(l)).length,multipleDates:lines.filter(l=>(l.match(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g)||[]).length>1).length};
 if(bank==='Itaú'&&ext==='.pdf')result.itauStructure=require('./estrutura-itau.cjs').structure(text);
 const parsed=F.parse(text,bank,result.format);result.transactions=parsed.items.length;result.exceptions=parsed.diagnostics?.exceptions?.length??parsed.issues.length;result.informational=parsed.diagnostics?.informational||0;result.reconciliation=parsed.reportedTotalCents==null?'total não reconhecido':F.reconcile(parsed.items,parsed.reportedTotalCents).ok?'exata':'divergente';result.future=parsed.items.some(e=>e.installmentNumber)?'parcelas identificadas; revisar cobertura':'nenhuma parcela identificada';result.status=result.exceptions===0&&result.reconciliation==='exata'?'conciliação automática; revisão humana pendente':'revisão necessária';return result;
 }catch(e){result.status=/senha|PasswordException/i.test(e.message+' '+e.name)?'senha local necessária':'leitura ou estrutura não suportada';return result;
 }finally{global.fetch=oldFetch;Object.assign(console,output);}
}
if(require.main===module){(async()=>{const args=process.argv.slice(2),secret=args.includes('--password-stdin')?fs.readFileSync(0,'utf8').trimEnd():undefined;const pairs=args.filter(a=>a!=='--password-stdin');const results=[];for(let i=0;i<pairs.length;i+=2){if(!pairs[i+1])throw Error('Informe pares banco e caminho autorizado.');results.push(await audit(pairs[i],pairs[i+1],secret));}process.stdout.write(JSON.stringify(results,null,2)+'\n');})().catch(()=>{process.stderr.write('Auditoria local não concluída; nenhum conteúdo foi registrado.\n');process.exitCode=1;});}module.exports={audit};
