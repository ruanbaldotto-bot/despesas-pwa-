const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function verify(out=path.resolve('dist/homologacao')){
 const read=p=>fs.readFileSync(path.join(out,p));const load=p=>{const c={self:{}};vm.runInNewContext(fs.readFileSync(p,'utf8'),c);return c.self;};const current=load(path.join(out,'assets.js')),source=load('assets.js');
 const names=['santander','porto','mercado-pago','nubank','itau','bradesco'];const expected=[...source.APP_ASSETS,'./homologacao-seed.js',...names.flatMap(n=>['csv','pdf'].map(e=>'./faturas-sinteticas/'+n+'.'+e))];
 if(JSON.stringify([...current.APP_ASSETS].sort())!==JSON.stringify(expected.sort()))throw new Error('Lista de recursos não corresponde ao pacote sintético permitido.');
 const allowed=new Set([...expected.filter(a=>a!=='./').map(a=>a.replace(/^\.\//,'')),'sw.js','assets.js','robots.txt','_headers']);
 const files=fs.readdirSync(out,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>path.relative(out,path.join(e.parentPath,e.name)).replaceAll('\\','/'));if(files.some(f=>!allowed.has(f)))throw new Error('Arquivo não permitido no pacote.');
 const hash=crypto.createHash('sha256');for(const a of current.APP_ASSETS.filter(a=>a!=='./'))hash.update(read(a));if(hash.digest('hex').slice(0,16)!==current.APP_VERSION)throw new Error('Integridade dos recursos diverge do cache.');
 if(!read('app.js').toString().includes("const DB_NAME='jabuHomologacaoDB'")||read('app.js').toString().includes("const DB_NAME='despesasDB'"))throw new Error('Banco não isolado.');
 if(!read('homologacao-seed.js').equals(fs.readFileSync('tools/homologacao-seed.js')))throw new Error('Carga inicial difere da fonte sintética.');
 const {pdf}=require('../tests/helpers/pdf.cjs');for(const n of names){if(!read('faturas-sinteticas/'+n+'.csv').equals(fs.readFileSync('tests/fixtures/bancos/'+n+'.csv'))||!read('faturas-sinteticas/'+n+'.pdf').equals(pdf(fs.readFileSync('tests/fixtures/bancos/'+n+'.txt','utf8'))))throw new Error('Exemplo difere da fixture sintética: '+n);}
 return {files:files.length,cacheIntegrity:true,isolatedDB:true,syntheticSamplesExact:true,version:current.APP_VERSION};
}
if(require.main===module){try{console.log(JSON.stringify(verify()));}catch(e){console.error(e.message);process.exitCode=1;}}module.exports={verify};
