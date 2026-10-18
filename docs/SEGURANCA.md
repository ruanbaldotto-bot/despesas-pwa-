# Avaliação Jabu

Senha de PDF temporária: retirada imediatamente do campo, usada pelo PDF.js na memória, sem IndexedDB/backup/log. Worker encerrado também nas falhas. Não há garantia de apagar todas as cópias internas da memória JavaScript. Testes geram senhas aleatórias em execução.

IndexedDB fica em claro. A trava oculta a interface e bloqueia interação casual; não impede inspeção do perfil, scripts na mesma origem ou aparelho comprometido. Backup AES-GCM protege somente o arquivo exportado; testes verificam senha errada, adulteração e conflitos sem sobrescrita. Senha perdida não é recuperável. Navegadores podem remover dados locais: guardar backups externos. Sem promessa de Face ID, cofre do sistema ou isolamento multiusuário. Cartão compartilhado é classificação, não autorização.

Não há envio de PDFs nem fontes remotas. sharp gera imagens localmente e é dependência de desenvolvimento. Credencial oficial Git fica no processo CLI para destino fixo GitHub, sem impressão. Safari físico e auditoria independente permanecem pendentes.

---

# Segurança e privacidade

## Controles implementados

Documentos são processados no dispositivo. Sem upload, telemetria, CDN, tokens ou backend. PDF.js, worker, fontes e mapas são locais. CSP restringe scripts, conexões e workers à própria origem, bloqueia objetos e submissões de formulário. HTML de nomes e notas é escapado; componentes novos usam textContent. CSV exportado usa delimitador ponto e vírgula, aspas e neutralização de fórmulas.

Importação valida total em centavos e checa hash do arquivo e coincidências de compras dentro da mesma transação. Duplicidades possíveis bloqueiam todo o lote; o usuário deve revisar o documento e excluir a linha repetida na revisão. Compras legítimas absolutamente idênticas também podem ser bloqueadas: não contorne alterando artificialmente descrição/valor. Não há remoção silenciosa de linhas pelo parser. Linhas não reconhecidas ficam visíveis e exigem conferência humana; o total sozinho não prova a completude do documento.

Backup usa AES-256-GCM, IV aleatório de 12 bytes, salt aleatório de 16 bytes e chave derivada por PBKDF2-SHA-256/310.000 iterações. Mínimo de 12 caracteres. O arquivo inclui os dados financeiros e anexos legados criptografados, sem a configuração da trava. Restauração descriptografa e valida em staging em memória, informa a quantidade e pede confirmação; conflitos de IDs cancelam toda a transação sem sobrescrever dados. Não existe recuperação de senha.

Demonstrativo é calculado para uma pessoa, com somente sua parcela e seus pagamentos. Compartilhamento abre o seletor do sistema após confirmação; não envia mensagens automaticamente. Impressão mostra somente o demonstrativo selecionado via folha de estilos própria.

Service worker aceita cache somente dos arquivos de aplicação enumerados, mesma origem e GET. Não apaga caches alheios. Mudança dos arquivos gera versão por hash; atualizações aguardam fechamento das abas antigas. Arquivos de usuário não entram no cache.

## Limites reais

IndexedDB não é criptografado. A trava de tela armazena um desafio criptografado, bloqueia a tela ao inicializar ou sair do aplicativo e pode ser contornada por quem controla a origem ou as ferramentas do navegador. Ela não é autenticação forte nem Face ID; não separa usuários do mesmo aparelho. Código de acesso do aparelho e backups continuam necessários. Uma captura pelo seletor de aplicativos pode preceder o evento visibilitychange; isso depende do iOS e não foi validado.

Código malicioso na mesma origem, extensões, acesso físico ao dispositivo desbloqueado e vulnerabilidades de navegador/biblioteca continuam riscos. Use origem exclusiva e HTTPS. Proteção de dados em repouso depende do sistema operacional. Safari pode remover dados locais; solicitar persistência não garante retenção. Sem sincronização automática e sem proteção contra aparelho comprometido.

Repositório de origem público. Não foram identificados dados financeiros nos arquivos de texto atuais nem credenciais nos padrões pesquisados nas 34 revisões. Imagens históricas não tiveram análise forense; a busca não constitui certificação de ausência de dados pessoais. Proprietário deve avaliar privacidade do repositório; nenhuma configuração foi alterada. Tornar privado não revoga cópias existentes de material já público.

