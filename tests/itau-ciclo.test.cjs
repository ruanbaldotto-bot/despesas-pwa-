const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const F=require('../core.js');
const parse=s=>F.parse(s,'Itaú','pdf');
const fixture=()=>fs.readFileSync('tests/fixtures/bancos/itau-ciclo-sintetico.txt','utf8');
test('Itaú: período explícito resolve virada de ano, parcelas, créditos e pagamentos em centavos',()=>{
 const r=parse(fixture());assert.equal(r.items.length,4);assert.equal(r.diagnostics.exceptions.length,1);assert.equal(r.reportedTotalCents,13015);assert.equal(F.reconcile(r.items,r.reportedTotalCents).ok,true);
 assert.deepEqual(r.items.map(e=>e.date),['2030-12-20','2031-01-02','2031-01-05','2031-01-07']);assert.deepEqual(r.items.map(e=>e.amountCents),[10005,5010,-500,-1500]);assert.equal(r.items[0].installmentNumber,3);assert.equal(r.items[1].installmentNumber,8);assert.equal(r.items[2].kind,'refund');assert.equal(r.items[3].kind,'bankPayment');
 const projection=F.project(r.items.map((e,i)=>({...e,id:i+1,cardId:1,invoiceMonth:'2031-01'})),'2031-01',12);assert.equal(projection[1].estimated,15015);assert.equal(projection[5].estimated,10005);assert.equal(projection[8].estimated,0);assert.equal(r.diagnostics.coverage.financialLinesOutsideReview,0); // financing offer explicitly held for review, never a purchase
});
test('Itaú: vencimento e competência isolados nunca fornecem o ano da compra',()=>{
 for(const prefix of ['Vencimento: 25/01/2031','Competência: 01/2031','Período de lançamentos: 16/12/2030 a 15/01/2031\nPeríodo de lançamentos: 16/12/2029 a 15/01/2030']){const r=parse(prefix+'\nLançamentos\n02/01 LOJA FICTICIA 03/10 10,00');assert.equal(r.items.length,0);assert.equal(r.diagnostics.exceptions.length,1);}
});
test('Itaú: datas fora do ciclo, colunas mescladas e data adicional permanecem exceções',()=>{
 const r=parse('Período de lançamentos: 01/01/2031 a 31/01/2031\nLançamentos\n02/12 LOJA FICTICIA 10,00\n02/01 LOJA FICTICIA 10,00 03/01 OUTRA FICTICIA 20,00\n02/01 EVENTO EM 03/10 10,00');assert.equal(r.items.length,0);assert.equal(r.diagnostics.exceptions.length,3);
});
test('Itaú: reconstrução limitada conserva fontes e não cruza cabeçalhos ou totais',()=>{
 const r=parse('Período de lançamentos: 01/01/2031 a 31/01/2031\nLançamentos\n02/01\nLOJA FICTICIA 03/10\n10,00\n03/01 OUTRA LOJA\n20,00\n04/01\nTotal da fatura\n30,00');assert.equal(r.items.length,2);assert.equal(r.items[0].installmentNumber,3);assert.equal(r.reportedTotalCents,3000);assert.equal(r.diagnostics.exceptions.length,1);assert.equal(r.diagnostics.coverage.financialLinesOutsideReview,0);assert.ok(!('sourceAccounting' in r));
});
test('Itaú: total em resumo ou célula seguinte é reconhecido; oferta, limite e conflito não conciliam',()=>{
 assert.equal(parse('Resumo da fatura\nTotal desta fatura (R$)\n35,19').reportedTotalCents,3519);
 assert.equal(parse('Opções de parcelamento\nTotal da fatura: 35,19').reportedTotalCents,null);
 assert.equal(parse('Limite disponível 35,19').reportedTotalCents,null);
 assert.equal(parse('Total desta fatura: 35,19\nTotal da fatura: 36,19').reportedTotalCents,null);
 assert.equal(parse('Total da fatura: 35,19 20,00').reportedTotalCents,null);
});
test('Itaú: parcela inválida não é descartada; crédito com sufixo não projeta compras',()=>{
 const r=parse('Lançamentos\n01/01/2031 LOJA FICTICIA 13/12 10,00\n02/01/2031 ESTORNO FICTICIO 03/10 5,00 C');assert.equal(r.diagnostics.exceptions.length,1);assert.equal(r.items.length,1);assert.equal(r.items[0].installmentNumber,undefined);assert.equal(F.project(r.items.map(e=>({...e,invoiceMonth:'2031-01'})),'2031-01',3)[1].estimated,0);
});
test('Itaú: conciliação não substitui verificação de duplicidades',()=>{
 const r=parse('Lançamentos\n01/01/2031 LOJA FICTICIA 10,00\n01/01/2031 LOJA FICTICIA 10,00\nTotal da fatura: 20,00');assert.equal(F.reconcile(r.items,2000).ok,true);assert.throws(()=>F.validateImport(r.items.map(e=>({...e,cardId:1,invoiceMonth:'2031-01'})),[],2000),/duplicidade/);
});

test('Itaú: auditor protegido integra ciclo e parcelas sem expor conteúdo ou senha',async()=>{
 const os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{encryptedPDF}=require('./helpers/encrypted-pdf.cjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'jabu-itau-')),file=path.join(dir,'sintetico.pdf'),password=crypto.randomUUID();
 fs.writeFileSync(file,encryptedPDF(['ITAU SINTETICO','Periodo de lancamentos: 01/01/2031 a 31/01/2031','Lancamentos','02/01 LOJA_SENTINELA 03/10 10,00','Total desta fatura (R$): 10,00'],password));
 try{const {audit}=require('../tools/auditar-faturas-locais.cjs');assert.equal((await audit('Itaú',file)).status,'senha local necessária');const r=await audit('Itaú',file,password);assert.equal(r.transactions,1);assert.equal(r.exceptions,0);assert.equal(r.reconciliation,'exata');assert.equal(r.installmentPurchases,1);assert.equal(r.coverage.financialLinesOutsideReview,0);for(const secret of [password,file,'SENTINELA','10,00','2031'])assert.ok(!JSON.stringify(r).includes(secret));}
 finally{if(path.dirname(path.resolve(dir))===path.resolve(os.tmpdir())&&path.basename(dir).startsWith('jabu-itau-'))fs.rmSync(dir,{recursive:true,force:true});}
});
