# Leitores bancários — diagnóstico local e pendências (18/10/2026)

## Resultado e limite da entrega

**Homologação completa não concluída. Nenhuma fatura real foi aprovada para importação automática.** Os quatro PDFs sem senha foram extraídos localmente, mas o mapeamento não reconheceu um conjunto confiável de transações nem o total declarado. Esse é um resultado reprovado/pendente dos leitores, não ausência de compras nas faturas. Reduzir alertas não equivale a conciliar.

O PDF Itaú foi encontrado, mas a leitura protegida aguarda entrada da senha no computador. Não há PDF Nubank confirmado; o caminho do CSV Nubank ainda não foi disponibilizado. Os demais CSVs também não foram fornecidos. A competência dos PDFs reais não foi confirmada automaticamente; não foi inferida de nome de arquivo, data solta ou data atual. Repetição no iPhone físico permanece pendente.

## Privacidade e escopo

Somente os cinco caminhos explicitamente autorizados foram verificados; todos existem nos caminhos originais. A pasta dedicada autorizada foi criada e está sem esses documentos/CSV. Não houve busca em outras pastas, cópia para o repositório ou alteração dos originais. Nenhuma fatura foi transferida para o OneDrive pela execução: a pasta escolhida pertence ao OneDrive e pode sincronizar, por isso não foi usada para cópias/extratos.

A extração foi executada por Node/PDF.js locais, com dados binários em memória, recursos locais, avaliação de código PDF desativada, fetch bloqueado no processo de auditoria e saída da biblioteca silenciada. Nenhum texto, imagem, valor monetário, data de transação, senha, hash de documento ou identidade foi emitido. O modelo recebeu apenas contagens/indicadores agregados exigidos para esta matriz. Não houve visualização das faturas em ferramentas de IA, upload de faturas ou importação de documentos reais no IndexedDB de produção/demo. Originais permanecem nos locais autorizados.

Ferramentas CLI não são incluídas no pacote PWA nem servidas pelo preview. A matriz abaixo é agregada e não contém nomes, cartões, CPF, valores ou nomes de arquivos bancários.

## Matriz de homologação real

Exceções são registros potencialmente financeiros que exigem decisão humana, não contagem certificada de compras. Zero na coluna automática significa falha de reconhecimento confiável, não fatura vazia.

| Banco | Formato | Lançamentos automáticos | Exceções | Conciliação | Projeção futura | Status |
| --- | --- | ---: | ---: | --- | --- | --- |
| Santander | PDF | 0 | 36 | Total não reconhecido | Não validada | Pendente: layout/datas e revisão local |
| Porto Bank | PDF | 0 | 31 | Total não reconhecido | Não validada | Pendente: layout/datas e revisão local |
| Mercado Pago | PDF | 0 | 24 | Total não reconhecido | Não validada | Pendente: layout/datas e revisão local |
| Bradesco/Bradescard | PDF | 0 | 20 | Total não reconhecido | Não validada | Pendente: layout/datas e revisão local |
| Itaú | PDF | — | — | Não executada com senha | Não validada | Pendente: entrada local da senha |
| Nubank | PDF | — | — | Não executada | Não validada | Documento não confirmado |
| Santander | CSV | — | — | Não executada | Não validada | Não fornecido |
| Porto Bank | CSV | — | — | Não executada | Não validada | Não fornecido |
| Mercado Pago | CSV | — | — | Não executada | Não validada | Não fornecido |
| Bradesco/Bradescard | CSV | — | — | Não executada | Não validada | Não fornecido |
| Itaú | CSV | — | — | Não executada | Não validada | Não fornecido |
| Nubank | CSV | — | — | Não executada no arquivo real | Não validada | Caminho aguardado |

## Diagnóstico estrutural e correções implementadas

