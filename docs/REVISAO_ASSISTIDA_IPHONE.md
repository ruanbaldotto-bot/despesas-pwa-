# Revisão assistida — roteiro no iPhone

Ambiente privado e exclusivamente sintético. Esta etapa não aprova o leitor Itaú real.

1. Ative o Tailscale, abra o endereço privado já fornecido no Safari e recarregue online. Feche todas as janelas do Jabu e o aplicativo instalado; reabra para ativar o novo service worker. Não apague dados do site nem o IndexedDB. O cache desta entrega é `a66f4fe5fd92fbe4`.
2. Em Importar, expanda **Arquivos fictícios para testar importação** e toque **Abrir revisão assistida fictícia (sem salvar)**. O exemplo é preparado em memória: não importa PDF e não modifica o banco existente.
3. Toque **Selecionar pendentes de data**, escolha **Lançamentos atuais** e informe início `2030-12-01` e fim `2031-01-31`, somente neste exemplo fictício. Prepare a prévia: devem aparecer duas compras, em anos diferentes, parcelas 2/10 e 1/4, competência 2031-01. Nada deve mudar antes da confirmação.
4. Desmarque uma compra na prévia e confirme apenas a outra. A exceção deve continuar pendente. Selecione-a e repita. Experimente corrigir uma data individualmente e reabrir uma decisão; nenhuma compra deve duplicar. Mudanças de período/seleção devem invalidar a prévia anterior.
5. A soma das duas compras deve ter diferença de **0 centavos**, mas Salvar deve continuar bloqueado: existem dois escopos desconhecidos.
6. Limpe a seleção, marque somente a linha fictícia 12 e classifique **Parcelas futuras — somente conferência**, com justificativa. Prepare, confira e confirme. Repita somente para a linha 14 como **Conteúdo informativo**, com justificativa. Não selecione ambas como um único escopo. Essas decisões não criam compras nem mudam os cinco totais.
7. Confira zero pendências, zero diferença atual e conferência futura consistente. Altere temporariamente o total em um centavo: o salvamento deve ser bloqueado. Restaure o total fictício e confira novamente. Não é necessário salvar o exemplo para testar a interface.
8. Verifique campos de data, teclado, rolagem, checkboxes, menus e botões sem sobreposição em Safari e app da Tela de Início. Registre resultado/observação de cada passo, sem enviar conteúdo financeiro.

Para documentos autorizados: forme grupos pequenos apenas quando houver evidência documental do período original. Compras parceladas podem ter anos diferentes. Use exceções individuais; nunca deduza o ano pelo vencimento. Confira o escopo de cada registro desconhecido, parcela atual/total, valor e competência antes de confirmar. Resumos futuros não são novas compras. A confirmação final exige conciliação exata e projeção conferida quando há resumo futuro.

A revisão não salva rascunhos: recarregar/fechar perde decisões ainda não salvas. Os registros já salvos permanecem. Faça backup antes de uma importação definitiva. IndexedDB permanece em claro; trava de tela não equivale a criptografia. Tailscale limita o acesso de rede, mas não protege contra acesso local ao navegador.

## Evidência desta entrega

157 testes automatizados sintéticos aprovados (147 anteriores + 10). Navegador integrado: prévia com dois anos, confirmação, zero diferença e bloqueio por escopos pendentes observados. Nenhuma compra foi salva nessa conferência. Captura em `evidencias/revisao-assistida/previa.png`.

Motor `jabu-audit-9`, fingerprint SHA-256 `dfe00ee5efe99a06761db90d93bc484fd8a38cffb73dbcd009c6d1d7f85ae2bf`. O fingerprint identifica o motor; o cache identifica os recursos web.

Validação física de iPhone e revisão dos 90 candidatos/50 parcelas reais continuam pendentes. As 52 ocorrências de escopo desconhecido exigem decisão documental; não foram classificadas automaticamente. Os cinco totais reconhecidos pelo motor 8 foram preservados. A cobertura financeira do parser permanece protegida pelos testes; a auditoria real não foi repetida nesta entrega.
