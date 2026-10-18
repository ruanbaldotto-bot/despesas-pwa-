// Uses the official Git credential-helper protocol; secrets stay in process memory.
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const repo='ruanbaldotto-bot/despesas-pwa-',branch='feature/fatura-inteligente';
async function main(){
 const origin=execFileSync('git',['remote','get-url','origin'],{encoding:'utf8'}).trim();
 if(origin!==`https://github.com/${repo}.git`&&origin!==`https://github.com/${repo}`)throw new Error('Remote inesperado; operação cancelada.');
 let credential;try{credential=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},stdio:['pipe','pipe','pipe']});}catch{throw new Error('Credencial oficial do Git indisponível.');}
 const fields=Object.fromEntries(credential.trim().split(/\r?\n/).map(line=>{const n=line.indexOf('=');return [line.slice(0,n),line.slice(n+1)];}));
 const token=fields.password||fields.credential;if(!token)throw new Error('Credencial não compatível com API GitHub.');
 credential='';
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'Jabu-development','Content-Type':'application/json'};
 async function api(path,method='GET',body){const response=await fetch('https://api.github.com'+path,{method,headers,body:body?JSON.stringify(body):undefined});if(!response.ok)throw new Error('GitHub recusou a operação HTTP '+response.status+'. Nenhuma credencial foi exibida.');return response.json();}
 const existing=await api(`/repos/${repo}/pulls?state=open&head=${encodeURIComponent('ruanbaldotto-bot:'+branch)}&base=main`);
 const payload={title:'Jabu — Evolução do PWA financeiro, identidade visual e novos bancos.',body:fs.readFileSync('docs/PR.md','utf8')};
 let pr=existing.length?await api(`/repos/${repo}/pulls/${existing[0].number}`,'PATCH',payload):await api(`/repos/${repo}/pulls`,'POST',{...payload,base:'main',head:branch,draft:true});
 if(!pr.draft){const converted=await api('/graphql','POST',{query:'mutation($id:ID!){convertPullRequestToDraft(input:{pullRequestId:$id}){pullRequest{isDraft}}}',variables:{id:pr.node_id}});if(converted.errors||!converted.data?.convertPullRequestToDraft?.pullRequest?.isDraft)throw new Error('Não foi possível confirmar modo draft.');pr.draft=true;}
 console.log(JSON.stringify({url:pr.html_url,number:pr.number,draft:pr.draft}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