A extração anterior produzia 262, 207 e 204 alertas nos PDFs genéricos Santander/Porto/Mercado Pago e 190 no adaptador Bradesco. Datas e valores apareciam separados em células/linhas. O extrator agora agrupa fragmentos pela coordenada vertical e ordena horizontalmente, sem depender de hasEOL como quebra obrigatória de célula. Linhas que aparentam duas transações de colunas diferentes são recusadas como ambíguas, não fundidas em uma compra. Persistem ambiguidades reais de tabelas, datas incompletas e seções: não se declara fidelidade visual integral dos PDFs.

O parser diferencia candidatos financeiros, avisos gerais e textos informativos/excluídos. As 158/154/157/112 linhas informativas agrupadas dos quatro diagnósticos não viram compras. Limites, saldos, vencimentos, encargos informativos, ofertas e resumos não são usados para compensar diferença de total. O texto bruto permanece acessível localmente em uma seção avançada; o agrupamento não certifica toda a classificação. Registro não reconhecido com data/valor continua visível como exceção.

Revisão individual permite alterar data completa, descrição, valor, tipo (compra/encargo, crédito/estorno ou pagamento) e parcelas. Exceção pode virar registro corrigido ou ser excluída explicitamente com motivo obrigatório. Há inclusão manual apenas de registro confirmado no documento, inclusive para decompor uma linha ambígua. Toda decisão invalida o aceite anterior. Pendência bloqueia salvar mesmo que o total coincida; conciliação exata em centavos, validação e deduplicação do backend permanecem obrigatórias. Não se gera lançamento de ajuste para fechar saldo nem se adivinha ano.

CSV: moedas brasileiras, sinal antes/depois de R$, espaços não separáveis, negativo Unicode, parênteses negativos, campos entre aspas e separador sep= são tratados com validação estrita. Números ambíguos continuam rejeitados e viram exceções editáveis. **O erro do CSV Nubank real ainda não foi reproduzido**, pois esse arquivo não está disponível; as regressões são sintéticas e não substituem essa validação.

O total pode ser reconhecido quando há rótulo explícito e valor isolado na célula seguinte; limites e totais conflitantes não são inferidos. Isso não resolveu automaticamente os quatro layouts reais desta rodada, conforme a matriz. Dados insuficientes continuam exigindo revisão.

No iPhone, a configuração deixa de usar barra de status translúcida, e o cabeçalho soma margem à safe area. Efeito no Safari/app instalado ainda precisa de verificação física; não se recomenda excluir dados/app sem backup.

## Testes e evidências

