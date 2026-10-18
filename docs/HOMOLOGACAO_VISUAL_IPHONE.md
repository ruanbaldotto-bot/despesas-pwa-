# Jabu — preparação visual e iPhone (18/10/2026)

## Entrega e revisão visual

Branch feature/fatura-inteligente, PR #1 mantido draft. Nenhum deploy, merge, alteração de main ou acesso a fatura real. [Galeria completa](evidencias/iphone/index.html), [visão geral](evidencias/iphone/visao-geral.jpg), [medições](evidencias/iphone/geometria.json).

Capturas atuais das seis telas em 375×667, 390×844 e 430×932 CSS pixels. São dimensões de referência de iPhone em navegador desktop integrado; não incluem Safari/teclado/notch físicos. Todas as 18 medições sem transbordamento horizontal da página. O gráfico longo tem rolagem interna intencional. Capturas de página inteira mostram a barra fixa na altura do viewport; isso não representa barra posicionada no meio do documento durante uso.

Identidade preservada: mata #0F3D2E, areia #F6F1E6, folhas #2E6B4F, SVG circular próprio minimalista. Alinhamentos, espaçamentos, ícones vetoriais, contraste dos tokens, títulos, campos e navegação revisados. Gráficos distinguem registrado/estimado com legenda e nomes acessíveis; não dependem somente de cor.

Correções: resumo familiar passou a grade com coluna flexível e botão na linha seguinte; cartões acomodam nome longo e classificação; métricas móveis em duas colunas; Configurações tem título explícito; seletores de pessoa/cartão do pagamento recebem nomes acessíveis. Estado do service worker é atualizado ao entrar na proteção e no evento controllerchange, evitando aviso desatualizado.

## Evidência funcional

| Item | Evidência executada | Falta no iPhone |
| --- | --- | --- |
| Manifest/ícones | Arquivos e scope relativos verificados; PNG Apple e maskable existentes | Instalação e recorte físico |
| Service worker/offline | Controle confirmado na UI; servidor loopback desligado, recarga e consulta familiar funcionaram | Modo avião, retomada e evicção Safari |
| Persistência | Dados sintéticos preservados após recarga sem servidor | Fechar app, reiniciar aparelho e reabrir |
| PDF/CSV | 80 testes incluindo parsers dos seis bancos; PDF Itaú sintético lido pelo seletor/PDF.js real no navegador, três linhas e total conciliado | App Arquivos, PDF protegido, teclado e seleção nativa |
| Projeções/família | Seis cartões, parcelas, duas pessoas e recebimento parcial exibidos; suíte conserva centavos | Toque, rotação e VoiceOver |
| Compartilhamento | Testes existentes de confirmação/fallback; nenhum envio real | Seletor nativo, cancelamento, WhatsApp e impressão |
| Backup/restauração | AES-GCM, senha incorreta, adulteração e conflitos sem sobrescrita na suíte | Baixar/selecionar em Arquivos e restaurar no app instalado |

