'use client';

import { Client, Account, ID } from 'appwrite';

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
}

export interface LoginInput {
  email: string;
  password: string;
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
export async function updateUserProfile(userId: string, data: Record<string, any>): Promise<any> {
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
export async function createSession(email: string, password: string): Promise<any> {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<any> {
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
 * Get current user from Appwrite
 */
export async function getCurrentUser(): Promise<any> {
  try {
    return await account.get();
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