**95 testes passaram, zero falhas**: todos os 85 anteriores mais dez regressões. Log somente sintético: test-output-leitores.txt. Runner node --test tests/*.test.cjs; npm não está disponível.

Cobertura adicionada: CSV Nubank fictício com moeda/aspas/negativos; rejeição de ambiguidades; reconstrução de células e recusa de colunas sobrepostas; agrupamento de informações sem ocultar suspeitas; total rotulado; validação de correção individual; edição sem alterar fonte bruta e sem gravar antes de salvar; bloqueio por exceção e exclusão justificada; configuração da safe area; auditor local que preserva bytes e não imprime texto/caminho/valores da fixture. Testes anteriores continuam cobrindo senha de PDF, WebKit sem asyncIterator, conciliação, parcelas, duplicidades, projeções, família, backup e restauração. Backend/DOM dublês não equivalem a testes no iPhone ou Google.

Navegador integrado via HTTPS privado: CSV exclusivamente sintético com valor malformado produziu três registros válidos e uma exceção editável, mantendo salvar bloqueado. Nenhuma fatura real foi aberta nesse navegador. Evidência visual sintética permanece local e fora do Git.

## Concluir Itaú e cobertura ausente

Para auditar um PDF protegido sem senha em argumentos, arquivos ou chat, executar localmente, dentro da pasta do projeto:

    .\tools\auditar-fatura-protegida.ps1 -Bank 'Itaú' -File 'CAMINHO_LOCAL_AUTORIZADO.pdf'

O prompt usa Read-Host -AsSecureString; a senha é enviada ao processo Node por stdin, nunca como argumento. Permanece em memória pelo tempo da leitura, sem garantia de apagamento absoluto de memória JavaScript/PowerShell. O resultado contém somente indicadores agregados. Não enviar texto, screenshots, senha ou documento ao chat. Não desativar política de execução se o script for bloqueado; relatar a limitação.

Auditoria sem senha: node tools/auditar-faturas-locais.cjs 'BANCO' 'CAMINHO_AUTORIZADO'. Não usar curingas nem varrer diretórios. O proprietário deve disponibilizar o caminho do CSV Nubank e, se desejar cobertura PDF Nubank, um documento autorizado; disponibilizar CSVs dos demais bancos para homologar esses formatos reais.

Para concluir os leitores, os layouts ainda pendentes precisam de conferência local por banco: competência, seção de lançamentos, composição do total, créditos/pagamentos e parcelas. Pode-se fornecer uma descrição estrutural ou uma amostra inteiramente sintética aprovada pelo proprietário, sem conteúdo real, para regressões adicionais. Não afirmar homologação automática com base na redução de alertas.

## Atualização privada e próxima etapa

Pacotes anteriores preservados; reconstrução usa somente a allowlist sintética, sem documentos reais. Banco de homologação preservado e produção não modificada. Servidor permanece em 127.0.0.1:43189, Serve privado e Funnel desativado; sem merge, main ou deploy público.

No iPhone online com Tailscale: fechar Jabu Teste e todas as abas dessa origem; abrir online, aguardar carregamento, fechar novamente e reabrir para ativar o worker novo. Não limpar armazenamento. Testar revisão de CSV/PDF sintéticos, correção de cada campo, exceção impedindo salvar, conciliação, parcelas/projeções, duplicidade, restauração e safe areas. Registrar resultados em IPHONE_REGISTRO_HOMOLOGACAO.md. Documentos reais só devem ser revistos no fluxo local autorizado, sem screenshots/conteúdo externo. Nenhum teste físico foi marcado aprovado nesta rodada.

Pacote sintético final desta rodada: versão de cache f828d8bfd994ddbf, 226 recursos permitidos e 12 amostras sintéticas conferidas. Nenhum dos documentos de auditoria integra esse pacote.

## Itaú — diagnóstico agregado informado pelo proprietário

Auditoria local protegida: 339 linhas, 1 transação reconhecida, 156 exceções e 177 linhas informativas. Duas linhas começam com data completa, 134 com data curta, 97 contêm múltiplas expressões no formato de data e três contêm somente valores. Total não reconhecido; nenhuma parcela identificada. **Revisão necessária; não homologado.**

O contador de múltiplas datas também pode contar a notação de parcelas. Esses números não demonstram, isoladamente, quais linhas são transações ou qual ano deve ser utilizado. O diagnóstico complementar local `tools/estrutura-itau.cjs` retorna somente contagens fixas de padrões, seções conhecidas, possíveis colunas mescladas e posição do total. Não retorna texto, datas, valores nem identificadores. Candidatos a parcelas não equivalem a parcelas financeiramente reconhecidas.

Executar novamente o script de auditoria protegida, com senha digitada no prompt local, e fornecer apenas o resultado agregado incluindo `itauStructure`. A senha temporária não está disponível no processo do agente. Não foi aplicada correção especulativa ao adaptador, nem declarada melhora dos resultados reais. A aplicação e o ambiente privado permanecem na versão anterior até existir uma correção validada.

## Correção direcionada Itaú — validação real pendente

A segunda auditoria informada pelo proprietário confirma 134 linhas iniciadas por data curta, 131 delas terminando em valor, 95 candidatos a sufixos de parcelas, duas referências ao total (uma inline), quatro seções de transações, uma transação reconhecida e 156 exceções. Não permite afirmar que as 131 linhas são compras ou identificar o ano das compras.

Alterações em Core.gs, sincronizadas para core.js/CoreClient.html: datas DD/MM resolvidas somente com período explícito e único de lançamentos, de até 62 dias, e seção de transações reconhecida; virada de ano contemplada. Vencimento, competência isolada, data atual ou nome de arquivo não fornecem o ano. Datas fora do período e períodos conflitantes permanecem exceções. Compras históricas parceladas fora desse intervalo exigem revisão; não se presume que a data original pertença ao ciclo atual.

Sufixos válidos associados a compras são preservados; créditos e pagamentos não geram parcelas futuras. Datas adicionais ambíguas e possíveis colunas mescladas continuam bloqueadas para revisão. Reconstrução limitada a dois/três fragmentos consecutivos em seção explícita; não cruza cabeçalhos ou totais. Não foi implementada divisão especulativa de duas colunas com base apenas em contagens.

Total reconhecido em resumo, na mesma linha ou célula seguinte, incluindo rótulo com `(R$)`. Ofertas/futuro e limites não fornecem o total devido. Valores conflitantes permanecem incertos, sem fallback genérico que possa buscar total de oferta. Nenhum lançamento compensatório criado.

O auditor informa dateContext, installmentPurchases e coverage: linhas candidatas financeiras, fontes reconhecidas, exceções, fontes de resumo e linhas financeiras fora da revisão. Esta última contagem pode incluir ofertas explicitamente excluídas; exige conferência, não significa automaticamente compra perdida. O resultado não expõe texto, valores, datas, caminhos nem senha.

106 testes aprovados (98 anteriores + 8 regressões sintéticas), incluindo PDF protegido com segredo aleatório, reconstrução, projeções, créditos, pagamentos, conciliação e duplicidades. Fixtures são modelos sintéticos dos padrões agregados e hipóteses conservadoras; não reproduzem conteúdo real. Nova execução do auditor protegido solicitada. **Resultados reais após a correção ainda não disponíveis; leitor não homologado.**

Pacote sintético privado validado (226 arquivos; 12 exemplos exatos; banco isolado) e servido novamente em loopback. Cache `ffeb54b2a07e654a`; arquivos core.js/assets.js/sw.js correspondem ao pacote por HTTPS válido. Pacote anterior preservado. Funnel desativado. Nenhum dado de navegador apagado; instalação/cache do iPhone ainda dependem de verificação física.

Para atualizar o iPhone: fechar todas as janelas do Jabu e abas Safari da mesma origem; abrir online, aguardar aviso de atualização; fechar e reabrir novamente. Não limpar o armazenamento nem reinstalar para forçar a atualização. Repetir os testes com dados sintéticos e registrar o resultado físico.

## Falha persistente Itaú — motor verificável e cobertura obrigatória

Nova auditoria informada pelo proprietário após a alteração anterior: 339 linhas, 1 transação, 156 exceções, zero compras parceladas, total não reconhecido e contexto temporal ausente/ambíguo. Das 166 linhas candidatas financeiras, uma foi reconhecida, 148 foram encaminhadas à revisão e 17 ficaram fora. Os números anteriores não demonstraram melhora; homologação permanece reprovada/pendente.

### Verificação de execução

No checkout autorizado, core.js e CoreClient.html estão sincronizados com Core.gs; require.resolve aponta para o core.js relativo ao auditor. PDF.js local identificado como 6.4.299; Node local 24.19.0, Windows. O PowerShell já usava PSScriptRoot para localizar o auditor, mas não havia identificação suficiente para provar qual cópia o proprietário executou. Os campos retornados são compatíveis com código recente; não é possível afirmar retrospectivamente a versão exata daquela execução.

Motor novo: **jabu-audit-4**, SHA-256 **de4534a439d6cab5cd149124236fdb21e7e854f18a8b7ab56b3c7ce3eee4160e**. Fingerprint somente de código: auditor, wrapper PowerShell, núcleo/fonte gerada, leitor, utilitários e PDF.js/worker. Nunca inclui hash da fatura, senha ou caminho do documento. Usar o script do checkout autorizado por caminho absoluto; ele resolve Node uma vez, imprime versão/hash antes do prompt oculto, exige sincronização e repassa o hash esperado ao mesmo auditor. Node recusa divergência antes de ler documento/senha. Teste executado a partir de outra pasta confirma resolução relativa ao script; teste com cópia gerada divergente é recusado. Fingerprint identifica a cópia executada; não comprova a correção financeira do parser.

### Cobertura e investigação estrutural

O filtro de diagnóstico podia agrupar candidatos financeiros como informações/ofertas. Agora, no Itaú, toda linha marcada pela heurística financeira que não esteja em fonte reconhecida, resumo explicitamente identificado ou exceção é encaminhada à revisão individual pendente. Isso inclui candidatos em ofertas/resumos e pode aumentar exceções; não transforma essas linhas em compras. O salvamento permanece bloqueado até revisão/exclusão explícita justificada, além da conciliação. Teste com 17 candidatos anteriormente excluídos confirma zero candidatos fora da revisão. O total de exceções pode ser maior que exceptionSourceLines porque a detecção de exceções também cobre outros formatos de data. A cobertura não é garantia de detectar qualquer formato financeiro ainda desconhecido.

Novo hook local de inspeção de itens PDF, sem modificar a extração normal. Probe local retorna só contagens fixas de ordem, células de valor, linhas com múltiplos valores/datas, datas após valores, cabeçalhos e total misturado com outros elementos. Mantém em memória uma reconstrução candidata por coordenadas e compara reconhecimento/conciliação/parcelas; **modo diagnóstico, não usado para importar**. Não escolhe automaticamente a alternativa com menos exceções. Histogramas de revisão usam categorias fixas, nunca motivos arbitrários do documento.

Não há senha temporária disponível no processo do agente; por isso o conteúdo e a geometria do PDF real protegido não foram inspecionados nesta etapa. A execução local protegida foi solicitada com caminho absoluto do script, retorno agregado engine/layout/reviewReasons/coverage e resultados financeiros. Nenhum texto, valor, data, imagem, senha ou documento real foi enviado ao modelo ou aos serviços externos. Não foi implementada outra interpretação especulativa de datas/total. A reconstrução candidata precisa da auditoria real antes de qualquer adoção no importador.

### Evidência e próxima validação

113 testes aprovados: 106 casos anteriores preservados e sete novos. Dois casos anteriores fortalecidos para a nova obrigação de revisar oferta financeira antes de salvar; nenhum caso removido. Testes novos cobrem versão/imports fora da pasta corrente, fingerprint/dependência e cópia gerada divergente, 17 candidatos, geometria sintética de colunas, ordem/total misturado, hook com PDF protegido e histograma sem vazamento. Fixtures posicionais são sintéticas; não são prova da geometria real.

Executar o wrapper protegido do checkout autorizado e conferir versão/hash antes da senha. Retornar somente JSON agregado. Exigir total correto, conciliação exata, parcelas coerentes, datas ambíguas em revisão, nenhuma linha financeira candidata fora do reconhecimento/revisão e testes aprovados. Até isso ocorrer, não homologado. No iPhone, fechar/reabrir online para atualizar o cache sem apagar IndexedDB; confirmar resultados fisicamente.

Pacote privado exclusivamente sintético preservado em backup e regenerado: 226 arquivos, 12 exemplos exatos e banco isolado, cache 82ae0a816493df1b. core.js/pdf-reader.mjs/assets.js/sw.js conferidos por HTTPS com TLS válido; servidor apenas 127.0.0.1:43189, Serve sem Funnel. Nenhum deploy público, dado do navegador apagado ou alteração de main.

Atualização recebida do proprietário: execução real de jabu-audit-4 com hash confirmado. Quatro páginas, 339 linhas, 168 células somente monetárias; 1 transação, 173 exceções (130 sem contexto de data, 25 formato, 17 cobertura e uma coluna mesclada), zero compras parceladas, total ausente e zero candidatas financeiras fora da revisão. Cobertura corrigida confirmada nesta execução; reconhecimento financeiro não homologado. Próxima etapa autorizada: reconstrução posicional e período informado explicitamente pelo usuário na revisão.

## Reconstrução estrutural Itaú e período confirmado na revisão

Motor **jabu-audit-5**, SHA-256 **44252207aa18b1b718037fcc2f2eac758473f23c4d16e2c459b0b256dcceb9fa**. A última execução real comprovada pelo proprietário ainda é do motor 4: 1 transação, 173 exceções, total não reconhecido, nenhuma compra parcelada e zero candidatas financeiras fora da revisão. Não atribuir esses resultados ao motor 5 nem declarar melhora real antes da nova execução.

O leitor Itaú agora usa itens posicionados de streamTextContent (mesma estrutura de texto/transform do PDF.js), preservando a correção getReader para WebKit. Não volta ao iterador assíncrono de getTextContent incompatível com a falha já reproduzida. Agrupa células por Y com tolerância, ordena por X e delimita colunas por cabeçalhos explícitos Data/Descrição ou equivalente/Valor. Sem cabeçalhos suficientes, preserva ordem visual e separa somente fronteiras claras entre transações completas: valor monetário seguido de nova data. Sufixo de parcela antes do valor permanece junto à compra. Seções/cabeçalhos separados por grande distância delimitam blocos; itens não associados continuam emitidos para revisão, sem descarte. Não há garantia de reconstruir layouts desconhecidos.

Totais explícitos podem ser associados a valor único na mesma linha visual, incluindo célula R$ separada e texto lateral, mantendo o texto restante. Múltiplos valores ou associação insegura continuam ambíguos. A classificação de oferta/futuro, pagamentos, estornos e limites permanece no núcleo; não se escolhe automaticamente um total para fazer a soma coincidir. O fluxo posicional é habilitado somente para PDF Itaú no importador e no auditor.

A revisão individual oferece período inicial/final e confirmação explícita de que ele vale para as datas originais dos lançamentos. Não preenchido pelo vencimento, competência ou data atual. Intervalos inválidos ou acima de 366 dias são recusados; uma data DD/MM com mais de um ano possível continua pendente. Aplicar o período refaz a revisão e invalida o aceite; a interface informa que correções individuais ainda não salvas serão substituídas. Alterar o período bloqueia salvar até reprocessar. Metadados de origem do período ficam somente no armazenamento/backup local, com validação na restauração. IndexedDB continua em claro.

### Execução local protegida

Usar o mesmo wrapper do checkout autorizado. Sem opções adicionais, audita a nova extração mantendo anos incertos em revisão. Se o proprietário puder confirmar o período aplicável às datas originais, adicionar **-ReviewPeriod**. O wrapper pede datas e confirmação SIM apenas no terminal local. Não informar esse período ou senha no chat. Senha e período seguem por JSON na entrada privada do processo, nunca por argumentos, arquivo temporário ou saída do auditor. O resultado inclui comparação sem período e os contadores com período confirmado. Se não houver evidência para confirmar o período, omitir a opção e corrigir datas individualmente.

Retornar apenas JSON agregado: engine, transactions, exceptions, reconciliation, installmentPurchases, dateContext, coverage e métricas de layout. Critérios permanecem: total efetivo reconhecido, conciliação exata, parcelas coerentes, zero candidatas fora da revisão e validação física posterior. Redução das exceções não constitui aprovação.

### Testes e ambiente

123 testes aprovados (113 casos anteriores + 10 novos; nenhum caso removido). Novos testes: células posicionadas fora de ordem; duas tabelas com ofertas/compras; parcelas versus novas datas; total com moeda separada e valor ambíguo; período confirmado e anos ambíguos; revisão da interface sem escrita automática; auditor protegido; PDF binário sintético com elementos posicionados extraídos pelo PDF.js; backup com período inválido; CLI com senha/período somente via stdin. Esses testes representam separação de células e padrões informados de forma agregada, não reproduzem o documento real.

Pacote privado exclusivamente sintético regenerado, anterior preservado: 226 arquivos/12 exemplos exatos, banco isolado e cache **074bc5a33b855aa5**. Arquivos core.js/intelligence.js/pdf-reader.mjs/storage.js/assets.js/sw.js comparados por HTTPS válido. Preview somente 127.0.0.1:43189, Serve privado e Funnel falso. Nenhum IndexedDB apagado. Nova auditoria real protegida e testes no iPhone permanecem pendentes. Main preservada, sem deploy público.
