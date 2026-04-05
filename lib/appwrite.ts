'use client';

import { Client, Account, ID, Models } from 'appwrite';

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
 * Logout user
 */
export async function logoutUser(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
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
