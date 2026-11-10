# Mini Projeto SSR — Cadastro de Produtos

Aplicação de servidor com Node.js, Express, EJS e PostgreSQL, seguindo as etapas e funcionalidades do guia do professor. Inclui login com bcrypt e sessão, rotas protegidas, busca, cadastro, edição e exclusão de produtos.

## 1. Preparar o projeto

No terminal aberto nesta pasta, rode:

```bash
npm install
```

Copie `.env.example` para `.env` e substitua `PGPASSWORD` pela senha definida na instalação do PostgreSQL. Mantenha o arquivo `.env` apenas no seu computador.

## 2. Preparar o PostgreSQL

1. Abra o pgAdmin e conecte ao servidor PostgreSQL local.
2. Crie um banco chamado `meu_banco_db`.
3. Clique com o botão direito no banco novo e abra **Query Tool**.
4. Abra `schema.sql`, copie o conteúdo para a Query Tool e clique em **Execute** (ícone de raio).
5. O script cria as tabelas `usuarios` e `produtos` e o acesso inicial do guia.

Se você já executou uma versão anterior do script e o login com `123456` foi recusado, abra `corrigir-senha-inicial.sql` no Query Tool do mesmo banco e execute-o. Ele atualiza o hash do usuário inicial.

## 3. Iniciar e acessar

```bash
npm start
```

Abra `http://localhost:3000` no navegador.

- E-mail inicial: `admin@email.com`
- Senha inicial: `123456`

## Arquivos principais

- `app.js`: configuração do Express e rotas do sistema.
- `db.js`: pool de conexões com PostgreSQL usando variáveis do `.env`.
- `middleware/auth.js`: proteção das páginas após o login.
- `views/`: telas EJS renderizadas pelo servidor.
- `public/css/style.css`: identidade visual responsiva.
- `schema.sql`: tabelas e usuário inicial do banco.
- `gerar-hash.js`: gera um hash bcrypt para a senha informada.

Para gerar outro hash, use `npm run gerar-hash` e informe a senha quando solicitado.
