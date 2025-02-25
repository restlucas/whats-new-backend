# What's New - BackEnd

Este é o backend de um sistema de notícias, desenvolvido com Node.js e Express, utilizando Prisma como ORM e Firebase Storage para armazenamento de imagens.

## 🚀 Tecnologias Utilizadas

- Node.js - Ambiente de execução JavaScript no servidor
- Express - Framework web minimalista para Node.js
- Prisma - ORM moderno para banco de dados
- JWT - Autenticação segura com JSON Web Token
- Nodemailer - Envio de emails
- Cookies - Gerenciamento de sessão
- Firebase Storage - Armazenamento de imagens
- Faker.js - Geração de dados fictícios para testes

## 🛠 Configuração do Ambiente

Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias seguindo o arquivo `.env.example`:

```
ACCESS_SECRET="a_super_secret_access_key"           # Valor padrão
REFRESH_SECRET="a_super_secret_refresh_key"         # Valor padrão
JWT_SECRET="a_super_secret_jwt_key"                 # Valor padrão
SECRET_KEY="a_super_secret_api_key"                 # Valor padrão

WHATSNEW_EMAIL="seu_email"
WHATSNEW_EMAIL_PASS="sua_senha_de_aplicativo"
WHATSNEW_FRONTEND_URL="url_do_frontend"

DATABASE_URL="provider://db_user:db_password@localhost:3306/db_name"
```

**Importante:** por padrão o banco de dados configurado é MySQL. Caso utilize outro atualize o provider em `/prisma/schema.prisma`:

```js
/prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 📦 Instalação

Clone o repositório e instale as dependências:

```
git clone https://github.com/restlucas/whatsnew-backend.git
cd whatsnew-backend

npm install  # ou yarn install
```

Rode as migrations do prisma:

```
npx prisma migrate dev --name init
```

Rode as seeds do prisma:

```
npm run seed
```

O usuário gerado em `npm run seed` será:

```js
username: root;
password: root;
```

- Além do usuário padrão serão gerados: times, usuários fictícios e notícias.

## ▶️ Execução

Para iniciar o projeto em ambiente de desenvolvimento, execute:

```
npm run dev  # ou yarn dev
```

O backend estará disponível em http://localhost:3000/v1/api

##

💡 **Feedbacks são bem-vindos!** Se tiver sugestões, deixe um comentário ou abra uma issue. 🚀
