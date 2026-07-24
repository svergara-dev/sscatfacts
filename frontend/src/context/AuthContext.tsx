import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { register as registerApi } from '@/services/authService';
import type { UserData, ApiError } from '@/types/api';

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  error: ApiError | null;
  register: (username: string, password: string, confirmPassword: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, register, clearError }}>
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
