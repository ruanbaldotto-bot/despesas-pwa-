# Publicação segura no GitHub — diagnóstico e resolução

## Evidência de 18/10/2026

Remote origin de fetch/push: https://github.com/ruanbaldotto-bot/despesas-pwa-.git. Branch principal main; desenvolvimento exclusivamente em feature/fatura-inteligente. A conta identificada pelo conector corresponde ao proprietário e possui permissão push/admin no repositório. Isso não prova que a credencial da integração disponha do mesmo alcance.

O Git usa Git Credential Manager 2.7.3, helper `manager`. A listagem de contas no sandbox encontrou acesso negado ao cofre do Windows; a verificação fora dele não listou conta GitHub disponível. Um único `push --dry-run`, sem interação e sem alterações remotas, falhou por falta de credencial. `gh` não está instalado. Não se leu nem se imprimiu senha/token. Nenhum novo login foi iniciado automaticamente.

Na etapa anterior, criar blob/ref pela integração retornou HTTP 403 `Resource not accessible by integration`. A documentação do GitHub identifica essa mensagem como credencial de integração com permissões insuficientes. Cabeçalhos de autorização/permissões da instalação não são expostos pelo conector, portanto não é possível identificar daqui qual configuração específica está faltando. Não foi atribuída a causa à proteção da main: a tentativa era criar outra branch. Não foram repetidas tentativas de escrita nesta rodada sem mudança de autorização.

As preferências de permissão de ferramentas no aplicativo não concedem escopos OAuth/GitHub App. Não houve tentativa de alterá-las para contornar a recusa.

## Caminho recomendado: login oficial pelo proprietário

Abra um terminal normal **na pasta despesas-pwa**, fora do sandbox, e execute:

```powershell
git credential-manager github login --username ruanbaldotto-bot --browser
```

Conclua o login e a autorização na página oficial GitHub aberta pelo gerenciador. Se não houver navegador disponível, o gerenciador instalado também oferece:

```powershell
git credential-manager github login --username ruanbaldotto-bot --device
```

Use somente o endereço e código apresentados pelo próprio gerenciador. Não cole código/token/senha no chat. Não use `--pat`/`--token` com segredo na linha de comando, URLs com credenciais, arquivo `.env`, Git ou logs.

Após autenticar, é possível retomar este chat para publicar e abrir o draft. Caso prefira enviar a branch manualmente:

```powershell
git push -u origin feature/fatura-inteligente
```

Depois, no GitHub, compare **main ← feature/fatura-inteligente**, use a descrição de `docs/PR.md` e escolha **Create draft pull request**. Não faça merge ou deploy. Não use force push. Se ainda houver recusa, interrompa e verifique a autorização antes de tentar outra vez.

## Alternativa: corrigir a integração já conectada

Em GitHub → Settings → Applications → Installed GitHub Apps, localize a aplicação realmente usada pela conexão e confira o acesso ao repositório despesas-pwa-. Para criar a branch/arquivos, é necessário Contents: read and write; para abrir o PR, Pull requests: read and write. Aceite uma solicitação de atualização de permissões somente se corresponder à integração desejada. Se ela não oferecer escrita, apenas selecionar o repositório não acrescenta essa capacidade; utilize o gerenciador oficial acima. Não amplie acesso a todos os repositórios por conveniência.

Se a conexão usar OAuth, confira Authorized OAuth Apps e refaça a autorização oficial com o escopo oferecido pelo fornecedor. Não há acesso a organizações envolvido neste repositório pessoal; não se deve desativar proteção de branch ou mudar a visibilidade para resolver autenticação.

Um token fine-grained criado pelo proprietário no GitHub é outra opção: dono correto, somente despesas-pwa-, prazo curto e permissões Contents/Pull requests de escrita. Use-o exclusivamente no fluxo seguro de credenciais; nunca o envie ao agente. Não é necessário permissões de workflow para as alterações atuais, que não adicionam GitHub Actions.

## Referências oficiais

- [Diagnóstico de credenciais insuficientes](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#resource-not-accessible).
- [Permissões para criar referência Git](https://docs.github.com/en/rest/git/refs#create-a-reference).
- [Permissões para criar PR](https://docs.github.com/en/rest/pulls/pulls#create-a-pull-request).
- Sintaxe de login conferida no próprio `git credential-manager github login --help` instalado.
