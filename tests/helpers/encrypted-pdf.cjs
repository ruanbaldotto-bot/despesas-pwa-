// Minimal Standard Security Handler R2 fixture. Only for testing reader compatibility.
const crypto=require('node:crypto');
const padding=Buffer.from('28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a','hex');
function pad(value){const b=Buffer.from(value,'latin1').subarray(0,32);return Buffer.concat([b,padding]).subarray(0,32);}
function md5(...bytes){return crypto.createHash('md5').update(Buffer.concat(bytes)).digest();}
function rc4(key,input){const s=Array.from({length:256},(_,i)=>i);let j=0;for(let i=0;i<256;i++){j=(j+s[i]+key[i%key.length])%256;[s[i],s[j]]=[s[j],s[i]];}let i=0;j=0;return Buffer.from(input.map(byte=>{i=(i+1)%256;j=(j+s[i])%256;[s[i],s[j]]=[s[j],s[i]];return byte^s[(s[i]+s[j])%256];}));}
function encryptedPDF(lines,password){
 const fileId=crypto.randomBytes(16),permissions=Buffer.alloc(4);permissions.writeInt32LE(-4);
 const owner=rc4(md5(pad(crypto.randomUUID())).subarray(0,5),pad(password));
 const key=md5(pad(password),owner,permissions,fileId).subarray(0,5),user=rc4(key,padding);
 const stream=Buffer.from('BT /F1 12 Tf 30 740 Td 16 TL '+lines.map((line,i)=>(i?'T* ':'')+'('+line.replace(/[()\\]/g,'\\$&')+') Tj').join('\n')+' ET','latin1');
 const objectKey=md5(key,Buffer.from([5,0,0,0,0])).subarray(0,10),cipher=rc4(objectKey,stream);
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',Buffer.concat([Buffer.from(`<< /Length ${cipher.length} >>\nstream\n`),cipher,Buffer.from('\nendstream')]),`<< /Filter /Standard /V 1 /R 2 /Length 40 /O <${owner.toString('hex')}> /U <${user.toString('hex')}> /P -4 >>`];
 const chunks=[Buffer.from('%PDF-1.4\n')],offsets=[0];let length=chunks[0].length;
 objects.forEach((object,n)=>{offsets.push(length);const b=Buffer.concat([Buffer.from(`${n+1} 0 obj\n`),Buffer.isBuffer(object)?object:Buffer.from(object),Buffer.from('\nendobj\n')]);chunks.push(b);length+=b.length;});
 chunks.push(Buffer.from(`xref\n0 7\n0000000000 65535 f \n`+offsets.slice(1).map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('')+`trailer\n<< /Size 7 /Root 1 0 R /Encrypt 6 0 R /ID [<${fileId.toString('hex')}><${fileId.toString('hex')}>] >>\nstartxref\n${length}\n%%EOF`));return Buffer.concat(chunks);
}
module.exports={encryptedPDF};
