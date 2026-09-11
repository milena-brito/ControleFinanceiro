# FinanSimple

Aplicação full stack de controle financeiro pessoal, focada em simplicidade.

> Em poucos segundos, o usuário consegue entender quanto ganhou, quanto gastou, onde gastou e quanto ainda pode gastar.

Este é um projeto de portfólio desenvolvido com preocupação em qualidade de software: TypeScript estrito, responsabilidades separadas entre frontend e backend, e evolução incremental por etapas.

## Stack

| Camada   | Tecnologia                               |
| -------- | ---------------------------------------- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend  | NestJS, Node.js, TypeScript              |
| Banco    | PostgreSQL + Prisma                      |
| Testes   | Vitest (backend)                         |
| Pacotes  | npm workspaces                           |

## Estrutura

```
/
  frontend/             # Next.js (porta 3000)
  backend/              # NestJS API REST (porta 3001)
  backend/prisma/       # Schema, migrations e seed
  docker-compose.yml     # PostgreSQL, API e frontend (perfil app)
```

O frontend não acessa o banco. A comunicação é HTTP REST.

## Pré-requisitos

- Node.js 20.9 ou superior
- npm 10+
- Docker Desktop (PostgreSQL local; opcionalmente a API e o frontend)

## Como executar localmente

1. Copie as variáveis de ambiente:

```bash
cp .env.example .env
```

2. Instale as dependências na raiz:

```bash
npm install
```

3. Suba o PostgreSQL e aplique as migrations:

```bash
npm run db:up
cp .env.example backend/.env
npm run db:migrate
npm run db:seed
```

O `prisma migrate` lê `backend/.env`. Use o mesmo `DATABASE_URL` do [`.env.example`](.env.example).

4. Em um terminal, suba a API:

```bash
npm run dev:backend
```

5. Em outro terminal, suba o frontend:

```bash
npm run dev:frontend
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Cadastro: [http://localhost:3000/cadastro](http://localhost:3000/cadastro)
- Login: [http://localhost:3000/login](http://localhost:3000/login)
- Início (dashboard): [http://localhost:3000/inicio](http://localhost:3000/inicio)
- Transações: [http://localhost:3000/transacoes](http://localhost:3000/transacoes)
- Categorias: [http://localhost:3000/categorias](http://localhost:3000/categorias)
- Saúde da API: [http://localhost:3001/health](http://localhost:3001/health)

## Rodar tudo no Docker

Para subir PostgreSQL, API e frontend juntos:

```bash
npm run docker:up
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

O backend aplica as migrations e o seed ao iniciar. O `JWT_SECRET` do Compose serve só para uso local; em produção use um valor próprio.

Para parar:

```bash
npm run docker:down
```

O fluxo com Node na máquina (`npm run dev:frontend` / `npm run dev:backend`) continua igual: `npm run db:up` sobe só o PostgreSQL.

## Scripts

Na raiz do repositório:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run docker:up
npm run docker:down
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run format
```

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Não coloque secrets no código.

Em produção, `JWT_SECRET` e `FRONTEND_ORIGIN` são obrigatórios. Não use os valores de exemplo.

Para o Prisma, copie também para `backend/.env`:

```bash
cp .env.example backend/.env
```

## Testes

Na raiz:

```bash
npm test
```

Os testes e2e da API:

```bash
npm run test:e2e -w backend
```

Não usam o PostgreSQL: o Prisma é substituído por um stub.

## CI

Pull requests e pushes em `develop` e `main` disparam o GitHub Actions: lint, typecheck, testes unitários, e2e e build. Não há deploy automático.

## Segurança

A API aplica cabeçalhos HTTP com Helmet, CORS restrito a `FRONTEND_ORIGIN` e cookie de sessão `httpOnly`. Login e cadastro têm limite de tentativas por IP. Erros internos não devolvem stack nem detalhes do banco; falha de conexão vira 503 com mensagem amigável.

O `npm audit` ainda aponta avisos no Prisma 6 (`deepmerge-ts`) e no `qs` do Express. Não foram forçadas atualizações que quebrariam o Nest 12.

## Git

O desenvolvimento acontece em branches de feature, a partir de `develop`. `main` recebe apenas versões estáveis.

## Roadmap

1. Inicialização do projeto
2. Banco de dados
3. Autenticação
4. Transações
5. Categorias
6. Dashboard
7. Cálculo de gasto diário
8. Testes
9. Segurança
10. Docker
11. CI/CD (esta etapa)
12. Polimento final
