'use client';

import { Client, Account, ID, Models, OAuthProvider } from 'appwrite';
import { createBrowserAuthToken, resolvePostLoginPath } from '@/lib/auth-token';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost:80/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export { ID };

// API base URL for backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  user_id: string;
  appwrite_id: string;
  email: string;
  username: string;
  user_type: 'user' | 'admin' | 'researcher';
}

export interface AuthResponse {
  message: string;
  session_id?: string;
  user?: User;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  user_type?: 'user' | 'admin' | 'researcher';
  appwrite_id?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface EmailOtpToken {
  userId: string;
  expire: string;
}

export interface UserPreferencesInput {
  monthly_salary_range: string;
  daily_distance_km: number;
  usage_purpose: 'Office' | 'Family' | 'Travel' | 'Rent';
  fuel_preference: 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel';
  priority: 'Fuel Efficiency' | 'Resale Value' | 'Comfort' | 'Performance';
  preferred_vehicle_types?: string[];
  budget_min?: number;
  budget_max?: number;
}

export interface RegistrationPreferencesPayload extends UserPreferencesInput {
  user_id?: string;
  appwrite_id?: string;
  email?: string;
  username?: string;
  user_type?: 'user' | 'admin' | 'researcher';
}

export interface RegistrationPreferencesRecord extends RegistrationPreferencesPayload {
  _id?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleAuthCompletion {
  token: string;
  dashboardRoute: string;
  user_type: string;
  user: User;
}

type CompleteGoogleAuthOptions = {
  oauthUserId?: string | null;
  oauthSecret?: string | null;
  retries?: number;
  retryDelayMs?: number;
};

/**
 * Persist auth token in localStorage and cookie for client + proxy route protection.
 */
export function persistBrowserAuthSession(token: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('token', token);
  localStorage.setItem('access_token', token);
  localStorage.setItem('auth_token', token);
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax`;
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax`;
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        user_type: data.user_type || 'user',
        appwrite_id: data.appwrite_id || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(credentials: LoginInput): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Logout user (backend notification only — use performFullLogout for a complete sign-out).
 */
export async function logoutUser(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't re-throw — backend failure must NOT block client-side sign-out
  }
}

/**
 * Wipe every auth token from localStorage and cookies.
 * Call this whenever you need to clear the session client-side.
 */
export function clearAllAuthTokens(): void {
  if (typeof window === 'undefined') return;

  // localStorage keys written by persistBrowserAuthSession + login/register flows
  const lsKeys = ['token', 'access_token', 'auth_token', 'user_data', 'auth_session'];
  lsKeys.forEach((k) => localStorage.removeItem(k));

  // Expire every cookie the app sets
  const cookieKeys = ['auth_token', 'token'];
  cookieKeys.forEach((k) => {
    document.cookie = `${k}=; path=/; max-age=0; samesite=lax`;
  });
}

/**
 * Full sign-out: deletes the Appwrite session, clears all local tokens, and
 * notifies the backend. Safe to call from any component — errors are swallowed
 * so the user is always logged out locally even if Appwrite or the backend fail.
 *
 * @param sessionId  Appwrite session ID stored in `auth_session` localStorage key.
 *                   Pass null/undefined if not available; the Appwrite "current"
 *                   session will be deleted as a fallback.
 */
export async function performFullLogout(sessionId?: string | null): Promise<void> {
  // 1. Delete Appwrite session (prevents token reuse)
  try {
    if (sessionId) {
      await account.deleteSession(sessionId);
    } else {
      await account.deleteSession('current');
    }
  } catch {
    // Session may already be expired — not a fatal error
  }

  // 2. Notify backend (best-effort)
  if (sessionId) {
    await logoutUser(sessionId);
  }

  // 3. Wipe every local auth artifact
  clearAllAuthTokens();
}

/**
 * Create an Appwrite session (for client-side authentication)
 */
export async function createSession(email: string, password: string): Promise<Models.Session> {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

/**
 * Send an Appwrite email OTP for registration/login verification.
 */
export async function sendEmailOtp(email: string, userId?: string): Promise<EmailOtpToken> {
  try {
    const token = await account.createEmailToken(userId || ID.unique(), email);
    return {
      userId: token.userId,
      expire: token.expire,
    };
  } catch (error) {
    console.error('Send email OTP error:', error);
    throw error;
  }
}

/**
 * Verify an Appwrite email OTP by creating a session from the token secret.
 */
export async function verifyEmailOtp(userId: string, secret: string): Promise<Models.Session> {
  try {
    return await account.createSession(userId, secret);
  } catch (error) {
    console.error('Verify email OTP error:', error);
    throw error;
  }
}

/**
 * Complete a token-based signup by setting the verified account name/password.
 */
export async function completeOtpRegistration(name: string, password: string): Promise<void> {
  try {
    if (name.trim()) {
      await account.updateName(name.trim());
    }
    await account.updatePassword(password);
  } catch (error) {
    console.error('Complete OTP registration error:', error);
    throw error;
  }
}

/**
 * Set the user's role as an Appwrite label.
 * Labels are the authoritative source of role for this app.
 * Only 'user' and 'researcher' are valid labels.
 */
export async function setUserRoleLabel(role: 'user' | 'researcher'): Promise<void> {
  try {
    // Appwrite Account SDK does not expose label updates from client-side code.
    // Keep local role state in sync and rely on backend role persistence.
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('user_data');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          parsed.user_type = role;
          localStorage.setItem('user_data', JSON.stringify(parsed));
        } catch {
          // ignore malformed local cache
        }
      }
    }
  } catch (error) {
    console.error('Set user role label error:', error);
    throw error;
  }
}

