# Reforça faturas locais, segurança e homologação sintética do PWA

O protótipo original não inicializava por declarações duplicadas. A evolução preserva seu IndexedDB, categorias, despesas, resumos e visual, acrescentando cartões, revisão local PDF/CSV com conciliação atômica, projeções e divisão familiar. Backup criptografado e demonstrativos individuais não dependem de serviços externos.

Esta rodada corrige lacunas intermediárias de projeção, propagação retroativa de divisão, reconhecimento de créditos, revisão obsoleta e ambiguidades CSV. Reforça staging/envelope de backup, bloqueio síncrono/por inatividade e confirmação de compartilhamento compatível com ativação por toque. Separa banco/cache da demo para evitar abertura acidental do banco principal. Não migra nem apaga dados.

Validação: **63 testes aprovados**, com quatro CSVs e quatro PDFs binários sintéticos, 306 cenários de divisão, conciliação/duplicidades, persistência/migração, backup adulterado e integração DOM. Auditoria de dependências de produção sem avisos conhecidos. IndexedDB/DOM/service worker usam simulações; extração usa PDF.js real. Evidência em docs/TESTES.md e docs/test-output-homologacao.txt.

Manter **draft**: pendem revisão visual, Safari/iPhone físico, offline real, seletor de compartilhamento/impressão e validação autorizada dos layouts comerciais. IndexedDB não é criptografado; trava é barreira casual. Sem deploy, alteração de main ou de visibilidade. Roteiro manual em docs/HOMOLOGACAO_IPHONE.md; limites em docs/SEGURANCA.md e docs/USO.md.
