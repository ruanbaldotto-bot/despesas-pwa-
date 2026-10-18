const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const F=require('../core.js');
const cell=(str,x,y,width=40)=>({str,transform:[10,0,0,10,x,y],width});
test('motor identifica fontes sincronizadas e resolve imports independentemente da pasta corrente',()=>{
 const auditor=path.resolve('tools/auditar-faturas-locais.cjs'),result=cp.spawnSync(process.execPath,[auditor,'--engine-info'],{cwd:os.tmpdir(),encoding:'utf8'});assert.equal(result.status,0);const info=JSON.parse(result.stdout);assert.equal(info.version,'jabu-audit-5');assert.match(info.codeHash,/^[a-f0-9]{64}$/);assert.equal(info.coreSynced,true);assert.equal(info.clientSynced,true);assert.equal(info.importsLocal,true);assert.ok(!result.stdout.includes(process.cwd()));
 const blocked=cp.spawnSync(process.execPath,[auditor,'Itaú','DOCUMENTO_SENTINELA.pdf','--expected-engine','desatualizado'],{cwd:os.tmpdir(),encoding:'utf8'});assert.notEqual(blocked.status,0);assert.ok(!blocked.stderr.includes('DOCUMENTO_SENTINELA'));assert.equal(blocked.stdout,'');
});
test('fingerprint muda quando dependência muda e recusa core gerado divergente',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jabu-engine-'));
 const files=['tools/audit-engine.cjs','tools/auditar-faturas-locais.cjs','tools/auditar-fatura-protegida.ps1','tools/estrutura-itau.cjs','tools/pdf-layout-audit.cjs','Core.gs','core.js','CoreClient.html','pdf-reader.mjs','file-reader.js','vendor/pdf.mjs','vendor/pdf.worker.mjs'];
 try{for(const file of files){const dest=path.join(dir,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(file,dest);}
 const info=()=>JSON.parse(cp.execFileSync(process.execPath,[path.join(dir,'tools/auditar-faturas-locais.cjs'),'--engine-info'],{encoding:'utf8'}));
 const original=info();assert.equal(original.coreSynced,true);fs.appendFileSync(path.join(dir,'pdf-reader.mjs'),'\n// synthetic dependency change\n');assert.notEqual(info().codeHash,original.codeHash);
 fs.appendFileSync(path.join(dir,'core.js'),'\n// synthetic stale generated copy\n');assert.equal(info().coreSynced,false);const blocked=cp.spawnSync(process.execPath,[path.join(dir,'tools/auditar-faturas-locais.cjs'),'Itaú','DO_NOT_READ.pdf'],{encoding:'utf8'});assert.notEqual(blocked.status,0);assert.equal(blocked.stdout,'');
 }finally{if(path.dirname(path.resolve(dir))===path.resolve(os.tmpdir())&&path.basename(dir).startsWith('jabu-engine-'))fs.rmSync(dir,{recursive:true,force:true});}
});
test('Itaú encaminha 17 candidatos antes excluídos para revisão sem criar compras',()=>{
 const lines=Array.from({length:17},(_,i)=>'Limite informativo sintético '+(i+1)+',00');const r=F.parse('Lançamentos\n01/01/2031 LOJA FICTICIA 1,00\n'+lines.join('\n'),'Itaú','pdf');assert.equal(r.items.length,1);assert.equal(r.diagnostics.exceptions.length,17);assert.equal(r.diagnostics.coverage.financialLinesOutsideReview,0);assert.equal(r.diagnostics.coverage.exceptionSourceLines,17);assert.equal(r.diagnostics.coverage.financialCandidateLines,18);assert.equal(r.diagnostics.informational,0);assert.ok(r.diagnostics.exceptions.every(e=>!e.resolved));
});
test('diagnóstico posicional distingue sufixo parcelado de duas colunas candidatas sem emitir texto',()=>{
 const {createLayoutProbe}=require('../tools/pdf-layout-audit.cjs'),probe=createLayoutProbe();
 probe.addPage([cell('01/01/2031',10,700,60),cell('LOJA_SENTINELA 03/10',90,700,110),cell('10,00',220,700,30),cell('02/01/2031',400,700,60),cell('OUTRA_SENTINELA',480,700,90),cell('20,00',600,700,30)]);
 const r=probe.result(F,'Itaú');assert.equal(r.metrics.multiDateRows,1);assert.equal(r.metrics.dateCellsAfterAmount,1);assert.equal(r.metrics.splitCandidateRows,1);assert.equal(r.columnCandidate.transactions,2);assert.equal(r.columnCandidate.installmentPurchases,1);for(const secret of ['SENTINELA','10,00','2031','03/10'])assert.ok(!JSON.stringify(r).includes(secret));
});
test('diagnóstico conserva colunas sem evidência de separação e detecta ordem e total misturados',()=>{
 const {createLayoutProbe}=require('../tools/pdf-layout-audit.cjs'),probe=createLayoutProbe();probe.addPage([cell('20,00',200,700),cell('Total da fatura',10,700,100),cell('35,19',140,700),cell('OUTRA COLUNA SENTINELA',300,700)]);const r=probe.result(F,'Itaú');assert.equal(r.metrics.sourceOrderBacktracks,1);assert.equal(r.metrics.totalRowsWithMultipleAmounts,1);assert.equal(r.metrics.totalRowsWithTrailingText,1);assert.equal(r.columnCandidate.totalRecognized,false);assert.equal(r.metrics.splitCandidateRows,0);
});
test('hook local de layout funciona em PDF protegido sem mudar o texto da importação normal',async()=>{
 const {encryptedPDF}=require('./helpers/encrypted-pdf.cjs'),crypto=require('node:crypto'),password=crypto.randomUUID(),bytes=encryptedPDF(['ITAU SINTETICO','01/01/2031 LOJA FICTICIA 03/10 10,00'],password),file={arrayBuffer:async()=>new Uint8Array(bytes).buffer};const {readPDF}=await import('../pdf-reader.mjs');let pages=0;const inspected=await readPDF(file,{password,onPage:items=>{pages++;assert.ok(items.length>0);}});assert.equal(inspected,await readPDF(file,{password}));assert.equal(pages,1);
});
test('histograma de revisão usa apenas categorias fixas e não exporta motivo arbitrário',()=>{
 const {reviewReasons}=require('../tools/estrutura-itau.cjs');const counts=reviewReasons([{reason:'Data sem ano: teste'},{reason:'candidato financeiro fora do reconhecimento'},{reason:'CONTEUDO_SENTINELA_PRIVADO'}]);assert.equal(counts.missingDateContext,1);assert.equal(counts.financialCoverage,1);assert.equal(counts.other,1);assert.ok(!JSON.stringify(counts).includes('SENTINELA'));
});
