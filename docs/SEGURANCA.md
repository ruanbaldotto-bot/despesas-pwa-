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