**80 testes passaram, zero falhas**: os 77 existentes foram preservados e três acrescentados (carga fictícia repetível e snapshot válido; recusa no banco principal; pacote por allowlist, recursos completos e recusa de sobrescrita). Log: test-output-iphone.txt. Runner: node --test tests/*.test.cjs, mesmo script de npm test; npm não está disponível no ambiente. Dublês DOM/IndexedDB/service worker não são homologação física nem Google. Sync, vendor, demo e pacote de homologação gerados localmente.

## Pacote separado

Gerar: node tools/build-homologacao.cjs. Saída ignorada pelo Git: dist/homologacao. Se existir, o comando recusa sobrescrever: preserve/renomeie a pasta anterior antes de gerar. Executa a geração da demo, copia somente recursos explicitamente permitidos e os documentos sintéticos gerados. Não copia .git, .env, docs, anexos, ferramentas ou qualquer armazenamento do navegador.

Banco jabuHomologacaoDB, canal próprio de trava, manifesto Jabu Teste e versão de cache calculada pelo conteúdo. Carga inicial: seis cartões, seis compras parceladas em outubro/2031, duas pessoas fictícias e um recebimento parcial. Só carrega quando não há cartões/compras/faturas/eventos; nunca limpa dados. Arquivos sintéticos podem ser baixados na seção de importação e ficam no cache offline. Nenhuma senha é pré-configurada. A separação por nome não isola scripts da mesma origem: usar hostname HTTPS exclusivo e somente dados fictícios.

Prévia local: definir FATURA_PREVIEW_PORT=43189 e executar node tools/preview.cjs --homologacao. Servidor restrito a 127.0.0.1 e raiz do pacote, sem disponibilizar repositório. Artefato inclui robots.txt e _headers para Cloudflare com CSP, bloqueio de frames, no-sniff, sem permissões de câmera/microfone/localização e noindex. Esses cabeçalhos precisam ser conferidos no destino após publicação autorizada; loopback não prova configuração HTTPS do provedor.

## Proposta HTTPS sem automatizar produção

**Opção mais simples: Cloudflare Pages Free, projeto exclusivo de homologação, Direct Upload manual de dist/homologacao.** Não vincular GitHub, não criar GitHub Actions, não definir main como fonte. O provedor chama a primeira URL do projeto de production deployment, mas seria um projeto de teste independente, nunca o aplicativo de produção. Nenhuma conta/projeto/site foi criado e nenhum upload foi feito.

O plano gratuito permite começar sem cartão; verificar limites vigentes antes de usar. Conteúdo estático e exemplos se tornam públicos; URL pouco divulgada e noindex não são autenticação. Provedor recebe requisições/IP e pode servir atualizações de código capazes de acessar dados daquela origem; TLS não criptografa IndexedDB. Nunca importar dados reais nessa origem. Código e amostras podem continuar no cache após remover o site. Sem analytics, cookies de terceiros, formulários ou backend no pacote.

**Alternativa privada recomendada se acesso público for indesejado: Tailscale Serve.** Na modalidade pessoal gratuita elegível, conectar computador e iPhone à mesma tailnet, instalar cliente oficial e autenticar; após autorização, servir apenas o servidor do pacote com tailscale serve --bg http://127.0.0.1:43189. Usar Serve, não Funnel público. Exige computador ligado e VPN conectada para primeira carga/atualizações; offline após cache deve ser testado separadamente. Não foi instalado/configurado. HTTPS expõe nomes do certificado nos registros públicos: usar nome de máquina neutro. Configurar acesso mínimo na tailnet. Não contratar plano pago se a conta não for elegível.

Fontes oficiais consultadas em 18/10/2026:
- [Pages e plano gratuito](https://www.cloudflare.com/products/pages/)
- [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Previews e Cloudflare Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/): proteção de preview não deve ser presumida para a URL pública principal.
- [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve), [plano pessoal](https://tailscale.com/docs/how-to/quickstart), [HTTPS/certificados](https://tailscale.com/docs/how-to/set-up-https-certificates)

## Instalar e homologar no iPhone após autorizar HTTPS

1. Registrar modelo, versão iOS, URL/build e data. Se privado, conectar Tailscale. Abrir a URL HTTPS exclusiva no Safari normal, sem ignorar alertas de certificado.
2. Confirmar cabeçalho Homologação e somente nomes fictícios. Abrir Mais → Proteção e aguardar o controle pelo service worker. Fonte de instalação: [Apple](https://support.apple.com/pt-br/guide/iphone/iphea86e5236/ios).
3. Safari → Compartilhar → Adicionar à Tela de Início; ativar Abrir como App da Web se a versão oferecer; nome Jabu Teste → Adicionar.
4. Abrir pelo ícone, conferir símbolo, cores, ausência de barras do Safari, safe areas e navegação. Não presumir que dados do Safari e do app instalado serão compartilhados; validar no contexto instalado.
5. No app instalado, testar todas as seis telas com orientação retrato/paisagem, teclado, zoom e VoiceOver. Conferir composição dos gráficos e valores familiares.
6. Em Importação, baixar exemplos fictícios para Arquivos, importar CSV/PDF dos seis bancos, revisar linhas/total, salvar e tentar duplicidade. PDF protegido: somente arquivo sintético com senha temporária; conferir erro sem senha e campo limpo. Sem dados reais.
7. Atribuir uma compra fictícia, registrar recebimento parcial e verificar saldo individual. Abrir compartilhar, conferir conteúdo/destinatário e cancelar antes do envio. Testar impressão/salvar PDF.
8. Criar senha de teste local (não enviá-la ao desenvolvedor), baixar backup, conferir senha incorreta e restaurar em instalação/perfil de teste separado. Validar que conflitos não sobrescrevem registros.
9. Fechar/reabrir, ativar modo avião (Wi-Fi também desligado), abrir pelo ícone, navegar e ler arquivo local. Voltar online e conferir persistência. Reiniciar aparelho e repetir.
10. Para atualizar versão: exportar backup fictício, voltar online e fechar todas as janelas Safari/app dessa origem para liberar o worker anterior; reabrir. Não apagar dados do site como primeira medida. Registrar falha e captura sintética por item.

## Segurança e pendências

IndexedDB em claro, trava visual casual, sem garantia de biometria ou apagamento de memória. Backup protege arquivo exportado; navegador pode remover banco/cache. Dispositivo comprometido ou scripts da mesma origem podem acessar dados. Hospedagem pública não protege acesso ao código. Não há homologação em iPhone físico, OCR, certificação dos layouts reais nem promessa de funcionamento em todas as versões iOS. Deploy aguarda autorização explícita e escolha pública/privada.
