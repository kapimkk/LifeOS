# Segurança (OWASP) — LifeOS

## Controle de acesso (lista de espera)

- Campo `User.isApproved` (padrão `false`).
- Login bloqueado até aprovação (`AwaitingApproval`).
- Usuário demo do seed: `demo@lifeos.app` com `isApproved: true` e `role: ADMIN`.

## Brute force

- 5 falhas de login/registro por IP em 1 minuto → bloqueio 15 min (HTTP 429).
- Implementação: `src/lib/auth-brute-force.ts` + middleware em rotas `/api/auth/login` e `/api/auth/register`.

## XSS

- Texto livre sanitizado com `src/lib/sanitize.ts` (sem jsdom; compatível com Vercel) e helpers Zod em `src/lib/zod-sanitize.ts`.

## SQL Injection

- **Auditoria:** não há `$queryRaw`, `$executeRaw` nem SQL concatenado no repositório.
- Persistência exclusiva via Prisma Client (consultas parametrizadas).

## Headers

- Configurados em `next.config.mjs`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
