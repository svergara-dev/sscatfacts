import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { register as registerApi, login as loginApi, getMe } from '@/services/authService';
import type { UserData, ApiError } from '@/types/api';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: ApiError | null;
  register: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const token = localStorage.getItem('token');

    if (!token) {
      if (mountedRef.current) setIsInitializing(false);
      return;
    }

    getMe()
      .then((response) => {
        if (!mountedRef.current) return;
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        if (!mountedRef.current) return;
        localStorage.removeItem('token');
      })
      .finally(() => {
        if (mountedRef.current) setIsInitializing(false);
      });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const register = useCallback(
    async (username: string, password: string, confirmPassword: string) => {
      setIsLoading(true);
      setError(null);

      const response = await registerApi({ username, password, confirmPassword });

      setIsLoading(false);

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }

      if (response.error) {
        setError(response.error);
      }
      return false;
    },
    [],
  );

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const response = await loginApi({ username, password });

    setIsLoading(false);

    if (response.success && response.data) {
      setUser(response.data.user);
      return true;
    }

    if (response.error) {
      setError(response.error);
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isInitializing, error, register, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
