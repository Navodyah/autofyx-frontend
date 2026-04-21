import { NextRequest, NextResponse } from 'next/server';

type TokenPayload = {
  user_type?: string;
  email?: string;
  user_id?: string;
  appwrite_id?: string;
};

const AUTH_PAGES = ['/login', '/register', '/auth/login', '/auth/register'];
const UNPROTECTED_PREFIXES = ['/auth/oauth', '/auth/callback'];
const USER_PROTECTED_PREFIXES = ['/dashboard'];
const ADMIN_PROTECTED_PREFIXES = ['/admin', '/admin_dashboard'];
const RESEARCHER_PROTECTED_PREFIXES = ['/researcher'];

function decodeTokenPayload(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function getDashboardByRole(role: string | undefined): string {
  const normalized = (role || '').toLowerCase();
  if (normalized === 'admin') return '/admin_dashboard';
  if (normalized === 'researcher') return '/researcher';
  return '/dashboard';
}

function pathStartsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function sanitizeNextPath(nextPath: string | null): string | null {
  if (!nextPath) return null;
  if (!nextPath.startsWith('/')) return null;
  if (nextPath.startsWith('//')) return null;
  if (AUTH_PAGES.some((path) => nextPath === path || nextPath.startsWith(`${path}/`))) return null;
  return nextPath;
}

function isPathAllowedForRole(pathname: string, role: string): boolean {
  if (role === 'admin') {
    return pathStartsWithAny(pathname, ADMIN_PROTECTED_PREFIXES);
  }

  if (role === 'researcher') {
    // Researchers have user privileges + researcher dashboard
    return (
      pathStartsWithAny(pathname, RESEARCHER_PROTECTED_PREFIXES) ||
      pathStartsWithAny(pathname, USER_PROTECTED_PREFIXES)
    );
  }

  return pathStartsWithAny(pathname, USER_PROTECTED_PREFIXES);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value;
  const payload = decodeTokenPayload(token);
  const role = (payload?.user_type || '').toLowerCase();
  // A token alone is sufficient to be considered authenticated.
  // role can be empty if the token was minted without user_type (edge case).
  const isAuthenticated = Boolean(token && payload);
  const requestedNextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'));

  // Allow the OAuth callback route through regardless
  if (pathStartsWithAny(pathname, UNPROTECTED_PREFIXES)) {
    return NextResponse.next();
  }

  if (AUTH_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = requestedNextPath && isPathAllowedForRole(requestedNextPath, role)
        ? requestedNextPath
        : getDashboardByRole(role);
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const isProtected =
    pathStartsWithAny(pathname, USER_PROTECTED_PREFIXES) ||
    pathStartsWithAny(pathname, ADMIN_PROTECTED_PREFIXES) ||
    pathStartsWithAny(pathname, RESEARCHER_PROTECTED_PREFIXES);

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  const wantsAdminArea = pathStartsWithAny(pathname, ADMIN_PROTECTED_PREFIXES);
  const wantsResearcherArea = pathStartsWithAny(pathname, RESEARCHER_PROTECTED_PREFIXES);
  const wantsUserArea = pathStartsWithAny(pathname, USER_PROTECTED_PREFIXES);

  if (wantsAdminArea && role !== 'admin') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDashboardByRole(role);
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  // Only plain 'user' role cannot access /researcher — researchers CAN access /researcher
  if (wantsResearcherArea && role !== 'researcher' && role !== 'admin') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDashboardByRole(role);
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  // /dashboard is allowed for 'user' AND 'researcher' (researchers inherit user access)
  if (wantsUserArea && role !== 'user' && role !== 'researcher' && role !== '') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = getDashboardByRole(role);
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
