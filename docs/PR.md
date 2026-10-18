# Jabu — Evolução do PWA financeiro, identidade visual e novos bancos.

Evolui o PWA a partir de 40aa4c5, preservando histórico, armazenamento e regras financeiras. Identidade com tokens, SVGs próprios e ícones; dashboard, cartões pessoais/compartilhados, importação revisada, gráficos de composição e família integrados aos dados existentes.

Adaptadores separados Itaú e Bradesco/Bradescard com detecção conservadora, parcelas entre parênteses, créditos e resumos futuros informativos. PDF protegido usa senha temporária sem persistência. Corrigidos saldo líquido do dashboard, invalidação da revisão e nomes acessíveis de campos.

77 testes aprovados, incluindo os 63 anteriores. CSV/PDF sintéticos de seis bancos, PDF protegido com senha aleatória, conciliação, projeção, família, backup e persistência. npm ausente; executado node --test tests/*.test.cjs, mesmo runner do script. Sync, recursos e demo regenerados. Navegador integrado: seletor real, gravação/recarga e cinco telas sem transbordamento em 320px; capturas em 390px.

Sem PDFs bancários reais autorizados ou certificação de layouts. Safari físico, instalação, offline completo e compartilhamento nativo pendentes no roteiro docs/JABU_HOMOLOGACAO.md. IndexedDB em claro e trava visual; backup protege somente arquivo exportado. Sem deploy, merge, dados reais ou alteração de main. Manter draft até homologação humana.


## Preparação visual e iPhone

80 testes aprovados (77 existentes + 3 novos). Capturas das seis telas a 375/390/430px, sem transbordamento horizontal. Ajustados resumos familiares, nomes longos, métricas móveis, nomes acessíveis e atualização do aviso de service worker. PDF sintético lido no navegador; recarga com servidor desligado preservou dados e consulta familiar.

Pacote isolado gerado por tools/build-homologacao.cjs, com banco/canal próprios, seis cartões e duas pessoas fictícias, arquivos de exemplo offline e cabeçalhos preparados para Cloudflare Pages Direct Upload manual. Sem integração Git/deploy automático. Alternativa privada Tailscale Serve documentada. Nada publicado; Safari físico/compartilhamento nativo pendentes. Evidências e roteiro em docs/HOMOLOGACAO_VISUAL_IPHONE.md. Manter Draft.
