# Luna — seu espaço para escrever

Aplicação estática em português com notas, subnotas, modelos, favoritos, revisão offline, lixeira, backup, proteção de notas e gerenciador de senhas. Acesso por perfil local com senha, sem conta do ChatGPT ou serviço externo.

## Acessar

Após a ativação e a publicação do GitHub Pages:

**https://mateusmott.github.io/projeto_luna/**

Escolha **Criar um perfil neste navegador**. Cada pessoa cria seu próprio perfil e senha. Os perfis e as notas ficam apenas no navegador e dispositivo usados. Não existem contas online, sincronização entre dispositivos nem recuperação de senha.

A senha do perfil deriva uma chave com PBKDF2-SHA256 (600.000 iterações). As notas são armazenadas no IndexedDB criptografadas com AES-256-GCM, em um banco separado para cada perfil. A senha não é persistida. A chave da sessão fica no sessionStorage da aba até sair ou encerrar a aba. O nome do perfil e os metadados de criptografia ficam no localStorage. O código público do repositório não contém as notas dos usuários.

## Senhas das notas

A senha do perfil é diferente da senha mestra do gerenciador. O gerenciador guarda PINs e senhas alfanuméricas, criptografados com AES-GCM e RSA-OAEP, sob a senha mestra. A proteção de notas usa PBKDF2 e AES-GCM e preserva os formatos antigos.

Notas protegidas **antes da criação da senha mestra** também podem entrar no gerenciador: depois de criar a senha mestra, use **Cadastrar senhas antigas**. O assistente pede a senha atual de cada nota e a verifica antes de guardar. Abrir uma nota com sua senha atual também a cadastra, caso o gerenciador esteja configurado. Não é possível descobrir ou recuperar uma senha antiga desconhecida a partir da nota criptografada.

## Migrar da versão anterior

1. Abra a versão anterior no navegador onde suas notas estão.
2. Use **Backup** e guarde o JSON.
3. Neste site, crie seu perfil local, entre e use **Importar**.
4. Se o backup incluir o gerenciador, use a senha mestra dele. Caso contrário, configure uma senha mestra e cadastre os segredos antigos.

O GitHub Pages usa uma origem diferente do site anterior: as notas não migram automaticamente. Guarde seus backups fora do navegador. Os backups preservam a criptografia das notas protegidas, mas podem conter as notas sem proteção em texto puro. Limpar os dados do navegador remove seus perfis e notas locais.

## Publicar

O workflow `.github/workflows/pages.yml` publica a branch `main` no GitHub Pages. Na primeira publicação, caso o GitHub peça a ativação manual, abra **Settings → Pages → Build and deployment → Source → GitHub Actions** e execute novamente o workflow **Publicar Luna no GitHub Pages** em Actions. O workflow solicita somente permissões de leitura do conteúdo e publicação no Pages.

## Desenvolver

Não há etapa de build ou dependências de runtime. Sirva a raiz por HTTP local, por exemplo:

```sh
python3 -m http.server 8000
```

Abra `http://localhost:8000/`. Em produção use HTTPS, necessário para as APIs de criptografia. Os caminhos relativos permitem servir tanto na raiz quanto em `/projeto_luna/`.

- `index.html`: login e cadastro de perfis locais.
- `app/index.html`: aplicação de notas.
- `assets/local-auth.js`: criptografia de perfis e sessão local.
- `assets/local-login.js`: interface de login/cadastro.
- `assets/app-session.js`: saída segura da sessão.
- `assets/cursor.js`: ponto branco e círculo com atraso, inclusive sobre janelas.

DM Sans e Cormorant Garamond são distribuídas sob SIL OFL; licenças em `assets/`. Dicionários e suas licenças permanecem incorporados no HTML da aplicação.
