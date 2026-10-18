'use strict';
// Exclusively packaged in the isolated synthetic homologation build.
window.HomologacaoReady=(async()=>{
 await window.JabuReady;
 if(db.name!=='jabuHomologacaoDB')throw new Error('Carga sintética recusada fora da homologação.');
 const snapshot=await Ledger.snapshot(db);
 if(!['expenses','cards','invoices','events'].some(s=>snapshot.stores[s].length)){
  const banks=['Nubank','Santander','Porto Bank','Mercado Pago','Itaú','Bradesco / Bradescard'];
  await Ledger.event(db,{type:'person',name:'Alex · fictício'});
  await Ledger.event(db,{type:'person',name:'Bia · fictícia'});
  const persons=(await Ledger.all(db,'events')).filter(e=>e.type==='person');
  for(const [n,bank] of banks.entries()){
   const cardId=await Ledger.write(db,'cards',{name:bank+' · sintético',bank,last4:String(n+1).padStart(4,'0'),shared:n%2===1,closeDay:5+n,dueDay:12+n,limitCents:500000,version:1});
   const amountCents=12500+n*3500;
   const id=await Ledger.write(db,'expenses',{date:'2031-10-02',invoiceMonth:'2031-10',note:'COMPRA FICTÍCIA '+(n+1),cardId,amountCents,amount:amountCents/100,kind:'purchase',installmentNumber:2,installmentsTotal:6,groupId:'homologacao-'+n,key:'homologacao-'+n,version:1});
   await Ledger.assign(db,[id],{percent:true,values:persons.map(p=>({personId:p.id,value:5000}))});
  }
  await Ledger.event(db,{type:'familyPayment',personId:persons[0].id,month:'2031-10',amountCents:10000});
 }
 document.getElementById('syntheticFiles')?.remove();const help=document.createElement('details');help.id='syntheticFiles';help.className='card';const title=document.createElement('summary');title.textContent='Arquivos fictícios para testar importação';help.append(title);
 for(const name of ['santander','porto','mercado-pago','nubank','itau','bradesco']){const row=document.createElement('p');row.textContent=name+' · ';for(const ext of ['csv','pdf']){const a=document.createElement('a');a.href='faturas-sinteticas/'+name+'.'+ext;a.download=name+'-sintetico.'+ext;a.textContent=ext.toUpperCase();a.style.marginRight='16px';row.append(a);}help.append(row);}document.getElementById('importacao').append(help);
 const assistedExample=document.createElement('button');assistedExample.id='syntheticAssistedReview';assistedExample.type='button';assistedExample.textContent='Abrir revisão assistida fictícia (sem salvar)';
 assistedExample.onclick=safe(async()=>{
  if(db.name!=='jabuHomologacaoDB')throw new Error('Exemplo disponível somente na homologação isolada.');
  const card=(await listCards()).find(c=>c.bank==='Itaú'&&!c.archived);if(!card)throw new Error('Cadastre um cartão fictício Itaú para o exemplo.');
  const text="Itaú — FATURA EXCLUSIVAMENTE SINTÉTICA PARA REVISÃO ASSISTIDA\nPagamentos efetuados\n20/12 PAGAMENTO EFETUADO -1,11\nLançamentos atuais\n12/12 LOJA FICTICIA 02/10 1,20\n05/01 OUTRA FICTICIA 01/04 2,30\nTotal dos lançamentos atuais 3,50\nCompras parceladas - próximas faturas\nPróxima fatura parcelada 3,50\nDemais faturas parceladas 13,00\nTotal futuro 16,50\n06/02 DETALHE FUTURO FICTICIO 02/04 2,30\nResumo da fatura\nInformação fictícia a conferir 9,90";
  const layoutSections=text.split(/\r?\n/).map(line=>/^12\/12 |^05\/01 |^Lançamentos atuais|^Total dos lançamentos atuais/.test(line)?'current':/^Próxima fatura|^Demais faturas|^Total futuro|^Compras parceladas/.test(line)?'future':/^20\/12 |^Pagamentos efetuados/.test(line)?'previousPayments':'unknown');
  pending={cardId:card.id,invoiceMonth:'2031-01',bank:'Itaú',format:'pdf',hash:'synthetic-assisted-example-v1',items:[],cardName:card.name,layoutSections};
  for(const id of ['assistFrom','assistTo','assistReason','reviewPeriodFrom','reviewPeriodTo'])document.getElementById(id).value='';document.getElementById('assistScope').value='unknown';document.getElementById('reviewPeriodConfirmed').checked=false;document.getElementById('faturaPassword').value='';
  document.getElementById('reviewSource').value=text;document.getElementById('invoiceTotal').value='';document.getElementById('reviewPeriodFields').hidden=false;document.getElementById('previewCard').style.display='block';revision();document.getElementById('importStatus').textContent='Exemplo fictício de revisão • alterações somente na prévia.';jabuNavigate('importacao');
 });help.append(assistedExample);

 document.getElementById('filterMonth').value='2031-10';
 await refreshIntelligence();await renderSmartCards();
})().catch(()=>{const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='Falha ao preparar dados sintéticos. Não use dados reais neste ambiente.';document.body.prepend(p);});
