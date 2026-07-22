# LifeOS

> **Painel de controle da sua vida** — finanças, jornada, recursos e produtividade em um só lugar.

LifeOS é uma aplicação web moderna construída com Next.js 15, TypeScript, Prisma e PostgreSQL, focada em organização pessoal com uma experiência inspirada em Notion, Linear e Stripe.

---

## Funcionalidades do MVP

### Dashboard

- Resumo da **Jornada** (XP, progresso, missão em andamento)
- Resumo de **Investimentos** (patrimônio total e alocação por tipo)
- Sem widgets de finanças na tela principal (finanças permanecem em `/financas`)

### Jornada (gamificação)

- Trilhas de estudo com passos ordenados (missões estilo RPG)
- Desbloqueio sequencial: passo N só avança após N−1 concluído
- Dificuldade (1–5 estrelas), XP por missão, instrutor e link do curso
- **Voltar passo**: reverte conclusão acidental (subtrai XP do total calculado)
- **Exportar XLSX**: botão "Salvar Jornada" gera planilha com todos os passos
- UI em `/jornada` com linha vertical, cards neon e estados bloqueado/em andamento/concluído
- Módulo DDD em `src/modules/journey` (commands, queries, repository)

### Finanças (rota `/financas`)

- Menu **Finanças** com abas: **Investimentos** e **Gastos Fixos**
- Investimentos: caixinhas com tipo, valor, cor e % do total (dados na tabela `Investment`)
- Gastos fixos: despesas mensais com dia de vencimento e card de total
- Lançamentos legados em `/financas/lancamentos` (transações)
- CRUD de transações, categorias, recorrência, cartão e parcelamento

### Desejos (`/desejos`)

- Lista de consumo por abas: Assinaturas, Eletrônicos, Jogos, Lazer
- CRUD com preço, link e descrição opcionais
- Módulo DDD em `src/modules/wishes`

### Cofre de Recursos

- Salve links organizados em três abas: **Estudos**, **Lazer** e **Ferramentas**
- Campo `vaultCategory` no banco (enum Prisma); rótulo legado `category` preservado
- Status: para ler, lendo, concluído, arquivado
- Busca por título/descrição dentro da aba ativa
- **Exportar XLSX** por categoria (botão em cada aba)
- Toggle inline de "lido"

### Conta

- Cadastro e login com **JWT + Refresh Token**
- Recuperação de senha (token + reset)
- Sessão persistente em cookies httpOnly
- Rotação de refresh token e revogação no logout
- Onboarding inicial (4 passos)

### Extras

- Notificações (estrutura pronta)
- Tema dark por padrão, light e system disponíveis
- Animações suaves com Framer Motion
- Totalmente responsivo

---

## Segurança

- Lista de espera: `User.isApproved` (login bloqueado até aprovação).
- Anti brute force (429) em login/registro.
- Sanitização XSS (`src/lib/sanitize.ts`, serverless-safe) nos validadores Zod.
- Prisma apenas (sem SQL bruto). Detalhes: [docs/SECURITY.md](docs/SECURITY.md).

## Stack

| Camada       | Tecnologia                                  |
| ------------ | ------------------------------------------- |
| Frontend     | Next.js 15 (App Router) + React 19          |
| Linguagem    | TypeScript (strict)                         |
| Estilo       | TailwindCSS + shadcn/ui (manual) + Radix UI |
| Animações    | Framer Motion                               |
| Gráficos     | Recharts                                    |
| Forms        | react-hook-form + Zod                       |
| Notificações | Sonner                                      |
| Backend      | Next.js Route Handlers (serverless)         |
| Auth         | JWT (jose) + Refresh Token + bcryptjs       |
| Banco        | PostgreSQL 16                               |
| ORM          | Prisma 5                                    |
| Deploy       | Docker + Docker Compose                     |

---

## Estrutura do Projeto

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Páginas públicas (login, register, etc.)
│   ├── (app)/                    # Páginas autenticadas
│   │   ├── dashboard/
│   │   ├── financas/
│   │   ├── jornada/
│   │   ├── desejos/
│   │   ├── recursos/
│   │   └── onboarding/
│   ├── api/                      # Route Handlers (REST)
│   │   ├── auth/                 # login, register, refresh, logout, ...
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── notifications/
│   │   ├── dashboard/
│   │   └── me/                   # onboarding
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                  # Landing
├── components/
│   ├── ui/                       # Componentes shadcn/ui (Button, Card, ...)
│   ├── layout/                   # Sidebar, Topbar, MobileNav, UserMenu, ...
│   ├── dashboard/                # Charts e widgets do dashboard
│   └── theme-provider.tsx
├── modules/                      # Domínio DDD lite (journey, finance, wishes, ...)
├── lib/
│   ├── prisma.ts
│   ├── api.ts
│   ├── fetcher.ts
│   ├── utils.ts
│   └── validators/
├── config/
│   ├── env.ts
│   └── nav.ts
└── middleware.ts
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

---

## Como rodar

### Opção A — Docker (recomendado)

```bash
cp .env.example .env
# Edite os secrets JWT no .env (mínimo 32 caracteres cada)
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run prisma:seed
```

App em http://localhost:3000  
Login demo: `demo@lifeos.app` / `demo1234`

### Opção B — Desenvolvimento local

Pré-requisitos: **Node 20+**, **PostgreSQL 14+**.

```bash
npm install
cp .env.example .env
docker compose up -d db
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

---

## Scripts úteis

| Comando                  | Descrição                       |
| ------------------------ | ------------------------------- |
| `npm run dev`            | Inicia em modo desenvolvimento  |
| `npm run build`          | Build de produção (gera Prisma) |
| `npm run start`          | Inicia o build de produção      |
| `npm run lint`           | Roda o ESLint                   |
| `npm run lint:fix`       | Corrige problemas do ESLint     |
| `npm run format`         | Formata com Prettier            |
| `npm run type-check`     | Verifica tipos TypeScript       |
| `npm run prisma:migrate` | Cria/aplica migrations          |
| `npm run prisma:studio`  | Abre o Prisma Studio (UI)       |
| `npm run prisma:seed`    | Popula o banco com dados demo   |

---

## Variáveis de ambiente

Veja [`.env.example`](./.env.example). Principais:

- `DATABASE_URL` — string de conexão Postgres
- `JWT_ACCESS_SECRET` — segredo do access token (mín. 32 chars)
- `JWT_REFRESH_SECRET` — segredo do refresh token (mín. 32 chars)
- `JWT_ACCESS_EXPIRES_IN` — TTL do access token (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` — TTL do refresh token (default: 7d)
- `COOKIE_SECURE` — `true` em produção (HTTPS)

> **Dica:** gere segredos fortes com `openssl rand -base64 64`.

---

## Arquitetura

- **Clean Architecture / DDD lite**: módulos em `src/modules` com commands, queries e repositories.
- **Validação ponta-a-ponta**: schemas Zod em `src/lib/validators`.
- **Tratamento global de erros**: `handleApiError` em `src/lib/api.ts`.
- **Auth segura**: bcryptjs, JWT httpOnly, rotação de refresh tokens, reset de senha.
- **Server Actions** para mutações dos módulos (Investment, Resource, Journey, etc.).
- **Middleware Edge** (`src/middleware.ts`): protege rotas autenticadas.

---

## Roadmap (pós-MVP)

- Pomodoro integrado
- Calendário visual completo
- Relatórios mensais e exportação
- RBAC (admin/usuário)
- Notificações push (web push)
- Conexão com bancos (Open Finance)
- Integração com Google Calendar

---

## Licença

MIT — sinta-se livre para usar como base do seu próprio LifeOS.
