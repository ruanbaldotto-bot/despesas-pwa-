# Jabu — homologação privada com Tailscale

## Estado verificado em 18/10/2026

Windows NT 10.0 build 26200, Node 24.19.0. Tailscale oficial 1.104.1 instalado após autorização explícita do proprietário; instalador obtido em pkgs.tailscale.com, assinatura Authenticode válida de Tailscale Inc. Instalação não reiniciou o computador. Login executado pelo proprietário, sem senha/código no chat. Conexão VPN e nome neutro jabu-homologacao autorizados. Backend Running e DNS neutro confirmados. Identidade da conta, domínio privado, IPs de tailnet e dados do login não são registrados no Git.

Servidor sintético em segundo plano, somente 127.0.0.1:43189. GET / retorna 200 e cabeçalho Jabu Homologação. /.git/config, /tools/github-pr.cjs, /docs/PR.md e tentativa de caminho pai retornam 404. Nenhuma porta LAN/roteador foi aberta e o firewall não foi desativado.

Atualização concluída: iPhone iOS online na mesma conta/tailnet, habilitação oficial de Serve/HTTPS realizada pelo proprietário. Serve em segundo plano, HTTPS 443 → somente http://127.0.0.1:43189. Configuração AllowFunnel ausente/falsa: Funnel desativado. Certificado Let’s Encrypt validado pela verificação TLS normal (authorized=true), resposta HTTPS 200 e conteúdo Jabu Homologação. A URL privada é obtida em serve status e não é gravada no Git. A página também foi aberta pelo HTTPS no navegador integrado do computador; isso não comprova execução no Safari físico. Nenhum serviço público foi publicado.

## Pacote sintético

node tools/verify-homologacao.cjs verifica 225 arquivos permitidos, versão/hash do cache, banco jabuHomologacaoDB, carga inicial idêntica à fonte e os 12 CSV/PDF idênticos às fixtures sintéticas. Nenhum IndexedDB do navegador é lido pelo verificador. Isso é evidência de composição do pacote; não é scanner universal de dados pessoais.

Foi removido da geração somente o marcador icons/.gitkeep, sem utilidade em hospedagem. O pacote anterior foi renomeado/preservado; o builder manteve a recusa de sobrescrita. node tools/build-homologacao.cjs gera dist/homologacao somente se o destino não existir. Sem arquivos financeiros reais, credenciais, ferramentas ou raiz do repositório no pacote. Não usar documentos reais na homologação.

