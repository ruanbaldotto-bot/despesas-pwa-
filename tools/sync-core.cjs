const fs=require('node:fs');const s=fs.readFileSync('Core.gs','utf8');fs.writeFileSync('core.js',s);fs.writeFileSync('CoreClient.html','<script>\n'+s+'\n</script>\n');
