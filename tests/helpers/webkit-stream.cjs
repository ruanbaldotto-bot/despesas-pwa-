const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
(async()=>{
 delete ReadableStream.prototype[Symbol.asyncIterator];
 assert.equal(typeof ReadableStream.prototype[Symbol.asyncIterator],'undefined');
 const {pdf}=require('./pdf.cjs'),{encryptedPDF}=require('./encrypted-pdf.cjs'),F=require('../../core.js');
 const bytes=pdf(fs.readFileSync('tests/fixtures/bancos/itau.txt','utf8'));
 const pdfjs=await import('../../vendor/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('../../vendor/pdf.worker.mjs',require('node:url').pathToFileURL(__filename)).href;
 const task=pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false});
 try{const doc=await task.promise,page=await doc.getPage(1);await assert.rejects(page.getTextContent(),e=>e instanceof TypeError&&/readableStream/.test(e.message));}finally{await task.destroy();}
 const {readPDF}=await import('../../pdf-reader.mjs'),file={arrayBuffer:async()=>new Uint8Array(bytes).buffer};
 const text=await readPDF(file),result=F.parse(text,'Itaú','pdf');assert.equal(result.items.length,3);assert.equal(F.reconcile(result.items,6550).ok,true);
 const password=crypto.randomUUID(),encrypted=encryptedPDF(['ITAU FATURA SINTETICA','01/10/2031 LOJA SINTETICA 02/05 12,34'],password),protectedFile={arrayBuffer:async()=>new Uint8Array(encrypted).buffer};
 await assert.rejects(readPDF(protectedFile),/senha temporária/);await assert.rejects(readPDF(protectedFile,{password:crypto.randomUUID()}),/senha temporária/);const options={password};const protectedText=await readPDF(protectedFile,options);assert.equal(options.password,undefined);assert.equal(F.parse(protectedText,'Itaú','pdf').items[0].amountCents,1234);
 const LocalFiles=require('../../file-reader.js'),csvBytes=fs.readFileSync('tests/fixtures/bancos/itau.csv');const csv=await LocalFiles.readText({arrayBuffer:async()=>new Uint8Array(csvBytes).buffer,text:()=>{throw Error('File.text não deve ser usado');},stream:()=>{throw Error('Blob.stream não deve ser usado');}});assert.equal(F.reconcile(F.parse(csv,'Itaú','csv').items,6550).ok,true);assert.equal(typeof ReadableStream.prototype[Symbol.asyncIterator],'undefined');
 console.log('Reprodução original confirmada; PDF, senha e CSV corrigidos sem iterador assíncrono.');
})().catch(()=>{console.error('Falha no cenário sintético de regressão WebKit.');process.exitCode=1;});
