# Safari iOS — roteiro de homologação manual

Status em 18/10/2026: **pendente em dispositivo físico e em Safari/WebKit real**. O navegador integrado não alcançou a prévia local (ERR_CONNECTION_TIMED_OUT); a porta local também estava ocupada ao tentar iniciar outra instância. Não há evidência visual de responsividade. Os testes jsdom/fake-indexeddb não são emuladores de Safari.

Alvo inicial a avaliar: Safari/iOS 18 ou superior, considerando que a documentação do PDF.js declara suporte parcial a Safari 18+, sem testes automatizados do fornecedor nesse navegador. Isso é referência técnica, não certificação da versão 6.4.299 embarcada. As funções de persistência/compartilhamento são detectadas em tempo de uso; indisponibilidade mantém alternativa de backup/texto e não cria uma promessa de retenção ou envio.

## Preparação

1. Use somente um ambiente HTTPS privado/de teste expressamente autorizado. Nenhum deploy público foi executado. Não habilite acesso externo ao servidor de desenvolvimento por conta desta tarefa.
2. Registre modelo do aparelho, versão do iOS, versão do Safari, URL de origem, commit, data/hora e se a execução é Safari ou Tela de Início. Não registre informações financeiras reais.
3. Execute `node tools/build-demo.cjs` no computador. Ela cria quatro PDFs e quatro CSVs em `demo/faturas-sinteticas/`, todos gerados a partir de fixtures versionadas. Transfira somente esses arquivos para Arquivos no iPhone por um meio escolhido pelo proprietário. Os PDFs são tabelas sintéticas, sem reprodução visual dos documentos oficiais dos bancos.
4. Use pessoas e cartões fictícios; mantenha o banco real fora dessa origem. Não limpe o Safari ou restaure sobre dados reais para realizar estes testes.

## Casos e critérios

| Caso | Procedimento | Resultado esperado |
| --- | --- | --- |
| Instalação | Safari → Compartilhar → Adicionar à Tela de Início; abra pelo ícone. Em versões que oferecem a opção, mantenha Abrir como App. | Abre na origem correta, layout utilizável, sem depender do botão beforeinstallprompt. Compare separadamente os dados no Safari e no app instalado; não suponha compartilhamento de armazenamento. |
| Importação | Cadastre cartão do banco correspondente e anexe cada CSV/PDF pelo seletor Arquivos, competência 2026-10. | Três lançamentos por arquivo; parcelas reconhecidas e créditos/pagamentos negativos. Cabeçalho do PDF aparece como pendência explícita, para conferência. |
| Conciliação | Compare totais líquidos: Santander 93,40; Porto 95,00; Mercado Pago 80,00; Nubank 40,00. Use uma origem limpa ou outro cartão para testar formatos alternativos sem conflito de compras equivalentes. | Salvar bloqueado com total divergente. Revisão obrigatória. Importar o mesmo arquivo de novo não acrescenta dados. |
| Fonte editada | Após conferir uma revisão, altere o texto de entrada. | Aprovação é desmarcada e gravação bloqueada até reprocessar e conferir novamente. |
| Parcelas | Cadastre/importe parcelas 1/4 em outubro e 3/4 em dezembro, do mesmo valor e cartão, confirme grupo. | Outubro/dezembro confirmados; novembro/janeiro estimados; fevereiro sem parcela. Composição corresponde às barras. |
| Família | Divida 100,01 em 50%/50%, depois receba 20,00 de uma pessoa. | Divisão 50,01/50,00; somente a pessoa paga tem o saldo reduzido. Pagamento ao banco não reduz saldo familiar. Nova divisão em novembro não reatribui outubro. |
| Compartilhar | Prepare o demonstrativo A; confira a prévia e toque em Confirmar e abrir compartilhamento. Teste seleção de WhatsApp e cancelamento sem enviar a pessoa real. | Seletor abre a partir do segundo toque. Texto contém somente A e sua parcela. Cancelar não registra envio/pagamento nem gera alerta de falha. Sem Web Share, baixar texto continua disponível. |
| Impressão | Consulte A e use Imprimir / salvar PDF. | Prévia contém somente A. Depois de bloquear a tela, o conteúdo de impressão anterior está vazio. Verifique folhas impressas, não só o texto em tela. |
| Trava | Ative senha de teste de 12+ caracteres; saia/volte, bloqueie aparelho, espere dois minutos sem interação e teste retorno pelo histórico do navegador. | Interface oculta e bloqueada; senha errada não libera. Campos de senha e demonstrativo de impressão são limpos. Observe separadamente se o seletor de apps capturou conteúdo antes do bloqueio; esta proteção não é garantida. |
| Backup | Exporte, teste senha errada, restaure em contexto de teste vazio e compare totais/anexos. Teste conflito de IDs. | Backup legível somente com senha correta; conflito não modifica nenhuma tabela. Exportador recusa conteúdo serializado acima de 10 MB. Limpeza de campos não prova remoção da senha da memória. |
| Offline | Carregue totalmente com rede; feche abas antigas, abra pelo ícone, ative modo avião e reabra. Faça lançamento, feche/reabra, leia PDF e gere backup. | Assets/PDF worker disponíveis e dados persistidos. Se algum recurso falhar, registre o passo e não declare homologação offline. Primeiro carregamento sem rede não é suportado. |
| Persistência | Em Proteção, consulte estado e solicite persistência. Repita no Safari e no app da Tela de Início. | Negativa/ausência da API não trava o app e continua indicando necessidade de backup. Mesmo concessão não garante retenção após exclusão pelo usuário. |
| Mobile/acessibilidade | Teste portrait/landscape, teclado, zoom, VoiceOver, tamanho de texto maior e alvos em telas 320–430 px. | Sem campos escondidos, foco preso atrás da trava, corte de valores ou rolagem horizontal no conteúdo; abas podem rolar. |

Registre cada caso como aprovado/reprovado/não executado, com observação e versão. Capturas, se necessárias, devem conter somente dados sintéticos. Interrompa a homologação se surgirem dados reais.

## Referências

- [PDF.js: suporte de navegadores](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions).
- [WebKit: políticas de armazenamento e persistência](https://webkit.org/blog/14403/updates-to-storage-policy/).
- [Web Share: contexto seguro e ativação transitória](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
- [Guia Safari no iPhone](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios).
