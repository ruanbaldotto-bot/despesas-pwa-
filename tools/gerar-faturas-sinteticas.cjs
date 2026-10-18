const fs=require('node:fs'),path=require('node:path');const {pdf}=require('../tests/helpers/pdf.cjs');
const output=path.join('demo','faturas-sinteticas');fs.mkdirSync(output,{recursive:true});
for(const name of ['santander','porto','mercado-pago','nubank','itau','bradesco']){
 fs.copyFileSync(path.join('tests','fixtures','bancos',name+'.csv'),path.join(output,name+'.csv'));
 fs.writeFileSync(path.join(output,name+'.pdf'),pdf(fs.readFileSync(path.join('tests','fixtures','bancos',name+'.txt'),'utf8')));
}
console.log('Doze arquivos sintéticos gerados em demo/faturas-sinteticas.');
