'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  registerUser,
  loginUser,
  performFullLogout,
  persistBrowserAuthSession,
  updateUserProfile,
  User,
  RegisterInput,
  LoginInput,
} from '@/lib/appwrite';
import { createBrowserAuthToken } from '@/lib/auth-token';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionId: string | null;
  register: (data: RegisterInput) => Promise<void>;
  login: (credentials: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionData = localStorage.getItem('auth_session');
        const userData = localStorage.getItem('user_data');

        if (sessionData && userData) {
          const session = JSON.parse(sessionData);
          const parsedUser = JSON.parse(userData);
          setSessionId(session.sessionId);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid data
        localStorage.removeItem('auth_session');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);

      const sessionData = {
        sessionId: response.session_id,
        timestamp: new Date().toISOString(),
      };

      const userData = response.user;
      const token = createBrowserAuthToken({
        user_id: userData?.user_id,
        appwrite_id: userData?.appwrite_id,
        email: userData?.email,
        user_type: userData?.user_type,
        session_id: response.session_id,
      });

      localStorage.setItem('auth_session', JSON.stringify(sessionData));
      localStorage.setItem('user_data', JSON.stringify(userData));
      persistBrowserAuthSession(token);

      setSessionId(response.session_id ?? null);
      setUser(userData ?? null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // performFullLogout: deletes Appwrite session + notifies backend + wipes all tokens
      await performFullLogout(sessionId);
      setSessionId(null);
      setUser(null);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    if (!user) throw new Error('No user logged in');

    setError(null);
    try {
      await updateUserProfile(user.user_id, data);

      // Update local user state
      const updatedUser = { ...user, ...data } as User;
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!sessionId,
    sessionId,
    register,
    login,
    logout,
    updateProfile,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