Limite de entrada de documento: 20 MB e 100 páginas; restauração: 50 MB/100.000 registros por store. PDFs sem texto, protegidos por senha ou com datas sem ano não são completados por suposição. Textos complexos podem exigir edição/CSV. Estes limites reduzem uso excessivo, sem garantir resistência a todo documento malicioso.

## Revisão adicional de segurança — 18/10/2026

| Superfície | Melhoria implementada | Limite restante |
| --- | --- | --- |
| IndexedDB | Preservação das stores, validação financeira de restauração e redução de propagação indevida de atribuições. | Dados e blobs legados permanecem em claro no banco local; mesma origem e dispositivo desbloqueado continuam capazes de lê-los. |
| Demo | Banco despesasDemoDB, canal de bloqueio próprio, versão de cache calculada sobre a demo e identificação visível de ambiente sintético. | Separar nomes evita abertura acidental do banco principal; não isola scripts da mesma origem. Use origem de teste distinta para separação efetiva. |
| Trava | Ocultação síncrona antes de buscar configurações, conteúdo fora do modal inert, tratamento de pagehide/pageshow, inatividade de 120 segundos e aviso de bloqueio entre abas quando BroadcastChannel existe. | A senha verifica apenas um desafio. Não há proteção contra ferramentas do navegador, extração do desafio ou ataque offline à senha. A pausa do processo pelo iOS pode ocorrer antes de um evento ou captura. |
| Senhas | Campo limpo antes de backup, restauração e verificação da trava; conteúdo de impressão/demonstrativo é invalidado ao bloquear. | Strings e dados descriptografados existem em memória JavaScript. Limpar o campo não é apagamento seguro de memória. Senha de 12 caracteres não implica entropia suficiente. |
| Backup | Validação de bytes do salt/IV/cifra; validação de tipos, datas, parcelas, eventos, divisão e pagamentos; exportação limitada antes da cifra para não gerar arquivo incompatível com restauração. | AES-GCM autentica o arquivo sob a chave derivada, não a identidade de quem o produziu. Não há recuperação de senha; o segredo deve ser forte e guardado pelo proprietário. |
| Documentos | Limite de 20 MB, 100 páginas e dois milhões de caracteres; worker liberado no finally inclusive em erro; CSV malformado/ambíguo sinalizado. | Limites reduzem consumo, sem garantir imunidade a PDFs maliciosos, gasto de memória na biblioteca ou falhas de dependências. Sem OCR. |
| Compartilhamento | Prévia individual e segundo toque explícito sem await de banco antes do Web Share; cancelamento tratado; alternativa de texto. | Não há controle sobre o destinatário que o usuário escolhe no sistema nem sobre cópias feitas após envio. |
| Cache | Prefixo por escopo e versão; ignora dados externos e preserva caches de instalações vizinhas. | Caches antigos de escopo desconhecido não são apagados automaticamente. Offline real no iOS segue pendente. |
| Origem | A prévia fornece no-referrer, nosniff, DENY/frame-ancestors e Permissions-Policy para câmera/microfone/localização. | Headers da prévia não configuram um futuro host. CSP frame-ancestors precisa de header HTTP e não funciona como garantia em meta HTML. |

Se uma demo antiga foi utilizada na mesma origem da aplicação, ela pode ter usado despesasDB. Nenhum registro foi removido, copiado ou migrado para corrigir isso. Faça backup e reconciliação humana antes de limpar ou reclassificar registros antigos; não apague o banco principal para reiniciar uma demo.

Limites atuais: exportação de até 10 MB de conteúdo JSON serializado antes da cifra; envelope de restauração de até 50 MB; 100.000 registros por store no staging. Os anexos originais continuam sendo responsabilidade do proprietário. Consulta por `pnpm audit --prod --json` em 18/10/2026 retornou zero avisos conhecidos nas dependências de produção (1 direta e 12 opcionais). Isso não é certificação de segurança.

### Proposta para uma etapa posterior

Criptografar IndexedDB exigiria um projeto de migração: envelope versionado por registro, chave apenas em memória após senha, tratamento de índices/metadados que continuam revelando padrões, transação de conversão, backup restaurável verificado e recuperação documentada. A conversão dos dados existentes não foi feita implicitamente. Sem armazenamento protegido por hardware e autenticação nativa, não seria correto prometer proteção equivalente a aplicativo bancário ou Face ID. Origem exclusiva/HTTPS, código do aparelho e backups continuam sendo medidas complementares.

Referências técnicas: [armazenamento WebKit](https://webkit.org/blog/14403/updates-to-storage-policy/) e [requisitos do Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
