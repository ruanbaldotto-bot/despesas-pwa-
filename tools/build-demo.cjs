const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const productionApp = fs.readFileSync('app.js', 'utf8');
if (!productionApp.includes("const DB_NAME='despesasDB'")) throw new Error('Nome do banco principal não localizado; geração cancelada antes de copiar arquivos.');
fs.mkdirSync('demo', { recursive: true });
for (const file of ['index.html', 'app.js', 'core.js', 'storage.js', 'intelligence.js', 'pdf-reader.mjs', 'styles.css', 'manifest.json', 'sw.js', 'assets.js']) {
  fs.copyFileSync(file, path.join('demo', file));
}
for (const directory of ['icons', 'vendor']) fs.cpSync(directory, path.join('demo', directory), { recursive: true });
fs.writeFileSync('demo/app.js', productionApp.replace("const DB_NAME='despesasDB'", "const DB_NAME='despesasDemoDB'"));
fs.writeFileSync('demo/intelligence.js', fs.readFileSync('demo/intelligence.js', 'utf8').replace("new BroadcastChannel('fatura-screen-lock')", "new BroadcastChannel('fatura-demo-screen-lock')"));
fs.writeFileSync('demo/index.html', fs.readFileSync('demo/index.html', 'utf8').replace('<h1>Despesas</h1>', '<h1>Despesas — Demo sintética</h1>').replace('Armazenamento local • Faça backups', 'Somente dados sintéticos • Banco de teste separado • Faça backups'));
const context = { self: {} };
vm.runInNewContext(fs.readFileSync('assets.js', 'utf8'), context);
const hash = crypto.createHash('sha256');
for (const asset of context.self.APP_ASSETS.filter(asset => asset !== './')) hash.update(fs.readFileSync(path.join('demo', asset)));
fs.writeFileSync('demo/assets.js', 'self.APP_VERSION=' + JSON.stringify(hash.digest('hex').slice(0, 16)) + ';self.APP_ASSETS=' + JSON.stringify(context.self.APP_ASSETS) + ';\n');
require('./gerar-faturas-sinteticas.cjs');
console.log('Demo gerada com banco despesasDemoDB, cache próprio e identificação sintética.');
