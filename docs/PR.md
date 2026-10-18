Jabu importa e revisa faturas localmente, confere valores em centavos, projeta parcelas e organiza divisão familiar. O pacote privado de homologação usa exclusivamente dados sintéticos em banco separado.

### Revisão assistida Itaú

Datas curtas e escopos ambíguos permanecem pendentes. O usuário seleciona grupos, informa período com evidência documental e confere a prévia de cada compra, parcela e competência antes de aplicar. Pode desmarcar exceções, corrigir individualmente e reabrir decisões. Anos não são inferidos pelo vencimento.

Classificações explícitas de futuros, pagamentos anteriores e informações exigem motivo, preservam os cinco totais e não criam compras. A confirmação final verifica pendências, duplicidades, soma exata em centavos e conferência dos resumos futuros. Decisões são gravadas na mesma transação da fatura; rascunhos de revisão permanecem somente em memória.

### Validação e limites

157 testes sintéticos aprovados, incluindo os 147 anteriores e dez regressões de revisão por grupos, exceções individuais, escopos, conciliação, projeção, salvamento e restauração. Navegador integrado: prévia com duas compras em anos diferentes e bloqueio por escopos pendentes mesmo com diferença zero. Captura sintética e roteiro em docs/REVISAO_ASSISTIDA_IPHONE.md.

Última auditoria real recebida, motor 8: cinco referências conferidas, 90 candidatos/50 parcelas aguardando data, 168 exceções, 52 escopos desconhecidos e zero candidatas fora da revisão. Conciliação e projeção reais continuam pendentes; motor 9 não foi homologado no iPhone.

Pacote privado atualizado com anterior preservado, allowlist e banco isolado verificados. Serve encaminha apenas ao loopback, Funnel desativado. Sem deploy público ou alteração de main. IndexedDB em claro e trava casual continuam limitações. Manter PR Draft.
