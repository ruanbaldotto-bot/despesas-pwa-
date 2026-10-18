const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function build(){
 require('./build-demo.cjs');
 const out=path.resolve('dist/homologacao');if(fs.existsSync(out))throw new Error('Destino já existe. Preserve ou renomeie dist/homologacao antes de gerar novamente.');
 fs.mkdirSync(out,{recursive:true});
 // Explicit source allowlist: never copies repository, docs, attachments or browser storage.
 const files=['index.html','app.js','core.js','storage.js','intelligence.js','jabu.js','pdf-reader.mjs','styles.css','design-tokens.css','manifest.json','sw.js','assets.js'];
 for(const f of files)fs.copyFileSync(path.join('demo',f),path.join(out,f));
 for(const d of ['icons','vendor','faturas-sinteticas'])fs.cpSync(path.join('demo',d),path.join(out,d),{recursive:true,filter:source=>path.basename(source)!=='.gitkeep'});
 const replace=(f,a,b)=>{const p=path.join(out,f);const s=fs.readFileSync(p,'utf8');if(!s.includes(a))throw new Error('Marcador ausente: '+f);fs.writeFileSync(p,s.replace(a,()=>b));};
 replace('app.js',"const DB_NAME='despesasDemoDB'","const DB_NAME='jabuHomologacaoDB'");
 replace('intelligence.js',"new BroadcastChannel('fatura-demo-screen-lock')","new BroadcastChannel('jabu-homologacao-screen-lock')");
 replace('index.html','Jabu · Demo sintética','Jabu · Homologação');
 replace('index.html','</body>','<script src="homologacao-seed.js"></script></body>');
 fs.copyFileSync('tools/homologacao-seed.js',path.join(out,'homologacao-seed.js'));
 const m=JSON.parse(fs.readFileSync(path.join(out,'manifest.json')));Object.assign(m,{id:'./',name:'Jabu — Homologação sintética',short_name:'Jabu Teste',scope:'./',start_url:'./index.html'});fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(m,null,2)+'\n');
 const context={self:{}};vm.runInNewContext(fs.readFileSync(path.join(out,'assets.js'),'utf8'),context);
 const assets=[...context.self.APP_ASSETS,'./homologacao-seed.js',...fs.readdirSync(path.join(out,'faturas-sinteticas')).map(f=>'./faturas-sinteticas/'+f)];
 const hash=crypto.createHash('sha256');for(const a of assets.filter(a=>a!=='./'))hash.update(fs.readFileSync(path.join(out,a)));
 fs.writeFileSync(path.join(out,'assets.js'),'self.APP_VERSION='+JSON.stringify(hash.digest('hex').slice(0,16))+';self.APP_ASSETS='+JSON.stringify(assets)+';\n');
 fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
 fs.writeFileSync(path.join(out,'_headers'),"/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; worker-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Cache-Control: no-cache\n");
 console.log('Pacote local pronto em dist/homologacao. Nenhum deploy executado.');return out;
}
if(require.main===module)build();module.exports={build};
