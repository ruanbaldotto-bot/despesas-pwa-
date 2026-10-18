# Homologação adicional e segurança — 18/10/2026

## Preservação

Trabalho continuado na branch local feature/fatura-inteligente, preservando 318c3f5 e o commit subsequente edc3a0c de documentação. Nenhum reset, rebase ou descarte. main continua no commit 1c7ed0365839053ccffbe6e13f037b374f722f6b. Projeto Apps Script da pasta superior não alterado. Sem deploy público e sem uso de faturas reais.

## Resultados por prioridade

1. **GitHub:** remote correto e conta conectada com push/admin; credencial Git indisponível e integração com evidência anterior de HTTP 403 por autorização insuficiente. Nesta rodada foi feito somente um teste Git dry-run sem interação; não foram repetidas gravações recusadas pela integração. A publicação e o draft permanecem pendentes de login/escopo. Passos oficiais e permissões mínimas em PUBLICACAO_GITHUB.md; descrição pronta em PR.md.
2. **Funcional:** 63 testes aprovados, zero falhas; 26 novos sobre os 37 existentes. Incluem quatro CSVs e quatro PDFs binários sintéticos de tabelas com aliases e operações representativas de Santander, Porto, Mercado Pago e Nubank. Fixtures não reproduzem todos os layouts oficiais nem certificam sua importação. Evidência em TESTES.md e test-output-homologacao.txt.
3. **Segurança:** validação reforçada de backup/envelope; campos de senha limpos; bloqueio síncrono e por inatividade; cache isolado por escopo; demo com banco/canal/versionamento próprios, evitando abertura acidental do banco principal; compartilhamento individual com confirmação em segundo toque. Audit de dependências de produção sem avisos conhecidos, sem garantia de ausência de vulnerabilidades.
4. **iPhone:** análise documental e de código; revisão visual novamente bloqueada por timeout no navegador integrado, sem aparelho físico/Safari disponível. Roteiro executável com critérios em HOMOLOGACAO_IPHONE.md. Instalação, offline nativo, seletor de arquivos/compartilhamento, impressão e aparência seguem não homologados.

## Falhas corrigidas

- Projeção de um grupo com outubro e dezembro confirmados deixava novembro sem estimativa; agora usa a observação anterior a cada competência.
- Atribuição propagada em mês posterior podia afetar meses anteriores. Novos eventos têm início de vigência; legado depende de origem comprovável.
- Valores negativos sem rótulo de estorno não eram classificados como crédito, podendo influenciar recorrência. CSV com cabeçalhos repetidos/colunas extras/aspas inválidas agora explicita erros. Cálculo textual de centavos usa BigInt antes da verificação de limite seguro.
- Alteração de fonte após aprovação deixava risco de confirmar dados antigos; revisão agora é invalidada e precisa ser reprocessada.
- Backup aceitava eventos financeiros inconsistentes e bytes fora do intervalo; staging os rejeita. O exportador recusa dados acima do limite compatível com restauração.
- Trava só ocultava após consulta assíncrona. Agora oculta antes de await e limpa impressão/senhas; inclui retorno do histórico e inatividade. Não é autenticação forte.
- Web Share aguardava leitura do banco antes de abrir o seletor. A confirmação agora aciona share diretamente no segundo toque, com snapshot individual; cancelamento não gera envio ou erro de negócio.
- Cache não distinguia escopos de duas instalações da mesma origem. Agora preserva instalações vizinhas e usa caminho canônico para navegação inicial com query.
- Demo copiava o nome do banco da aplicação. Agora usa despesasDemoDB e identificação visível; nenhum registro do banco existente foi apagado ou transferido.

## Arquivos e execução

Regras em Core.gs e derivados core.js/CoreClient.html; armazenamento em storage.js; fluxos em intelligence.js; proteção inicial em index.html/styles.css; leitura PDF em pdf-reader.mjs; cache em sw.js/assets.js; ferramentas de demo/prévia e gerador sintético; testes e documentação. A demo gerada permanece ignorada pelo Git, com oito documentos sintéticos prontos para o roteiro manual.

Executados sync-core, vendor, build-demo, checks de sintaxe e node --test tests/*.test.cjs. npm test foi tentado, mas npm não existe neste ambiente; o runner Node executa exatamente o script configurado. IndexedDB é fake-indexeddb, UI é jsdom e service worker usa dublês. PDF.js é a biblioteca real lendo PDFs sintéticos; não foi testada renderização nativa.

## Riscos e próxima etapa

IndexedDB continua em claro. Trava não impede código da mesma origem, ferramentas do navegador ou ataques offline ao verificador. JavaScript não oferece garantia de apagar senhas/dados da memória. Safari pode remover dados; persistência solicitada não substitui backup. PDFs escaneados/protegidos e datas sem ano exigem alternativa/revisão. Exclusões legadas, ausência de estorno de recebimentos e demais limites de USO.md permanecem.

Próximos passos: proprietário conclui login oficial ou ajusta escopos; então publicar a branch sem force e abrir **draft**, sem merge/deploy. Em ambiente HTTPS de teste autorizado, executar o roteiro manual no iPhone com os arquivos sintéticos, registrar versão/caso/resultado e corrigir falhas antes de considerar uso financeiro real.
