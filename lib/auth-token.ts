export type BrowserAuthTokenPayload = {
  user_id?: string;
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
