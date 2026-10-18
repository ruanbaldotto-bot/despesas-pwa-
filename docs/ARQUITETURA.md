# Decisão de arquitetura — 18/10/2026

Mantido o PWA HTML/CSS/JavaScript original. As abas, categorias, orçamentos, lançamentos em dinheiro, resumos, exportação, IndexedDB e identidade visual continuam como base. Não foi introduzido backend nem serviço contratado. A pasta superior Apps Script/Sheets não integra este PWA e não foi modificada.

## Organização

- `Core.gs` é a fonte das regras puras. `node tools/sync-core.cjs` gera `core.js` (utilizado pelo PWA) e `CoreClient.html`. Nenhum arquivo exige execução Google.
- `app.js` mantém os componentes originais e remove declarações/routines duplicadas que impediam inicialização e idempotência. `intelligence.js` acrescenta os novos fluxos; `storage.js` concentra transações adicionais.
- `pdf-reader.mjs` usa PDF.js 6.4.299, distribuído localmente em `vendor/`, com worker, mapas e fontes. Extração de texto, sem OCR. Dependência Apache-2.0; licenças das fontes/mapas acompanham os arquivos.
- Banco `despesasDB` sobe de v4 para v5, preservando as cinco stores e seus registros; acrescenta `events` e `settings`. Não existe migração destrutiva. Dados legados não são regravados automaticamente; valores legados são convertidos em centavos somente para cálculo, sem recuperar precisão já perdida na origem.
- Novas compras possuem centavos inteiros, versão, cartão, competência e vínculo à fatura. Importação inclui invoice + compras em uma única transação readwrite, inclusive verificação de hash/duplicidades. PDFs novos não são armazenados; blobs legados permanecem e entram no backup.
- Pessoas, atribuições e pagamentos são eventos somente de adição no aplicativo. Sequência transacional define a atribuição mais recente. Cartões e marcação de recorrência preservam versão; associação manual de parcelas usa transação única. Não há tabelas paralelas de saldos.
- Projeções são derivadas, sem gravação; cada mês discrimina compras reais e estimativas. Parcelas futuras repetem o valor da parcela observada; recorrência depende de marcação explícita. Compras de meses distintos só substituem estimativas quando o usuário confirma grupo consistente. Não existe inferência automática de identidade de compra.

## Por que manter PWA

Os módulos usam recursos de plataforma: IndexedDB, Web Crypto, File API, service worker, Web Share e impressão. Uma migração Expo não é necessária para implementar estas regras. Ainda não existe evidência de funcionamento em iPhone real; versões Safari, ciclo de vida, cotas de armazenamento e leitura de PDFs devem ser homologados. Se autenticação biométrica nativa, armazenamento protegido por hardware ou sincronização entre dispositivos se tornarem requisitos, a decisão deve ser reaberta com evidência concreta.

## Limites deliberados

Sem sincronização, autenticação de servidor ou Face ID. A trava local não cria uma fronteira de segurança entre pessoas usando o mesmo aparelho. Impressão/PDF é delegada ao diálogo do sistema e não retorna um PDF anexável automaticamente. Gráfico usa barras e detalhes expansíveis acessíveis, sem biblioteca externa. Adaptadores contemplam cabeçalhos CSV por banco e texto tabular conservador compartilhado para PDF; não representam homologação dos layouts comerciais dos bancos.

## Atualização incremental desta rodada

Eventos novos de atribuição incluem competência de início da propagação; eventos antigos podem recuperá-la pelo lançamento de origem. Sem evidência da competência, a propagação é recusada em vez de aplicada retroativamente. A projeção seleciona, para cada grupo e mês, a observação confirmada mais recente anterior ao mês, cobrindo lacunas intermediárias sem duplicar confirmados; a seleção é pré-calculada para evitar varrer todas as despesas a cada parcela.

A demo usa despesasDemoDB e cache próprio por escopo, sem ler ou copiar despesasDB. Essa separação é operacional; uma página com acesso à mesma origem pode abrir ambos os bancos. Nenhum dado foi migrado ou apagado. Trava e persistência continuam mecanismos de conveniência, sem criptografia de IndexedDB. Consulte o relatório de segurança atualizado antes de uma futura decisão de migração criptográfica.
