const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('vendor',{recursive:true});
for(const name of ['pdf.mjs','pdf.worker.mjs'])fs.copyFileSync('node_modules/pdfjs-dist/legacy/build/'+name,'vendor/'+name);
for(const dir of ['cmaps','standard_fonts'])fs.cpSync('node_modules/pdfjs-dist/'+dir,'vendor/'+dir,{recursive:true});
fs.copyFileSync('node_modules/pdfjs-dist/LICENSE','vendor/LICENSE.pdfjs');
const assets=['./','./index.html','./styles.css','./design-tokens.css','./core.js','./storage.js','./app.js','./intelligence.js','./jabu.js','./pdf-reader.mjs','./manifest.json',...fs.readdirSync('icons').filter(n=>/\.(png|svg)$/.test(n)).map(n=>'./icons/'+n),...fs.readdirSync('vendor',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>'./'+path.relative('.',path.join(e.parentPath,e.name)).replaceAll('\\','/'))];
const hash=require('node:crypto').createHash('sha256');for(const a of assets.filter(a=>a!=='./'))hash.update(fs.readFileSync(a));fs.writeFileSync('assets.js','self.APP_VERSION='+JSON.stringify(hash.digest('hex').slice(0,16))+';self.APP_ASSETS='+JSON.stringify(assets)+';\n');