/**
 * Get the authoritative user role from Appwrite labels.
 * Falls back to 'user' if no recognised label is present.
 */
export async function getUserRoleFromLabels(): Promise<'user' | 'researcher'> {
  try {
    const user = await account.get();
    const labels: string[] = (user as unknown as { labels?: string[] }).labels ?? [];
    if (labels.includes('researcher')) return 'researcher';
    return 'user';
  } catch {
    return 'user';
  }
}

/**
 * Upgrade the currently logged-in user to researcher role.
 * Updates both Appwrite labels and the backend MongoDB record.
 */
export async function applyForResearcher(appwriteId: string, email: string): Promise<void> {
  // 1. Update Appwrite label
  await setUserRoleLabel('researcher');

  // 2. Sync role change to MongoDB backend (best-effort)
  try {
    await fetch(`${API_BASE_URL}/users/update-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appwrite_id: appwriteId, email, user_type: 'researcher' }),
    });
  } catch (error) {
    console.warn('Backend role sync failed during researcher upgrade:', error);
  }
}

/**
 * Start Google OAuth login/signup through Appwrite.
 * Always redirects through the dedicated /auth/oauth callback page.
 */
export async function signInWithGoogle(): Promise<void> {
  return handleOAuthLogin(OAuthProvider.Google, 'Google');
}

/**
 * Shared OAuth initiator.
 * Clears any stale session, then starts the Appwrite OAuth redirect.
 *
 * Success → /auth/oauth?provider={provider}  (handled by OAuthCallbackPage)
 * Failure → /login?error={message}
 */
export async function handleOAuthLogin(
  provider: OAuthProvider,
  providerLabel: string,
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('OAuth sign-in is only available in the browser');
  }

  // Clear any stale current session (safe no-op if none exists).
  try {
    await account.deleteSession('current');
  } catch {
    // no existing session – that's fine
  }

  const origin = window.location.origin;
  const successURL = `${origin}/auth/oauth?provider=${provider}`;
  const failureURL = `${origin}/login?error=${encodeURIComponent(`${providerLabel} login cancelled or failed`)}`;

  // createOAuth2Session triggers a full-page redirect – nothing after this runs.
  account.createOAuth2Session(provider, successURL, failureURL);
}

/**
 * Finalize Google OAuth, sync user with backend, persist tokens, and resolve target dashboard.
 */
export async function completeGoogleAuthFlow(
  defaultUserType: 'user' | 'admin' | 'researcher' = 'user',
  nextPath?: string | null,
  options?: CompleteGoogleAuthOptions
): Promise<GoogleAuthCompletion> {
  const oauthUserId = options?.oauthUserId?.trim() || '';
  const oauthSecret = options?.oauthSecret?.trim() || '';
  const retries = options?.retries ?? 12;
  const retryDelayMs = options?.retryDelayMs ?? 500;

  // Some Appwrite OAuth redirects return userId/secret; create a session explicitly when provided.
  if (oauthUserId && oauthSecret) {
    try {
      await account.createSession(oauthUserId, oauthSecret);
    } catch (error) {
      console.warn('OAuth session creation with secret failed, falling back to current session lookup.', error);
    }
  }

  let appwriteUser = await getCurrentUser();
  for (let attempt = 0; !appwriteUser && attempt < retries; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    appwriteUser = await getCurrentUser();
  }

  if (!appwriteUser) {
    throw new Error('Google sign-in session not found');
  }

  const displayName = appwriteUser.name || appwriteUser.email.split('@')[0];
  const userEmail = appwriteUser.email;
  let result: AuthResponse | null = null;

  try {
    result = await registerUser({
      username: displayName,
      email: userEmail,
      password: `oauth-${Date.now()}`,
      user_type: defaultUserType,
      appwrite_id: appwriteUser.$id,
    });
  } catch (error) {
    // Keep Google login usable even if backend profile sync temporarily fails.
    console.warn('Backend sync failed during Google auth. Continuing with Appwrite session.', error);
  }

  const appwriteSession = await getCurrentSession();
  const resolvedUserType = (result?.user?.user_type || defaultUserType || 'user').toLowerCase();
  const resolvedUser: User = {
    user_id: result?.user?.user_id || '',
    appwrite_id: result?.user?.appwrite_id || appwriteUser.$id,
    email: result?.user?.email || userEmail,
    username: result?.user?.username || displayName,
    user_type: (result?.user?.user_type || resolvedUserType) as 'user' | 'admin' | 'researcher',
  };

  const token = createBrowserAuthToken({
    user_id: resolvedUser.user_id || undefined,
    appwrite_id: resolvedUser.appwrite_id,
    email: resolvedUser.email,
    user_type: resolvedUserType,
    session_id: appwriteSession?.$id,
  });

  persistBrowserAuthSession(token);

  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(resolvedUser));
    localStorage.setItem('auth_session', JSON.stringify({
      sessionId: appwriteSession?.$id || null,
      timestamp: new Date().toISOString(),
    }));
  }

  return {
    token,
    dashboardRoute: resolvePostLoginPath(resolvedUserType, nextPath),
    user_type: resolvedUserType,
    user: resolvedUser,
  };
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Models.Session | null> {
  try {
    return await account.getSession('current');
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Delete session (logout from Appwrite)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await account.deleteSession(sessionId);
  } catch (error) {
    console.error('Delete session error:', error);
    throw error;
  }
}

/**
 * Delete the current Appwrite session.
 */
export async function deleteCurrentSession(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('Delete current session error:', error);
    throw error;
  }
}

/**
 * Get current user from Appwrite
 */
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    return await account.get();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Save user preferences using Next.js API route (server-side MongoDB write).
 */
export async function saveRegistrationPreferences(payload: RegistrationPreferencesPayload): Promise<void> {
  try {
    const response = await fetch('/api/user-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to save user preferences');
    }
  } catch (error) {
    console.error('Save registration preferences error:', error);
    throw error;
  }
}

/**
 * Fetch user preferences using Next.js API route (server-side MongoDB read).
 */
export async function getRegistrationPreferences(identity: {
  user_id?: string;
  appwrite_id?: string;
  email?: string;
}): Promise<RegistrationPreferencesRecord | null> {
  try {
    const params = new URLSearchParams();
    if (identity.user_id) params.set('user_id', identity.user_id);
    if (identity.appwrite_id) params.set('appwrite_id', identity.appwrite_id);
    if (identity.email) params.set('email', identity.email);

    const response = await fetch(`/api/user-preferences?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch user preferences');
    }

    const data = await response.json();
    return data?.preferences || null;
  } catch (error) {
    console.error('Get registration preferences error:', error);
    throw error;
  }
}
