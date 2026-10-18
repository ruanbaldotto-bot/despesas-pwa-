// Fingerprint only source/dependency code. Never hash or identify the audited document.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const files=['tools/audit-engine.cjs','tools/auditar-faturas-locais.cjs','tools/auditar-fatura-protegida.ps1','tools/estrutura-itau.cjs','tools/pdf-layout-audit.cjs','Core.gs','core.js','CoreClient.html','pdf-reader.mjs','file-reader.js','vendor/pdf.mjs','vendor/pdf.worker.mjs'];
function engineInfo(){
 const hash=crypto.createHash('sha256');
 for(const file of files){const bytes=fs.readFileSync(path.join(root,file));hash.update(file+'\0');hash.update(bytes);hash.update('\0');}
 const core=fs.readFileSync(path.join(root,'Core.gs'),'utf8');
 const coreSynced=core===fs.readFileSync(path.join(root,'core.js'),'utf8');
 const clientSynced='<script>\n'+core+'\n</script>\n'===fs.readFileSync(path.join(root,'CoreClient.html'),'utf8');
 const importsLocal=fs.realpathSync(require.resolve('../core.js'))===fs.realpathSync(path.join(root,'core.js'));
 return {version:'jabu-audit-9',codeHash:hash.digest('hex'),node:process.versions.node,platform:process.platform,coreSynced,clientSynced,importsLocal};
}
module.exports={engineInfo};
