# Testes executados — 18/10/2026

## Resultado

Verificação no Node.js 24.19.0: **63 testes passaram, zero falhas**. Comando efetivamente executado: `node --test tests/*.test.cjs`, idêntico ao conteúdo do script `npm test`. Neste ambiente `npm` não está instalado; a tentativa de `npm test` falhou por comando ausente e `pnpm test` encontrou EPERM ao resolver node_modules dentro do sandbox. Nesta rodada npm test foi novamente tentado, com comando ausente. O runner Node executou a suíte completa com sucesso. Resultado completo, com caminho pessoal removido: `docs/test-output-homologacao.txt` (o resultado anterior de 37 testes permanece em `docs/test-output.txt`).

Sincronização das regras, geração dos recursos locais de PDF/cache e build da demo executados por `node tools/sync-core.cjs`, `node tools/vendor.cjs` e `node tools/build-demo.cjs`. Arquivos JS próprios passaram por `node --check`; esse mesmo check detectou a declaração duplicada impeditiva no estado original.

## Bateria adicional desta rodada

26 testes acrescentados aos 37 existentes. Fixtures em tests/fixtures/bancos: quatro CSVs e quatro textos tabulares que geram PDFs binários em memória. Todos os dados são sintéticos; formatos/aliases plausíveis e cenários de crédito/pagamento/parcelas não constituem homologação comercial dos bancos.

Correções verificadas: intervalo de parcela não importada entre duas confirmadas; propagação de divisão somente a partir da competência de origem; créditos negativos sem palavra-chave; rejeição de CSV ambíguo, colunas excedentes e aspas malformadas; valores no limite dos inteiros seguros; revisão invalidada após editar fonte; validação de eventos e envelope de backup; recusa de exportação que exceda o limite de restauração; liberação de worker após erro; confirmação Web Share chamada sem await prévio; limpeza/bloqueio de tela por inatividade; isolamento de cache por escopo e navegação offline com query.

A geração da demo foi adicionalmente testada para banco, canal de bloqueio e versão de cache diferentes da aplicação principal; não lê nem copia o IndexedDB financeiro.

306 divisões sintéticas verificam conservação de centavos. Um teste DOM adicional reproduz cancelamento do seletor sem alerta. A ativação de compartilhamento foi verificada pela execução síncrona do mock, não por seletor nativo iOS.

Durante a preparação, houve falhas de harness (dependência global do módulo storage no Node e URL de fonte no Windows). A dependência agora é explícita e o caminho Node é normalizado; a execução final não mantém essas falhas. Avisos de ausência de canvas/DOMMatrix/Path2D permanecem documentados e não foram suprimidos.

Consulta pontual por pnpm audit --prod --json: zero avisos nas dependências de produção (1 direta + 12 opcionais). Isso não exclui vulnerabilidades desconhecidas nem audita o sistema operacional/origem.

## Cobertura e natureza da evidência

- Centavos e rejeição de números inválidos; arredondamento de divisão percentual por maior resto, incluindo estorno.
- Quatro adaptadores CSV com linhas sintéticas, parcelas, pagamentos/estornos, datas inválidas e totais explícitos sem inferência de ausentes.
- PDF binário sintético construído em memória, extraído pela biblioteca PDF.js real e reconhecido pelas regras; PDF inválido rejeitado. O ambiente Node emite aviso sobre ausência de canvas/DOMMatrix/Path2D, que afeta renderização não utilizada nesta prova de extração. Não foi testada renderização de PDFs.
- Conciliação e duplicidades entre arquivos; importações concorrentes, rollback e ausência de faturas/compras órfãs.
- Projeções 3/6/12/24, composição, recorrências antigas, término de parcelas e substituição de estimativa por parcela confirmada em grupo. Associação de nova parcela preserva o grupo existente.
- Divisão em lote atômica, evolução de atribuição por sequência, propagação apenas em grupo confirmado e isolamento por pessoa de demonstrativos/pagamentos.
- Recebimento parcial separado de pagamento ao banco; exportação CSV com quoting e proteção de fórmulas.
- Backup AES-GCM com ida/volta, senha incorreta e adulteração; staging/restore sem sobrescrita, conflito revertendo todas as stores e anexos preservados.
- Persistência após fechar e reabrir; migração de estrutura v4 para v5 preservando registro legado sem regravá-lo.
- Integração DOM dos scripts reais: inicialização, categorias, cartões, arquivamento, dinheiro decimal, escape de nota, pessoa, leitura/revisão de CSV, confirmação e gráfico.
- Manifest/ícones, sincronização da fonte das regras e existência de todos os assets de cache. Service worker testado com dublês: filtros de origem/método/lista e preservação de cache alheio.

IndexedDB é simulado por fake-indexeddb; formulários usam jsdom, sem renderização. Testes de persistência e migração exercitam callbacks/transações da API simulada, não o motor Safari. Service worker usa dublês; não comprova operação offline em navegador real. Não houve homologação Google, e este PWA não utiliza o backend Apps Script da pasta superior.

## Revisão visual bloqueada

A nova tentativa de abrir 127.0.0.1:4173 no navegador integrado retornou `net::ERR_CONNECTION_TIMED_OUT`. Não foi feita homologação visual de UI, responsividade renderizada, Safari/iPhone físico, instalação, Web Share/WhatsApp, impressão/PDF pelo sistema, teclado, VoiceOver, ciclo de vida, quota ou funcionamento offline real. CSS inclui safe areas, rolagem de abas, inputs de 16px e alvos de 44px, mas essas mudanças continuam pendentes de revisão visual.

## Pendências para homologação

Usar o roteiro de INSTALACAO.md e documentos representativos autorizados de cada banco em ambiente local. Não inserir documentos reais no Git nem em serviços de teste. Conferir limites e diferenças de layout em USO.md; extração genérica conservadora e fixtures sintéticas não equivalem à validação dos bancos.
