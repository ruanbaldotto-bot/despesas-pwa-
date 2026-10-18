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
