(function(root){
'use strict';
function legacy(file,method){return new Promise((resolve,reject)=>{if(typeof root.FileReader!=='function'){reject(new Error('Leitura local indisponível neste navegador.'));return;}const r=new root.FileReader();const clear=()=>{r.onload=r.onerror=r.onabort=null;};r.onload=()=>{const result=r.result;clear();resolve(result);};r.onerror=()=>{clear();reject(new Error('Não foi possível ler o arquivo local. Selecione-o novamente em Arquivos.'));};r.onabort=()=>{clear();reject(new Error('Leitura local cancelada.'));};try{r[method](file);}catch{clear();reject(new Error('Não foi possível abrir o arquivo local.'));}});}
async function readBuffer(file){if(typeof file?.arrayBuffer==='function'){try{return await file.arrayBuffer();}catch{throw new Error('Não foi possível ler o arquivo local. Selecione-o novamente em Arquivos.');}}return legacy(file,'readAsArrayBuffer');}
async function readText(file,buffer){if(typeof root.TextDecoder==='function')return new root.TextDecoder('utf-8').decode(buffer||await readBuffer(file));return legacy(file,'readAsText');}
const api={readBuffer,readText};root.LocalFiles=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
