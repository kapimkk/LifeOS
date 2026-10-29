import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getClientIp } from '@/lib/get-client-ip';
import {
  authBruteForceKey,
  bruteForceResponse,
  checkAuthBruteForce,
  consumeRateLimit,
} from '@/lib/auth-brute-force';

const ACCESS_COOKIE = 'lifeos_access';
const REFRESH_COOKIE = 'lifeos_refresh';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh',
];

function isStateChange(method: string) {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

function isTrustedMutation(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host === req.nextUrl.host;
    } catch {
      return false;
    }
  }
  const fetchSite = req.headers.get('sec-fetch-site');
  return fetchSite === 'same-origin' || fetchSite === 'none';
}

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (pathname === '/' || pathname === '/favicon.ico') return true;
  // Manifest e service worker precisam ser acessíveis sem sessão: é o que o
  // navegador busca (via <link rel="manifest">) para decidir se oferece
  // "instalar aplicativo" — inclusive para quem ainda não tem conta.
  if (pathname === '/manifest.json' || pathname === '/sw.js') return true;
  if (pathname.startsWith('/_next') || pathname.startsWith('/assets')) return true;
  if (pathname.startsWith('/uploads')) return true;
  return false;
}

async function isValidAccess(token: string | undefined) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET ?? '');
    if (secret.byteLength === 0) return false;
    await jwtVerify(token, secret, { issuer: 'lifeos', audience: 'lifeos-app' });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStateChange(req.method) && !isTrustedMutation(req)) {
    return NextResponse.json({ error: 'Origem não permitida' }, { status: 403 });
  }

  if (
    req.method === 'POST' &&
    (pathname === '/api/auth/login' || pathname === '/api/auth/register')
  ) {
    const scope = pathname.endsWith('/login') ? 'login' : 'register';
    const blocked = checkAuthBruteForce(authBruteForceKey(scope, getClientIp(req)));
    if (!blocked.allowed) {
      return bruteForceResponse(blocked.retryAfterSec ?? 900);
    }
  }

  if (
    req.method === 'POST' &&
    (pathname === '/api/auth/forgot-password' || pathname === '/api/auth/reset-password')
  ) {
    const limited = consumeRateLimit(`reset:${getClientIp(req)}`, 5, 15 * 60_000);
    if (!limited.allowed) {
      return bruteForceResponse(limited.retryAfterSec ?? 900);
    }
  }

  if (isPublic(pathname)) {
    // Se já estiver logado e tentar acessar /login, redireciona ao dashboard.
    if (pathname === '/login' || pathname === '/register') {
      const access = req.cookies.get(ACCESS_COOKIE)?.value;
      if (await isValidAccess(access)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  if (await isValidAccess(access)) return NextResponse.next();

  // Sem access válido, mas com refresh: deixa passar; o servidor renovará via getCurrentUser().
  if (refresh) return NextResponse.next();

  // Não autenticado: para APIs retorna 401, para páginas redireciona ao login.
  if (pathname.startsWith('/api')) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and image optimizations.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css)$).*)',
  ],
};
