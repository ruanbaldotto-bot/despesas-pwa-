# Jabu — Evolução do PWA financeiro, identidade visual e novos bancos.

Evolui o PWA a partir de 40aa4c5, preservando histórico, armazenamento e regras financeiras. Identidade com tokens, SVGs próprios e ícones; dashboard, cartões pessoais/compartilhados, importação revisada, gráficos de composição e família integrados aos dados existentes.

Adaptadores separados Itaú e Bradesco/Bradescard com detecção conservadora, parcelas entre parênteses, créditos e resumos futuros informativos. PDF protegido usa senha temporária sem persistência. Corrigidos saldo líquido do dashboard, invalidação da revisão e nomes acessíveis de campos.

77 testes aprovados, incluindo os 63 anteriores. CSV/PDF sintéticos de seis bancos, PDF protegido com senha aleatória, conciliação, projeção, família, backup e persistência. npm ausente; executado node --test tests/*.test.cjs, mesmo runner do script. Sync, recursos e demo regenerados. Navegador integrado: seletor real, gravação/recarga e cinco telas sem transbordamento em 320px; capturas em 390px.

Sem PDFs bancários reais autorizados ou certificação de layouts. Safari físico, instalação, offline completo e compartilhamento nativo pendentes no roteiro docs/JABU_HOMOLOGACAO.md. IndexedDB em claro e trava visual; backup protege somente arquivo exportado. Sem deploy, merge, dados reais ou alteração de main. Manter draft até homologação humana.


## Preparação visual e iPhone

80 testes aprovados (77 existentes + 3 novos). Capturas das seis telas a 375/390/430px, sem transbordamento horizontal. Ajustados resumos familiares, nomes longos, métricas móveis, nomes acessíveis e atualização do aviso de service worker. PDF sintético lido no navegador; recarga com servidor desligado preservou dados e consulta familiar.

Pacote isolado gerado por tools/build-homologacao.cjs, com banco/canal próprios, seis cartões e duas pessoas fictícias, arquivos de exemplo offline e cabeçalhos preparados para Cloudflare Pages Direct Upload manual. Sem integração Git/deploy automático. Alternativa privada Tailscale Serve documentada. Nada publicado; Safari físico/compartilhamento nativo pendentes. Evidências e roteiro em docs/HOMOLOGACAO_VISUAL_IPHONE.md. Manter Draft.


## Preparação privada Tailscale

Verificador do pacote por allowlist/hash e comparação exata das 12 fixtures; marcador .gitkeep excluído da saída. 80 testes aprovados. Servidor somente em loopback e rotas do repositório recusadas. Cliente oficial instalado com autorização, autenticação feita pelo proprietário. HTTPS/Serve e restrições finais ainda dependem de confirmar tailnet e conectar iPhone; Funnel não configurado. Não registrar URL privada ou identidade no Git. Operação e checklist em docs/TAILSCALE_PRIVADO.md e docs/IPHONE_REGISTRO_HOMOLOGACAO.md. Sem deploy público, main preservada.


Atualização privada concluída: iPhone online na mesma conta, Serve HTTPS 443 ativo com proxy único para 127.0.0.1:43189 e Funnel ausente/falso. Regra geral ampla substituída por iPhone específico (IPv4/IPv6) → computador Jabu, somente tcp:443; filtro recebido confirmado. Certificado Let’s Encrypt válido e HTTP 200 sintético verificados no computador. URL/IPs/identidade permanecem fora do Git. Safari físico e teste negativo de terceiro aparelho continuam pendentes. Servidor e Serve mantidos disponíveis.


## Correção real de importação WebKit

Reproduz TypeError de PDFPageProxy.getTextContent no PDF.js 6.4.299 sem ReadableStream asyncIterator. Extrai texto por getReader().read(), preservando limites/worker e sem alterar vendor ou adicionar polyfill global. Novo leitor local usa FileReader quando File.arrayBuffer não existe, decodifica CSV e reaproveita bytes no PDF. Sem conteúdo/senhas nos logs ou envio de arquivos.

85 testes aprovados (80 anteriores + 5 regressões), incluindo PDF real/senha e CSV sem iterador/métodos modernos, revisão e conciliação. Pacote sintético privado regenerado preservando o anterior; cache novo confirmado após fechar/reabrir cliente. PDF e CSV separados verificados no navegador integrado por HTTPS. Funnel continua desativado, main preservada. A correção no iPhone aguarda nova execução física. Relatório: docs/CORRECAO_IMPORTACAO_IOS.md.


## Diagnóstico local de leitores e revisão individual

95 testes aprovados (85 anteriores preservados + 10 regressões sintéticas). Extração PDF agrupa células por coordenadas e recusa possíveis transações de colunas sobrepostas. Texto informativo agrupado; exceções financeiras exigem correção individual ou exclusão justificada, bloqueando salvamento mesmo com total coincidente. Correção monetária CSV para moeda brasileira/negativos/aspas/separador explícito, sem aceitar valores ambíguos. Ajustes de status bar/safe area para nova validação iOS.

Quatro PDFs autorizados auditados somente em processos locais, sem texto/valores/senhas no modelo, relatórios ou Git. Nenhum deles conciliou automaticamente: leitores reais permanecem pendentes. Itaú aguarda senha em prompt local; Nubank/CSVs não disponíveis. Não declarar homologação completa. Matriz agregada em docs/HOMOLOGACAO_LEITORES_REAIS.md. Ambiente atualizado contém exclusivamente dados sintéticos, sem alteração de main ou deploy público.

## Itaú — investigação complementar pendente

Auditoria agregada do proprietário: uma transação, 156 exceções e total não reconhecido. Acrescentado diagnóstico estritamente local com contagens fixas para separar datas curtas, possíveis parcelas, possíveis colunas mescladas, seções e posição do total. Sem saída de conteúdo, datas, valores ou identificadores. 98 testes sintéticos aprovados (95 preservados + 3). A correção do adaptador aguarda nova execução local protegida; não há homologação real concluída nem alteração do pacote privado nesta etapa. Manter Draft.

## Itaú — correção direcionada e validação pendente

Datas curtas exigem seção de transações e período explícito único, sem usar o ano atual ou vencimento. Reconstrói fragmentos limitados, preserva parcelas válidas de compras e impede projeções de créditos/pagamentos. Rótulos de total com moeda e valor na célula seguinte aceitos; totais de ofertas e conflitos não viram valor devido. Casos ambíguos continuam para revisão; não há reconstrução especulativa de colunas ou compensação financeira.

106 testes aprovados (98 preservados + 8 sintéticos, incluindo PDF protegido). Auditor local acrescenta contexto temporal, contagem de compras parceladas e cobertura de linhas financeiras sem emitir conteúdo/valores/datas/senha. Última auditoria real anterior à alteração: 1 transação, 156 exceções, total ausente; nova execução protegida solicitada. Não declarar leitor homologado. Pacote exclusivamente sintético atualizado no HTTPS privado, anterior preservado, cache novo e Funnel falso verificados no computador; iPhone físico pendente. Main preservada, sem deploy público. Manter Draft.
