# LifeOS

> **Painel de controle da sua vida** — finanças, metas, hábitos, produtividade e evolução em um só lugar.

LifeOS é uma aplicação web moderna construída com Next.js 15, TypeScript, Prisma e PostgreSQL, focada em organização pessoal completa com uma experiência inspirada em Notion, Linear e Stripe.

---

## Funcionalidades do MVP

### Dashboard

- Resumo financeiro do mês (saldo, receitas, despesas)
- Gráfico de evolução (últimos 6 meses)
- Despesas por categoria (donut)
- Hábitos do dia com toggle inline
- Metas em destaque com barra de progresso
- Tarefas pendentes

### Finanças

- CRUD completo de transações (receita/despesa)
- Categorias personalizáveis com cor
- Filtros por tipo, categoria e descrição
- Recorrência (diária, semanal, mensal, anual)
- Gráficos de evolução e categorias
- **Investimentos**: caixinhas com tipo, valor acumulado, cor e % do total

### Cofre de Recursos

- Salve links, artigos, vídeos, cursos e podcasts para depois
- Categorias customizáveis + presets (Artigo, Vídeo, Curso, Livro, ...)
- Status: para ler, lendo, concluído, arquivado
- Filtro por categoria + busca por título/descrição
- Toggle inline de "lido"

### Metas

- Categorias: financeira, pessoal, estudos, fitness, carreira
- Prioridade (baixa, média, alta, urgente)
- Progresso em % calculado automaticamente
- Status (ativa, pausada, concluída, arquivada)
- Prazo opcional

### Hábitos

- Toggle de conclusão diária
- Cálculo de **streak atual** e **maior sequência**
- Calendário visual dos últimos 30 dias
- Indicador de consistência (%)

### Produtividade

- Tarefas com prioridade e prazo
- Agrupamento automático: urgentes, hoje, próximas, concluídas
- Toggle inline de conclusão

### Conta

- Cadastro e login com **JWT + Refresh Token**
- Recuperação de senha (token + reset)
- Sessão persistente em cookies httpOnly
- Rotação de refresh token e revogação no logout
- Perfil com **upload de avatar**
- Configurações: tema (dark/light/system), notificações
- Onboarding inicial (4 passos)

### Extras

- Notificações (estrutura pronta)
- Tema dark por padrão, light e system disponíveis
- Animações suaves com Framer Motion
- Totalmente responsivo

---

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
│   │   ├── metas/
│   │   ├── habitos/
│   │   ├── tarefas/
│   │   ├── perfil/
│   │   ├── configuracoes/
│   │   └── onboarding/
│   ├── api/                      # Route Handlers (REST)
│   │   ├── auth/                 # login, register, refresh, logout, ...
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── goals/
│   │   ├── habits/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   ├── dashboard/
│   │   └── me/
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                  # Landing
├── components/
│   ├── ui/                       # Componentes shadcn/ui (Button, Card, ...)
│   ├── layout/                   # Sidebar, Topbar, MobileNav, UserMenu, ...
│   ├── dashboard/                # Charts e widgets do dashboard
│   └── theme-provider.tsx
├── server/
│   ├── auth/                     # JWT, cookies, password, sessão
│   └── services/                 # Camada de serviço (Clean Arch)
├── lib/
│   ├── prisma.ts
│   ├── api.ts                    # Helpers de API + tratamento de erros
│   ├── fetcher.ts                # Cliente HTTP
│   ├── utils.ts
│   └── validators/               # Schemas Zod
├── config/
│   ├── env.ts                    # Validação de env vars
│   └── nav.ts
└── middleware.ts                 # Proteção de rotas
prisma/
├── schema.prisma
└── seed.ts
```

---

## Como rodar

### Opção A — Docker (recomendado)

Tudo (app + Postgres) com um único comando.

```bash
# 1. Crie o .env (copie do exemplo)
cp .env.example .env

# 2. Edite os secrets JWT no .env (mínimo 32 caracteres cada)

# 3. Suba os containers
docker compose up -d --build

# 4. Rode as migrations e o seed
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run prisma:seed
```

App em http://localhost:3000  
Login demo: `demo@lifeos.app` / `demo1234`

### Opção B — Desenvolvimento local

Pré-requisitos: **Node 20+**, **PostgreSQL 14+**.

```bash
# 1. Instalar dependências
npm install

# 2. Copiar e ajustar .env
cp .env.example .env
# Ajuste DATABASE_URL e os JWT_SECRETS

# 3. Subir só o Postgres via docker-compose (opcional)
docker compose up -d db

# 4. Migrations e seed
npm run prisma:migrate
npm run prisma:seed

# 5. Dev server
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

- **Clean Architecture lite**: páginas/route handlers chamam **serviços** em `src/server/services`. Os serviços encapsulam regras de negócio e acesso ao Prisma.
- **Validação ponta-a-ponta**: schemas Zod em `src/lib/validators` são reutilizados pelo backend (via `parseJson`) e pelos forms client-side (via `react-hook-form` + `zodResolver`).
- **Tratamento global de erros**: `handleApiError` em `src/lib/api.ts` converte `ZodError`, `ApiError`, `UnauthorizedError` em respostas HTTP consistentes.
- **Auth segura**:
  - Senhas com `bcryptjs` (10 rounds)
  - Access token JWT (15 min) em cookie httpOnly
  - Refresh token JWT (7 dias) em cookie httpOnly + hash no banco
  - Rotação de refresh tokens (revoga antigo a cada renovação)
  - Logout revoga o refresh token corrente
  - Reset de senha invalida todas as sessões
- **Server Actions** (Next.js 15) para mutações dos módulos novos
  (`Investment`, `Resource`): retornam `ActionResult<T>` padronizado
  (`{ success, data }` ou `{ success: false, error, fieldErrors }`),
  combinados com `useTransition` no client para loading states.
  `revalidatePath` mantém os Server Components sincronizados.
- **Middleware Edge** (`src/middleware.ts`): valida o access token; redireciona não autenticados para `/login` e libera fluxos públicos.
- **Tipagem forte**: TS strict + `noUncheckedIndexedAccess`.

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
