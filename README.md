# Jabu — Suas finanças com mais raízes

PWA financeiro local, evolução do protótipo na feature/fatura-inteligente. Identidade própria, SVGs e ícones locais; dashboard, cartões pessoais/compartilhados, importação revisada, projeções e divisão familiar.

Seis instituições: Santander, Porto Bank, Mercado Pago, Nubank, Itaú e Bradesco/Bradescard. PDF protegido com senha temporária. Validação exclusivamente sintética, sem PDFs reais; revisão humana obrigatória. IndexedDB em claro; somente backup exportado criptografado, com trava visual opcional.

**77 testes aprovados**. Navegador integrado verificado a 320/390px. Safari físico, instalação, offline completo e compartilhamento nativo pendentes. Sem deploy nem alteração da main.

- [Relatório e roteiro iPhone](docs/JABU_HOMOLOGACAO.md)
- [Design](docs/JABU_DESIGN_SYSTEM.md), [arquitetura](docs/ARQUITETURA.md), [segurança](docs/SEGURANCA.md)
- [Uso](docs/USO.md), [importação](docs/IMPORTACAO.md), [instalação](docs/INSTALACAO.md), [testes](docs/TESTES.md)
- [PR draft](https://github.com/ruanbaldotto-bot/despesas-pwa-/pull/1), [publicação](docs/PUBLICACAO_GITHUB.md)

Desenvolvimento: node tools/sync-core.cjs; node tools/vendor.cjs; node tools/build-demo.cjs; node --test tests/*.test.cjs (runner do script npm test). Prévia: node tools/preview.cjs. Não usar dados reais na demo/Git.
