Jabu evolui o PWA de despesas para importar e revisar faturas localmente, conferir valores em centavos, projetar parcelas e organizar a divisão familiar. A interface usa a identidade Jabu e o pacote de homologação contém exclusivamente dados sintéticos em armazenamento separado.

### Comportamento implementado

- Leitura local PDF/CSV para seis instituições, com revisão individual, conciliação, controle de duplicidades e projeções. Conteúdo ambíguo exige decisão; documentos/senhas não são enviados a serviços externos.
- Leitura PDF por getReader para contornar a falha de iterador no WebKit. Reconstrução Itaú por coordenadas e escopo de coluna/página; datas curtas preservam campos monetários/parcelas como candidatos, exigindo ano/período confirmado.
- Total explicitamente atual usa o mesmo leitor no detector estrutural e no parser financeiro. Totais de outra composição não são somados ao atual; conflitos permanecem para revisão. Pagamentos anteriores e resumos futuros não geram compras compensatórias ou parcelas duplicadas.
- Auditor protegido com fingerprint de código, senha/referências/período apenas em entrada local e saída agregada. totalTrace identifica rejeições; perfis orientam revisão sem expor conteúdo real.
- Backup criptografado e validação da restauração. IndexedDB permanece em claro e a trava de tela é uma proteção casual, sem garantia de criptografia dos dados locais.

### Validação e pendências

147 testes automatizados aprovados, todos sintéticos, preservando os 139 anteriores e acrescentando oito regressões de total/escopo/conciliação. Cenário com 90 candidatos e 50 parcelas verifica preservação sem ano e promoção somente após período confirmado. PDF protegido exercita o fluxo até conciliação/projeção e as cinco referências sintéticas.

Última auditoria real confirmada: motor 7, 90 candidatos pendentes, 50 parcelas estruturadas, zero registros prontos, 167 exceções e zero candidatas fora da revisão. Quatro referências conferem; total atual e conciliação ainda não aprovados. Motor 8 aguarda nova execução protegida. Homologação bancária completa e Safari/iPhone físico permanecem pendentes; redução de exceções não significa aprovação.

Pacote privado sintético atualizado com anterior preservado, banco isolado e allowlist verificada. HTTPS válido via Tailscale Serve, preview exclusivamente em 127.0.0.1 e Funnel desativado. Nenhum dado de navegador apagado, deploy público ou mudança de main. Manter PR Draft.

Evidências: docs/TESTES.md e docs/HOMOLOGACAO_LEITORES_REAIS.md.
