# Diagnóstico local dos leitores — rodada atual

95/95 testes aprovados. Quatro PDFs reais auditados estritamente localmente com saída agregada: nenhum foi conciliado/aprovado automaticamente. Itaú protegido e Nubank/CSVs ainda pendentes. Revisão individual, alertas agrupados, validação monetária e extração por coordenadas implementadas. [Matriz e limites](HOMOLOGACAO_LEITORES_REAIS.md).

---

# Correção de importação iOS — rodada atual

85/85 testes aprovados, incluindo os 80 anteriores. Causa reproduzida na iteração assíncrona de ReadableStream dentro de getTextContent; correção local por getReader e fallback FileReader. Pacote privado/cache atualizados. Nova validação no iPhone ainda pendente. [Relatório e atualização](CORRECAO_IMPORTACAO_IOS.md).

---

# Preparação visual/iPhone — rodada atual

80/80 testes aprovados (77 anteriores + 3 novos), 18 capturas em dimensões de iPhone e recarga com servidor local desligado. Sem teste em aparelho físico ou deploy. Relatório e instalação: [HOMOLOGACAO_VISUAL_IPHONE.md](HOMOLOGACAO_VISUAL_IPHONE.md). Log: test-output-iphone.txt.

---

# Rodada Jabu — resultado atual

**77/77 testes aprovados**, zero falhas. Runner Node equivalente ao script npm test; npm indisponível. Log: [test-output-jabu.txt](test-output-jabu.txt). Relatório, falhas corrigidas e limites: [JABU_HOMOLOGACAO.md](JABU_HOMOLOGACAO.md). Capturas reais do navegador integrado com dados sintéticos e verificação geométrica em 320 px estão em evidencias/. Safari físico permanece pendente. Os resultados abaixo são históricos da rodada anterior.

---

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

Rodada Tailscale: 80/80 aprovados; verificador estrutural/exemplos reforçado, bind loopback e rotas 404 verificados. Resultado em test-output-tailscale.txt. Teste físico e configuração final privada pendentes conforme TAILSCALE_PRIVADO.md.

Atualização Tailscale: iPhone online e mesma conta confirmados pela CLI; Serve HTTPS 443 com proxy único e sem Funnel; filtro efetivo somente origens do iPhone e TCP 443; TLS padrão autorizado e HTTP 200 sintético. Navegador integrado abriu a URL privada. Não equivale a teste Safari físico; nenhum novo teste automatizado necessário para esta atualização operacional/documental.

## Diagnóstico complementar Itaú

98 testes aprovados: 95 anteriores preservados e três novos testes sintéticos para contadores estruturais locais, privacidade do resultado e classificação da posição do total. Execução por `node --test tests/*.test.cjs` (npm indisponível). O diagnóstico não altera a importação nem os dados. Auditoria real Itaú informada pelo proprietário: 1 transação, 156 exceções, total não reconhecido e nenhuma parcela identificada. Nova execução local protegida pendente; não constitui homologação financeira ou teste físico no iPhone.

## Itaú — datas curtas, contexto e composição financeira

106 testes aprovados por `node --test tests/*.test.cjs` (npm indisponível), preservando os 98 existentes. Oito regressões novas: ciclo explícito e virada do ano; recusa de ano inferido do vencimento/competência; datas fora do ciclo/colunas mescladas; fragmentos; totais e ofertas/conflitos; créditos e parcelas inválidas; duplicidades; auditor PDF protegido sem exposição de dados. Modelos inteiramente sintéticos; resultados reais posteriores à correção aguardam execução local protegida. Não é homologação Google, financeira real ou de iPhone físico.

Pacote privado sintético regenerado com backup do anterior, allowlist de 226 arquivos e 12 exemplos verificados. HTTP local 200, apenas 127.0.0.1:43189; arquivos atualizados conferidos por HTTPS com validação TLS, cache ffeb54b2a07e654a. Serve preservado, Funnel falso. Atualização efetiva no cache do iPhone permanece pendente.

## Itaú — versão verificável e nenhuma linha candidata fora da revisão

113 testes aprovados por Node (npm indisponível): 106 casos anteriores preservados + 7 novos; dois casos de oferta/interface reforçados para exigir revisão explícita. Verificação de versão e sincronização, imports independentes do diretório corrente, recusa de cópia gerada divergente, fingerprint de dependências, cobertura de 17 candidatos, probes posicionais, PDF protegido e histograma de motivos sem conteúdo real. Todos os dados usados nos testes são sintéticos.

