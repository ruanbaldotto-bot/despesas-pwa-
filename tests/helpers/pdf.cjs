// Produz um PDF tabular sintético em memória. Nenhum dado/documento real.
function pdf(lines){
 if(typeof lines==='string')lines=lines.split(/\r?\n/);
 const escape=s=>s.replace(/[()\\]/g,'\\$&');
 const content='BT /F1 12 Tf 30 740 Td 16 TL '+lines.map((line,i)=>(i?'T* ':'')+'('+escape(line)+') Tj').join('\n')+' ET';
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',`<< /Length ${Buffer.byteLength(content,'latin1')} >>\nstream\n${content}\nendstream`];
 let out='%PDF-1.4\n',offsets=[0];for(let n=0;n<objects.length;n++){offsets.push(Buffer.byteLength(out,'latin1'));out+=`${n+1} 0 obj\n${objects[n]}\nendobj\n`;}
 const xref=Buffer.byteLength(out,'latin1');out+=`xref\n0 6\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(out,'latin1');
}
module.exports={pdf};
