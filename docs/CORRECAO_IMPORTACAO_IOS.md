# Correção de importação no WebKit — 18/10/2026

## Causa reproduzida com evidência

Mensagem relatada no iPhone: undefined is not a function (near '...value of readableStream...'). A inspeção encontrou a chamada intelligence.js → extractPDF → readPDF → page.getTextContent(). No PDF.js 6.4.299 legacy distribuído localmente, vendor/pdf.mjs:22362 executa for await (const value of readableStream), retornado por streamTextContent(). Sem ReadableStream.prototype[Symbol.asyncIterator], essa chamada lança TypeError.

Antes da correção, foi reproduzido com PDF binário sintético e a API removida em processo Node isolado: TypeError: readableStream is not async iterable; frame PDFPageProxy.getTextContent em vendor/pdf.mjs:22362:31. O novo teste mantém essa reprodução diretamente na dependência e comprova o caminho corrigido no mesmo processo sem reinstalar o iterador. Não houve coleta de documento, senha ou stack privado do iPhone. A versão exata do Safari físico ainda não foi informada; a reprodução identifica o mecanismo compatível com a mensagem, sem substituir a nova validação no aparelho.

CSV não passa por PDF.js/getTextContent. Com o iterador ausente, o CSV sintético foi lido e conciliado separadamente. File.arrayBuffer e File.text existiam no caminho anterior; não foram a origem desta exceção reproduzida. Blob.stream não é chamado pelo fluxo de importação. Não foi acrescentado polyfill global nem editado o código vendorizado. Outros loops da dependência foram inspecionados: o worker possui uma tentativa de descompressão com fallback em catch; não é o frame desta falha. A correção não promete compatibilidade irrestrita com todos os PDFs/versões iOS.

Fontes primárias: [API PDF.js](https://mozilla.github.io/pdf.js/api/draft/api.js.html), [relato no projeto Mozilla com a mesma falha](https://github.com/mozilla/pdf.js/issues/21924), [getReader documentado pela Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader). A evidência principal é a reprodução sobre a versão instalada.

## Alterações

- pdf-reader.mjs: leitura por streamTextContent().getReader().read(), sem iterar o stream; liberação de lock e cancelamento na falha, limites de texto/páginas/tamanho preservados, encerramento do worker. PDFs XFA puros mantêm o caminho específico que não usa aquele loop. Senha temporária retirada das opções antes de aguardar a leitura.
- file-reader.js: leitura local compartilhada, detecção de File.arrayBuffer e fallback FileReader.readAsArrayBuffer; texto UTF-8 via TextDecoder ou FileReader.readAsText. Sem Blob.stream ou envio de conteúdo. Erros de arquivo são mensagens fixas, sem refletir conteúdo privado.
- intelligence.js: usa o leitor comum para hash, CSV e restauração; reaproveita os bytes já lidos no PDF, evitando a segunda leitura do arquivo. Senha não é persistida ou registrada. Conciliação, revisão e deduplicação preservadas.
- index.html, ferramentas de vendor/demo/homologação e preview incluem/servem o novo leitor no pacote e cache; testes DOM incluem o mesmo script.

## Testes

**85 passaram, zero falhas**, preservando os 80 anteriores. Resultado completo em test-output-ios-importacao.txt. npm indisponível: executado node --test tests/*.test.cjs, o mesmo runner do script npm test.

Cinco regressões: reprodução original na dependência e leitura real PDF/CSV/senha sem asyncIterator; CSV via FileReader sem métodos modernos até conciliação/gravação; liberação/cancelamento do reader; erro seguro de leitura; PDF protegido via FileReader com PDF.js real, revisão e ausência de senha no snapshot. Senhas geradas aleatoriamente só em execução. Foram testadas senha ausente, incorreta e correta. Os avisos Node de canvas/DOMMatrix/Path2D dizem respeito à renderização não usada; a reprodução intencional da falha antiga também pode avisar encerramento de tarefa.

No navegador integrado do computador, por HTTPS privado: PDF Itaú sintético e CSV separados produziram três linhas e conciliação com diferença zero. A troca de arquivo invalidou a revisão anterior. Não houve importação de dados reais. Nenhuma alegação de aprovação física no iPhone.

## Ambiente privado atualizado

Pacote anterior preservado em dist/homologacao-antes-correcao-ios; novo dist/homologacao gerado sem sobrescrita. Verificação: 226 arquivos permitidos, 12 amostras exatamente iguais às fixtures, banco separado e hash íntegro. Versão do pacote/cache: **8c29a7e08765198b**.

Somente o processo Node identificado pela linha de comando e pelo conteúdo idêntico ao pacote aprovado foi reiniciado. Porta 43189 continua em 127.0.0.1, raiz restrita ao pacote. Serve continua privado e proxy único para essa porta; Funnel desativado. URL e dados de tailnet permanecem fora do Git.

O navegador inicialmente recebeu o índice antigo pelo cache. Após fechar o cliente e reabrir, o service worker novo assumiu: o DOM passou a conter file-reader.js, e PDF/CSV funcionaram. Portanto atualizar apenas a página pode deixar um worker aguardando enquanto outra janela da mesma origem estiver aberta. Dados IndexedDB não foram apagados nem migrados.

## Atualizar e validar no iPhone

1. Manter Tailscale ativo, computador ligado e conexão online. Se houver revisão não salva, concluir ou anotar antes de fechar.
2. Fechar o Jabu Teste pelo seletor de apps e todas as abas Safari com a URL do Jabu.
3. Abrir a URL privada no Safari, aguardar o carregamento online; fechar novamente essa aba para permitir ativação do worker atualizado.
4. Abrir novamente pelo ícone ou Safari. Não apagar histórico/dados do site e não reinstalar como primeira medida: isso pode remover IndexedDB. Se ainda receber a versão antiga, registrar o comportamento antes de limpar qualquer coisa.
5. Testar primeiro itau.csv sintético e depois itau.pdf sintético em Importação, competência 2031-10. Conferir três linhas, sinais e total líquido R$ 65,50, diferença R$ 0,00. Trocar arquivo deve exigir revisão nova. Documento já importado deve continuar recusado.
6. Repetir com PDF sintético protegido: senha ausente/incorreta/correta; verificar campo limpo e nenhuma senha no backup. Senhas somente no aparelho, nunca no chat.
7. Registrar modelo/iOS, Safari ou app instalado, formato, resultado e mensagem de erro sem documento/conteúdo privado. Repetir offline após carregar a nova versão. A correção no iPhone permanece pendente até essa execução física.