Motor jabu-audit-4, SHA-256 de4534a439d6cab5cd149124236fdb21e7e854f18a8b7ab56b3c7ce3eee4160e. O hash identifica somente arquivos de código, não documentos. A auditoria real anterior não tinha versão comprovável e permaneceu em 1 transação/156 exceções/total ausente. Nova execução protegida com versão e métricas posicionais pendente. Não alegar reconstrução real validada, conciliação ou homologação de iPhone. Pacote privado sintético e HTTPS verificados, cache 82ae0a816493df1b, somente loopback e Funnel desativado.

## Itaú estrutural — motor 5

123 testes aprovados com Node (npm indisponível), preservando os 113 anteriores e acrescentando dez regressões para reconstrução posicional, período confirmado, UI, PDF binário sintético, senha, stdin e backup. Núcleo sincronizado por tools/sync-core.cjs; vendor/demo regenerados. Testes de interface em DOM simulado não equivalem a Safari físico ou homologação Google.

Motor jabu-audit-5, SHA-256 44252207aa18b1b718037fcc2f2eac758473f23c4d16e2c459b0b256dcceb9fa. Última evidência real ainda é do motor 4 (1 transação, 173 exceções, total ausente, zero compras parceladas e zero candidatas fora da revisão). Validação protegida do motor 5 solicitada; nenhuma conclusão financeira real antecipada.

Pacote sintético privado validado, cache 074bc5a33b855aa5; anterior preservado, arquivos conferidos por TLS válido, loopback e Funnel desativado. Atualização efetiva e revisão por período no iPhone aguardam execução física.

## Itaú — seções e descrições em duas colunas

131 testes aprovados com Node (npm indisponível), preservando os 123 anteriores e acrescentando oito casos sintéticos. Separação de colunas antes da ordenação de linhas, descrições complementares e valores em linhas adicionais; rótulo do total atual; histórico de pagamentos separado; resumo/projeção futura em centavos sem duplicação; limites e ambiguidades em revisão; auditor protegido com comparação de referências sem emissão de valores. Wrapper PowerShell sem erros de sintaxe.

Motor jabu-audit-6 / SHA-256 76fda97eca1ccfbf6fad8fb242c731f784620f3d759ee8fac96d9d031fb3c389. Nenhuma referência financeira real copiada para fixture, código ou relatório. Nova auditoria protegida solicitada; resultado real, conciliação e iPhone físico ainda pendentes. Pacote sintético privado validado (cache 33369deec4dece71), anterior preservado, TLS/arquivos/loopback verificados e Funnel desativado. Não equivale a homologação financeira, Safari físico ou Google.

## Itaú — candidatos estruturados e escopo por coluna

139 testes aprovados com Node (npm indisponível): 131 anteriores preservados + oito novos. Verificados campos monetários/parcelas preservados sem ano, data obrigatória na correção individual, fragmentos e cobertura, total atual explícito após futuro/rótulo quebrado, escopo entre colunas, resumo em continuação e separação entre conferência provisória e aprovação. Dados integralmente sintéticos, sem copiar referências reais.

Motor jabu-audit-7 / SHA-256 e88aa7bac3fc098b329cfe7796ed8aab6b6b8100264a961c446f835fea8d9f50. A última execução real recebida é a do motor 6: quatro referências conferem; total atual não reconhecido, uma transação pronta, 168 exceções, nenhuma parcela pronta e zero candidatas fora da revisão. Nova auditoria solicitada; não homologado. Pacote privado sintético verificado, cache 2d8fe75fdcfe8bea; TLS/arquivos/loopback confirmados e Funnel desativado. Não equivale a teste físico do iPhone ou homologação Google.

## Itaú — passagem do total e preservação de candidatos

147 testes aprovados com Node (npm indisponível), incluindo todos os 139 anteriores e oito regressões para leitura compartilhada de total, escopos financeiros, rejeições/conflitos, PDF protegido e preservação de 90 candidatos/50 parcelas sintéticas. Confirmação de período habilita os itens somente no cenário com datas verificadas; nenhuma data inferida do vencimento. Perfis de exceções e totalTrace retornam apenas categorias/contagens.

Motor jabu-audit-8 / SHA-256 0e4e8ff900d22fc734029bb6550eff08a304c15303299971fb4dff7cacfba419. Última evidência real é do motor 7: 90 candidatos pendentes/50 parcelas estruturadas/0 prontos/167 exceções/0 candidatas fora da revisão; total atual ausente e quatro referências conferidas. Nova auditoria protegida solicitada, sem aprovação financeira antecipada. Pacote privado sintético cache a6a7a3ebb4618aeb validado, anterior preservado, HTTPS/loopback verificados e Funnel falso. Não equivale a homologação Google ou teste físico de iPhone.
