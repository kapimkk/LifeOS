# Segurança (OWASP) — LifeOS

## Controle de acesso (lista de espera)

- Campo `User.isApproved` (padrão `false`).
- Login bloqueado até aprovação (`AwaitingApproval`).
- Usuário demo do seed: `demo@lifeos.app` com `isApproved: true` e `role: ADMIN`.

## Brute force

- 5 falhas de login/registro por IP em 1 minuto → bloqueio 15 min (HTTP 429).
- Recuperação e troca de senha: no máximo 5 pedidos a cada 15 minutos por IP.
- Implementação: `src/lib/auth-brute-force.ts` + middleware.

## CSRF

- Cookies de sessão: `httpOnly` + `SameSite=Lax`.
- Mutações (`POST`, `PUT`, `PATCH`, `DELETE`) só seguem se `Origin` bater com o host, ou se `Sec-Fetch-Site` for `same-origin`/`none`.
- Depois do login, o parâmetro `next` só aceita caminho interno (`src/lib/safe-redirect.ts`).

## Segredos

- Tokens de redefinição de senha não são escritos em log.
- O módulo de VPS não tem campo de senha ou chave privada.

## XSS

- Texto livre sanitizado com `src/lib/sanitize.ts` (sem jsdom; compatível com Vercel) e helpers Zod em `src/lib/zod-sanitize.ts`.

## SQL Injection

- **Auditoria:** não há `$queryRaw`, `$executeRaw` nem SQL concatenado no repositório.
- Persistência exclusiva via Prisma Client (consultas parametrizadas).

## Headers

- Configurados em `next.config.mjs`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
