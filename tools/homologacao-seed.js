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
 document.getElementById('filterMonth').value='2031-10';
 await refreshIntelligence();await renderSmartCards();
})().catch(()=>{const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='Falha ao preparar dados sintéticos. Não use dados reais neste ambiente.';document.body.prepend(p);});
