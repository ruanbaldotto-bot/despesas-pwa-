# Auditoria — 18/10/2026

Origem: ruanbaldotto-bot/despesas-pwa-, branch principal main, commit inicial 1c7ed03. Cópia completa do histórico preservada; desenvolvimento em feature/fatura-inteligente. O projeto Apps Script da pasta superior é independente e não foi alterado.

Foram lidos index.html, app.js, styles.css, manifest.json e sw.js; enumerados os ícones binários e os caminhos de todas as revisões. O histórico possui 34 commits e inclui imagens de marca removidas e um workflow Pages removido. Busca textual por credenciais e identificadores encontrou somente o uso legítimo de id-token no workflow antigo. Isso não constitui prova de ausência de dados pessoais nas imagens ou segredos fora dos padrões pesquisados. Não foram enviados dados de usuários a serviços.

## Estado inicial

`node --check app.js` falha: DB_NAME, DB_VERSION e db declarados duas vezes. Também há duas implementações de openDB e buildPreview; a última buildPreview contorna a rotina de idempotência. A rotina de salvar separa invoice/blob/compras em transações independentes. Importador altera letras para números, inventa dia 1 e parcela inicial, descarta pagamentos/estornos/juros e limita datas a 28. Conversão de entrada decimal remove pontos e pode multiplicar valores por 100. innerHTML recebe nomes/notas/documentos sem escape. CSV sem quoting e proteção contra fórmulas. Exclusão física de cartão perde associação de negócio.

## Inventário reaproveitável

Abas, layout escuro responsivo, categorias com orçamento/edição/exclusão, despesas em dinheiro, resumo por categoria, cadastro de cartões, revisão de fatura, exportação CSV, IndexedDB e ícones/manifest/service worker. Ausência de handler de cadastro de categorias no estado inicial. Instalação tem metadados Apple, mas botão beforeinstallprompt não atende Safari. Cabeçalho não considera safe area; inputs pequenos podem ampliar no iOS.

## Dados e privacidade

Banco despesasDB v4: expenses, categories, cards, invoices (índice hash único), blobs. Valores legados em reais de ponto flutuante; datas ISO timestamp; cartões frequentemente identificados apenas pelo nome. PDFs guardados sem criptografia. CDN de PDF.js externa e caminho clássico incompatível com distribuição modular v4. Service worker armazena qualquer resposta e remove caches alheios na ativação. Não havia backup, bloqueio, testes nem política de atualização.

## Plano

Manter HTML/CSS/JS e as stores existentes. Evoluir esquema sem apagar dados; acrescentar eventos imutáveis para família/pagamentos/atribuições e centavos nos novos registros. Importação local com conciliação obrigatória e transação única; datas desconhecidas bloqueiam confirmação. PDF.js distribuído localmente, sem CDN. Backup criptografado e trava de tela opcional, com limites explícitos. Sem deploy, sem mudança de visibilidade. Repositório público: proprietário deve avaliar torná-lo privado caso o histórico contenha material sensível; visibilidade não protege o armazenamento no dispositivo.
