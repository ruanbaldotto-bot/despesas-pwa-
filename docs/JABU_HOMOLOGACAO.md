# Diagnóstico local dos leitores — rodada atual

95/95 testes aprovados. Quatro PDFs reais auditados estritamente localmente com saída agregada: nenhum foi conciliado/aprovado automaticamente. Itaú protegido e Nubank/CSVs ainda pendentes. Revisão individual, alertas agrupados, validação monetária e extração por coordenadas implementadas. [Matriz e limites](HOMOLOGACAO_LEITORES_REAIS.md).

---

# Correção de importação iOS — rodada atual

85/85 testes aprovados, incluindo os 80 anteriores. Causa reproduzida na iteração assíncrona de ReadableStream dentro de getTextContent; correção local por getReader e fallback FileReader. Pacote privado/cache atualizados. Nova validação no iPhone ainda pendente. [Relatório e atualização](CORRECAO_IMPORTACAO_IOS.md).

---

# Preparação visual/iPhone — rodada atual

80/80 testes aprovados (77 anteriores + 3 novos), 18 capturas em dimensões de iPhone e recarga com servidor local desligado. Sem teste em aparelho físico ou deploy. Relatório e instalação: [HOMOLOGACAO_VISUAL_IPHONE.md](HOMOLOGACAO_VISUAL_IPHONE.md). Log: test-output-iphone.txt.

---

# Jabu — homologação de 18/10/2026

Continuação de 40aa4c5 na branch feature/fatura-inteligente, preservando o histórico iniciado em 318c3f5. Identidade publicada em 50c77b5. PR draft: https://github.com/ruanbaldotto-bot/despesas-pwa-/pull/1. Sem merge, deploy público ou uso de documentos financeiros reais.

## Resultado automatizado

77 testes aprovados, zero falhas, ignorados ou cancelados. Os 63 testes anteriores permanecem; a expansão cobre dois bancos adicionais, detecção, PDF protegido, metadados, navegação e integração das telas. Log completo em test-output-jabu.txt. npm test foi tentado, mas npm não existe neste ambiente; executado o mesmo runner definido no package.json: node --test tests/*.test.cjs.

Seis bancos com dados sintéticos: Santander, Porto Bank, Mercado Pago, Nubank, Itaú e Bradesco/Bradescard. CSV e PDFs binários sintéticos exercitam extração pelo PDF.js, conciliação, pagamentos, estornos, parcelas, duplicidades e projeções. PDF protegido utiliza senha aleatória em memória; verificados sucesso, senha ausente/incorreta e limpeza. Backup AES-GCM, adulteração, conflitos de restauração, persistência e divisão familiar com pagamentos parciais continuam cobertos. Mocks de DOM/armazenamento/service worker não equivalem a homologação bancária, Safari ou Google.

## Navegador realmente executado

Navegador integrado, origem loopback e demo com banco separado. Cadastro de cartão Itaú sintético, seleção de CSV pelo seletor real, leitura de três linhas, conciliação, confirmação, gravação e recarga com persistência. Total líquido importado aparece no dashboard/cartão; projeção de despesas permanece separada. Navegação nas cinco telas principais em viewport de 320 px sem transbordamento horizontal; importação e telas em 390 px. Evidência em evidencias/jabu-geometria-320.json e capturas JPEG. Isso mede layout de navegador desktop estreito, não emula Safari iOS nem teclado/safe area físicos.

## Falhas corrigidas

Total do dashboard usava somente despesas e ignorava pagamentos do saldo da fatura importada; passou a usar o saldo conciliado quando disponível. Corrigidos contraste do texto secundário no cabeçalho e nomes acessíveis dos campos. Revisão agora é invalidada ao trocar arquivo, cartão ou competência. Senha de PDF é retirada do campo antes de operações assíncronas, sem persistência. Parcelas entre parênteses e créditos com sufixo bancário são reconhecidos pelos adaptadores específicos; propostas de financiamento e resumos futuros não viram compras.

## Limites e próxima homologação

Não foram fornecidos PDFs reais autorizados Itaú/Bradesco. Os adaptadores foram validados com cenários representativos sintéticos, não certificados pelos bancos. Datas sem ano exigem correção/revisão; não se adivinha ano. PDFs digitalizados sem texto não têm OCR. Formatos desconhecidos devem falhar ou ser revisados antes de salvar. Totais futuros são informativos e não criam projeções duplicadas.

Safari físico, instalação, ciclo completo offline e compartilhamento nativo continuam pendentes. IndexedDB fica em claro; a trava visual não oferece isolamento contra acesso ao perfil, scripts da origem ou aparelho comprometido. Backup criptografado protege o arquivo exportado, não o banco local. Não existe promessa de Face ID ou apagamento seguro de memória JavaScript.

## Roteiro objetivo no iPhone

1. Usar somente a demo sintética em origem HTTPS autorizada; este trabalho não publicou hospedagem. Registrar modelo, iOS e Safari.
2. Abrir no Safari, adicionar à Tela de Início e abrir pelo ícone; conferir nome, recorte maskable, barras e safe areas.
3. Nas cinco telas, testar toque, rotação, zoom, VoiceOver, teclado e campos monetários sem corte ou rolagem horizontal.
4. Importar cada CSV/PDF sintético pelo app Arquivos; conferir banco, créditos, parcelas e total. Testar PDF protegido com senha temporária correta/incorreta e confirmar campo limpo. Não usar documentos reais sem autorização.
5. Confirmar importação, fechar/reabrir; ativar modo avião após carregar todos os recursos; abrir novamente, navegar, consultar e importar arquivos locais. Registrar falhas de cache/evicção.
6. Atribuir compras a duas pessoas, registrar recebimento parcial, conferir centavos e demonstrativos individuais. Abrir compartilhar, verificar destinatário/conteúdo e cancelar; validar impressão e fallback de arquivo sem envio real.
7. Exportar backup criptografado, testar senha incorreta e restaurar em perfil de teste separado; testar conflitos sem sobrescrita. Guardar senha fora do aplicativo.
8. Ativar trava, alternar apps/aguardar inatividade, conferir ocultação; confirmar os limites descritos em SEGURANCA.md. Registrar aprovado/reprovado e captura exclusivamente sintética por item.
