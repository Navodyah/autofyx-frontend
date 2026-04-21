export type BrowserAuthTokenPayload = {
  user_id?: string;
  appwrite_id?: string;
  email?: string;
  user_type?: 'user' | 'admin' | 'researcher' | string;
  session_id?: string;
  iat: number;
};

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return atob(normalized + '='.repeat(padLength));
}

export function createBrowserAuthToken(payload: Omit<BrowserAuthTokenPayload, 'iat'>): string {
  const header = { alg: 'none', typ: 'JWT' };
  const body: BrowserAuthTokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(body))}.`;
}

export function parseBrowserAuthToken(token: string | null): BrowserAuthTokenPayload | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(fromBase64Url(parts[1]));
  } catch {
    return null;
  }
}

export function getUserTypeFromToken(token: string | null): string | null {
  const parsed = parseBrowserAuthToken(token);
  return parsed?.user_type ?? null;
}

export function getDashboardRouteByUserType(userType: string | null | undefined): string {
  const normalized = (userType || '').toLowerCase();

  if (normalized === 'admin') return '/admin_dashboard';
  if (normalized === 'researcher') return '/researcher';
  return '/dashboard';
}

function pathStartsWith(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function isPathAllowedForUserType(pathname: string, userType: string | null | undefined): boolean {
  const normalizedRole = (userType || '').toLowerCase();

  if (normalizedRole === 'admin') {
    return pathStartsWith(pathname, '/admin') || pathStartsWith(pathname, '/admin_dashboard');
  }

  if (normalizedRole === 'researcher') {
    return pathStartsWith(pathname, '/researcher');
  }

  return pathStartsWith(pathname, '/dashboard');
}

export function sanitizeNextPath(nextPath: string | null | undefined): string | null {
  if (!nextPath) return null;
  if (!nextPath.startsWith('/')) return null;
  if (nextPath.startsWith('//')) return null;
  if (
    pathStartsWith(nextPath, '/login') ||
    pathStartsWith(nextPath, '/register') ||
    pathStartsWith(nextPath, '/auth/login') ||
    pathStartsWith(nextPath, '/auth/register')
  ) {
    return null;
  }

  return nextPath;
}

export function resolvePostLoginPath(userType: string | null | undefined, nextPath?: string | null): string {
  const dashboardRoute = getDashboardRouteByUserType(userType);
  const sanitizedNext = sanitizeNextPath(nextPath);

  if (!sanitizedNext) return dashboardRoute;
  if (!isPathAllowedForUserType(sanitizedNext, userType)) return dashboardRoute;

  return sanitizedNext;
}