80 testes aprovados, zero falhas, incluindo regressões e verificação positiva/negativa do pacote. Log sanitizado: test-output-tailscale.txt. Runner node --test tests/*.test.cjs, equivalente ao script npm test; npm indisponível neste ambiente. Não são testes em iPhone físico.

## Permissões aplicadas e verificadas

O console autenticado continha uma única regra geral permitindo todas as conexões. Ela foi editada para permitir somente os endereços Tailscale IPv4/IPv6 do iPhone confirmado como origem, os endereços deste computador como destino e tcp:443. Não foi apenas adicionada uma regra estreita sobre uma permissão ampla: a regra abrangente foi substituída. Não foram alteradas as seções separadas de SSH/autoaprovação, nem criados novos usuários ou credenciais.

O cliente recebeu exatamente uma regra efetiva, TCP apenas, porta inicial/final 443, origens /32 e /128 correspondentes ao iPhone. Serve contém um único proxy para a porta local 43189. Não há permissão de rede para 22 ou 43189 nessa regra. A própria conectividade de controle do Tailscale permanece ativa. Como só havia este computador e o iPhone na tailnet, não foram removidas regras específicas de outros serviços; futuras necessidades de acesso exigem novas regras deliberadas.

Verificação de configuração concluída; teste ativo de um terceiro dispositivo não autorizado e abertura no Safari físico ainda pendentes. IPs estão vinculados aos dispositivos atuais: se o iPhone for removido/recriado, revisar a regra. Não ampliar para todos os usuários para resolver falha. A proposta com endereços concretos permanece em dist/tailscale-jabu-restricao-proposta.json, ignorada pelo Git. Nenhum endereço de tailnet, e-mail ou captura administrativa entrou no repositório.

## Iniciar, consultar e parar o ambiente

Sintaxe consultada na CLI instalada (1.104.1): serve --bg target, HTTPS padrão; serve status --json para conferência. O alvo é sempre a porta loopback, nunca diretório do repositório.

No PowerShell:

    $env:FATURA_PREVIEW_PORT='43189'
    node tools/preview.cjs --homologacao

O comando acima é a forma manual em primeiro plano; Ctrl+C encerra somente esse servidor. Nesta sessão há um processo de servidor em segundo plano já iniciado: não iniciar uma cópia sobre a mesma porta. Para encerrar o processo de fundo, consultar Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 43189 -State Listen, conferir o PID/linha de comando com Get-CimInstance Win32_Process e usar Stop-Process somente no Node confirmado com tools/preview.cjs --homologacao. Não encerrar outros processos Node.

Em outro terminal, para retomar a mesma configuração privada já validada:

    & 'C:\Program Files\Tailscale\tailscale.exe' serve --bg http://127.0.0.1:43189
    & 'C:\Program Files\Tailscale\tailscale.exe' serve status --json
    & 'C:\Program Files\Tailscale\tailscale.exe' funnel status --json

Se HTTPS ainda exigir habilitação, o proprietário conclui o fluxo oficial no navegador. O nome neutro será publicado em registros de transparência do certificado; não inserir dados pessoais nele. Não criar certificados autoassinados nem ignorar erro TLS. A URL é a exibida por serve status, não inventar endereço antes da configuração.

Confirmar proxy único / → http://127.0.0.1:43189, HTTPS 443 e AllowFunnel ausente/falso. Validar a URL com verificação normal de certificado, sem --insecure, e conferir Jabu Homologação/manifest Jabu Teste. Um endereço HTTPS por si só não prova privacidade. Verificar que cliente sem acesso à tailnet não consegue buscar recurso novo.

Para parar somente este endpoint, preservando a conexão e outros serviços:

    & 'C:\Program Files\Tailscale\tailscale.exe' serve --bg --https=443 off

Antes de executar, consultar serve status e confirmar que 443 ainda corresponde exclusivamente ao Jabu. Não usar serve reset indiscriminadamente. Serve --bg persiste após reiniciar Tailscale/computador; o Node precisa ser iniciado novamente manualmente após reboot. Não configurar tarefas automáticas ou serviços adicionais nesta rodada. Não executar funnel, não alterar firewall e não abrir portas no roteador.

## iPhone: intervenção do proprietário

1. App Store → Tailscale oficial; instalar e abrir. Entrar na mesma tailnet escolhida no Windows; não criar outra conta por engano. Senhas e códigos somente no fluxo oficial.
2. Autorizar a configuração VPN solicitada pelo iOS e ativar a conexão. Confirmar que o computador jabu-homologacao aparece e o aparelho foi aprovado, se a tailnet exigir aprovação.
3. Depois de Serve/restrições prontos, abrir no Safari a URL HTTPS privada exibida no computador. Conferir certificado válido, identificação Homologação e dados fictícios.
4. Compartilhar → Adicionar à Tela de Início → Abrir como App da Web, se disponível → nome Jabu Teste → Adicionar. Abrir pelo ícone e conferir símbolo, cores, safe areas e navegação.
5. Preencher IPHONE_REGISTRO_HOMOLOGACAO.md com resultados observados. Usar exemplos em Importação → Arquivos fictícios; testar CSV/PDF, projeção, divisão, backup e cancelamento do compartilhar.
6. Após cache completo, testar modo avião com Wi-Fi desligado. Abertura pelo cache sem VPN é comportamento offline esperado, não prova de serviço público. O servidor e a VPN precisam estar disponíveis para primeira carga e atualizações.

## Riscos restantes

IndexedDB em claro, trava casual e backup criptografado somente no arquivo exportado. Scripts da mesma origem, acesso ao perfil/aparelho ou computador comprometido continuam riscos. Tailnet usa identidade/dispositivos e permissões: a regra atual está restrita ao iPhone confirmado; alterações futuras ou recriação dos dispositivos exigem revisão. Provedor de coordenação conhece metadados e o hostname do certificado pode aparecer publicamente. Computador deve ficar ligado; suspensão interrompe acesso. Nenhum teste físico aprovado nesta rodada. Não há Cloudflare/GitHub Pages, Funnel, compartilhamento de documentos ou alteração de main.

Referências oficiais:
- https://tailscale.com/download/windows
- https://tailscale.com/docs/install/windows
- https://tailscale.com/docs/reference/tailscale-cli/serve
- https://tailscale.com/docs/features/tailscale-serve
- https://tailscale.com/docs/reference/tailscale-cli/funnel
