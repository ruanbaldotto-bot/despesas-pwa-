# Despesas — evolução incremental para fatura inteligente

PWA local baseado no protótipo existente, preservando IndexedDB, categorias, despesas, resumos e visual. Desenvolvimento na branch feature/fatura-inteligente; não houve deploy nem alteração da branch principal.

Foram acrescentados cartões com edição/arquivamento e quatro bancos, revisão local de PDF/CSV com conciliação e deduplicação atômica, projeções rastreáveis, divisão familiar, pagamentos e demonstrativos individuais, backup criptografado e trava de tela opcional.

Consulte [auditoria](docs/AUDITORIA.md), [arquitetura](docs/ARQUITETURA.md), [instalação](docs/INSTALACAO.md), [uso e limitações](docs/USO.md), [segurança](docs/SEGURANCA.md) e [testes](docs/TESTES.md).

Leitura de layouts bancários é conservadora e requer revisão humana. Dados locais não são criptografados; somente o backup é. Offline, aparência, compartilhamento e instalação em iPhone real ainda precisam de homologação. Nenhum dado financeiro real foi acrescentado aos arquivos.

Rodada adicional: 63 testes aprovados; correções de projeção, propagação, backup, trava e compartilhamento. Veja [relatório atual](docs/HOMOLOGACAO_2.md), [resolução de acesso GitHub](docs/PUBLICACAO_GITHUB.md) e [roteiro Safari/iPhone](docs/HOMOLOGACAO_IPHONE.md).
