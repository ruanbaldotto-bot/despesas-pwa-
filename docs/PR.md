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
