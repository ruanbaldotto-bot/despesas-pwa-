const {test}=require('node:test'),assert=require('node:assert/strict');
const {structure}=require('../tools/estrutura-itau.cjs');
test('diagnóstico Itaú separa candidatos a parcelas de possível sobreposição sem completar datas',()=>{
 const r=structure('01/10 LOJA_SENTINELA 02/04 35,19\n02/10 OUTRA_SENTINELA 15,10 03/10 TERCEIRA_SENTINELA 11,00\nVencimento 15/11/2031');
 assert.equal(r.shortRows,2);assert.equal(r.shortRowsWithAmount,2);assert.equal(r.amountBeforeAnotherDate,1);assert.equal(r.trailingInstallmentCandidates,1);assert.equal(r.fullDateAnchors,1);
 const output=JSON.stringify(r);for(const secret of ['SENTINELA','35,19','2031','01/10'])assert.ok(!output.includes(secret));
});
test('diagnóstico distingue total inline, na linha seguinte e sem valor adjacente',()=>{
 const r=structure('Total da fatura: 35,19\nValor total desta fatura\nR$ 35,19\nTotal a pagar\nInformação sintética\nLimite disponível 500,00');
 assert.equal(r.totalLabels,3);assert.equal(r.totalInline,1);assert.equal(r.totalNextLine,1);assert.equal(r.totalWithoutAdjacentAmount,1);
});
test('diagnóstico enumera apenas seções conhecidas e não exporta campos arbitrários',()=>{
 const r=structure('Lançamentos: compras e saques\nPagamentos e créditos\nCompras parceladas próximas faturas\nOpções de parcelamento\nResumo da fatura\nDADO_PESSOAL_SENTINELA');
 assert.deepEqual(r.sections,{transactions:1,payments:1,future:1,offers:1,summary:1});assert.ok(!JSON.stringify(r).includes('SENTINELA'));
});
