# Evolui PWA com faturas locais, projeções e divisão familiar

O protótipo não inicializava por declarações duplicadas do banco; a importação possuía handlers conflitantes que contornavam idempotência. Esta mudança corrige a inicialização e evolui os componentes existentes, preservando o IndexedDB legado e o histórico.

Inclui cartões dos quatro bancos, revisão local PDF/CSV com conciliação/deduplicação atômica, projeções de 3/6/12/24 meses com composição, divisão familiar em centavos, demonstrativos isolados, recebimentos e pagamentos bancários separados. Acrescenta backup AES-GCM com restauração sem sobrescrita, trava de tela com limites informados, CSP, proteção de HTML/CSV e PDF.js distribuído localmente.

Validação: 37 testes Node aprovados, incluindo extração de PDF binário sintético, quatro CSVs sintéticos, concorrência/rollback, divisão e arredondamento, pagamentos parciais, privacidade de demonstrativos, persistência/migração v4-v5, backup e integração DOM. IndexedDB/DOM são simulados; não equivalem a Safari/iPhone. Evidência em docs/TESTES.md.

Revisão visual bloqueada pelo acesso do navegador integrado à prévia local. Faltam homologação dos layouts comerciais dos bancos e testes físicos de iPhone, offline, Web Share e impressão/PDF. O banco local não é criptografado; a trava não é autenticação forte. Sem deploy nem alteração de visibilidade. Consulte docs/USO.md, SEGURANCA.md e INSTALACAO.md antes de usar com dados reais.
