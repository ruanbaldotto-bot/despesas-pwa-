const crypto=require('node:crypto');const secrets=new Map();module.exports.secret=label=>{if(!secrets.has(label))secrets.set(label,crypto.randomUUID());return secrets.get(label);};
