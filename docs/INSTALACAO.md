# Instalação e teste no iPhone

Nenhum deploy foi realizado. Para instalar no telefone é necessário um endereço HTTPS autorizado que sirva os arquivos do PWA; abrir index.html como arquivo não fornece os recursos necessários. A prévia local de desenvolvimento não é acessível ao iPhone por 127.0.0.1.

## Desenvolvimento local

Requer Node.js recente (testado em 24.19.0) e pnpm ou npm.

1. Instale dependências com `pnpm install --frozen-lockfile` (lockfile versionado). Alternativamente `npm install` resolve as versões diretas fixadas, mas não utiliza o lockfile pnpm.
2. Execute `node tools/sync-core.cjs` e `node tools/vendor.cjs`.
3. Execute `npm test` ou `pnpm test`.
4. Execute `node tools/build-demo.cjs` depois de alterações de regras/interface. A demo inicia vazia e não contém dados pessoais.
5. Execute `node tools/preview.cjs` e abra http://127.0.0.1:4173 no navegador da mesma máquina.

Não exponha a pasta inteira como servidor genérico, pois inclui Git e arquivos de desenvolvimento. O servidor fornecido serve somente arquivos de aplicação. A cópia em demo é gerada e ignorada no Git.

## Roteiro em dispositivo real, pendente

1. Após disponibilização HTTPS autorizada, abra no Safari → Compartilhar → Adicionar à Tela de Início. Não há botão de instalação automática no Safari.
2. Abra pela Tela de Início e cadastre cartão e familiar fictícios. Importe um CSV sintético no formato do exemplo em USO.md; confira total e parcelas.
3. Teste revisão, tentativa de importar de novo, projeções, divisão em lote, recebimento parcial e demonstrativo de cada pessoa.
4. Compartilhe somente texto sintético pelo seletor do sistema; confirme disponibilidade de WhatsApp e cancelamento. Teste Imprimir → ampliar prévia → Compartilhar/Salvar em Arquivos para PDF. Os passos exatos dependem da versão do iOS.
5. Baixe um backup com senha de teste longa, restaure em um contexto vazio e confira os totais. Teste senha errada e conflito, preservando os dados originais.
6. Ative trava com senha de teste, saia/volte ao app e recarregue. Não teste com informações reais antes da homologação.
7. Depois de carregar integralmente com rede, feche o app, habilite modo avião e abra novamente. Verifique abas, gravação, leitura PDF e persistência após reinicialização. A existência do service worker não basta para declarar offline homologado.
8. Confira teclado, fontes, safe areas, largura 320–430px, rolagem das abas, VoiceOver e retorno após bloqueio do aparelho. Verifique atualização fechando todas as abas antigas.

Registro atual: nenhum iPhone físico testado; o navegador integrado também não conseguiu acessar a prévia local. Testes de DOM não substituem revisão visual.
