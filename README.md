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
  docker-compose.yml     # PostgreSQL local
```

O frontend não acessa o banco. A comunicação é HTTP REST.

## Pré-requisitos

- Node.js 20.9 ou superior
- npm 10+
- Docker Desktop (PostgreSQL via Compose)

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
- Saúde da API: [http://localhost:3001/health](http://localhost:3001/health)

## Scripts

Na raiz do repositório:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run lint
npm run typecheck
npm run test
npm run build
npm run format
```

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Não coloque secrets no código.

Para o Prisma, copie também para `backend/.env`:

```bash
cp .env.example backend/.env
```

## Git

O desenvolvimento acontece em branches de feature, a partir de `develop`. `main` recebe apenas versões estáveis.

## Roadmap

1. Inicialização do projeto
2. Banco de dados
3. Autenticação (esta etapa)
4. Transações
5. Categorias
6. Dashboard
7. Cálculo de gasto diário
8. Testes
9. Segurança
10. Docker
11. CI/CD
12. Polimento final
