# Entrega — 18/10/2026

## Situação

Evolução incremental implementada localmente na branch `feature/fatura-inteligente`, a partir de `main`/1c7ed03. Commit de implementação: 318c3f5. Histórico original preservado. Projeto Apps Script da pasta superior não alterado. Sem deploy, mudança na main, mudança de visibilidade ou inclusão de dados financeiros reais.

## Funcionalidades implementadas

- Cartões dos quatro bancos, edição, arquivamento, fechamento/vencimento, final de quatro dígitos e limite opcional.
- Leitura local PDF/CSV; revisão de texto, exclusão de linha e seleção de categoria, identificação conservadora de parcelas/créditos/pagamentos, total explícito ou conferido, bloqueio de diferença e duplicidade; commit único para fatura/compras.
- Projeção 3/6/12/24, composição por mês, filtros por cartão/pessoa, parcelas e recorrências explícitas, grupo manual com preservação de vínculos, separação confirmado/estimado.
- Pessoas, atribuição individual ou em lote, divisão por centavos/percentuais, distribuição determinística de resíduos, propagação por grupo confirmado.
- Demonstrativo por pessoa, saldo e recebimentos parciais, histórico separado de pagamentos ao banco; compartilhamento de texto mediante confirmação; impressão isolada para PDF pelo sistema.
- Backup criptografado, staging e restauração atômica sem sobrescrita, trava de tela opcional com limites expostos, CSP, escape e exportação CSV protegida.
- Migração não destrutiva v4/v5, dependência PDF local, cache restrito e versão por conteúdo, ajustes CSS mobile e documentação.

Reaproveitados: estrutura de abas, estilo escuro, ícones, manifest, banco e suas cinco stores, categorias/orçamentos, despesas em dinheiro, resumo por categoria e exportação. Declarações e rotinas duplicadas/substituídas foram removidas por impedirem inicialização ou contornarem segurança de importação.

## Arquivos

Principais existentes: app.js, index.html, styles.css, manifest.json, sw.js. Novos: Core.gs e derivados core.js/CoreClient.html, storage.js, intelligence.js, pdf-reader.mjs, assets.js, ferramentas, cinco arquivos de testes, dependências/lockfile e documentação. vendor contém PDF.js, mapas, fontes e licenças, para evitar CDN. Lista completa: `git diff --name-only main...feature/fatura-inteligente`.

## Evidência e limites

37 testes Node aprovados. DOM e IndexedDB são simulados; extração de PDF binário sintético usa biblioteca real. Sem homologação Google. Revisão visual bloqueada pelo timeout do navegador integrado para a prévia local; sem testes em iPhone físico, Safari, offline real, compartilhamento ou impressão pelo sistema. Detalhes e resultados: TESTES.md e test-output.txt. Roteiro no aparelho: INSTALACAO.md.

Layouts bancários comerciais precisam de homologação autorizada. Sem OCR, inferência de datas ausentes, biometria nativa, criptografia do banco local, sincronização entre dispositivos ou PDF anexável gerado diretamente. Trava de tela pode ser contornada por acesso ao navegador/origem. Outras pendências de edição/correção de pagamentos, grupos e exclusão legada estão em USO.md. Não se deve tratar a versão como homologada para finanças reais antes dessas validações.

## Pull request bloqueado por autenticação/permissão

Git push sem interação falhou porque não há credencial disponível. O conector GitHub leu o repositório, mas criar blob e criar branch retornaram HTTP 403 “Resource not accessible by integration”. Nenhuma branch remota ou PR foi criado. Não houve rejeição de revisão automática; a recusa veio do GitHub.

Para concluir: autenticar o Git no GitHub ou conceder escrita à integração. Em seguida enviar `feature/fatura-inteligente` e abrir PR para `main`, preferencialmente draft pelas homologações pendentes. A descrição pronta está em PR.md. Não colocar tokens em arquivos, linha de comando, frontend ou chat.

Estado posterior: a continuação do desenvolvimento e a bateria de 63 testes estão registradas em [HOMOLOGACAO_2.md](HOMOLOGACAO_2.md). Esta página preserva o registro da primeira entrega.
