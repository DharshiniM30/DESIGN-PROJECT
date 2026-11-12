import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, org?: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session against the backend on initial load / refresh
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      const storedToken = localStorage.getItem('verity_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('verity_user');
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await api.getCurrentUser(storedToken);
        if (isMounted) {
          setUser(res.user);
          setToken(storedToken);
          localStorage.setItem('verity_user', JSON.stringify(res.user));
        }
      } catch (err) {
        console.warn('Session verification rejected:', err);
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('verity_user');
          localStorage.removeItem('verity_token');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    // Calls real backend authentication
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('verity_user', JSON.stringify(res.user));
    localStorage.setItem('verity_token', res.token);
  };

  const register = async (name: string, email: string, pass: string, org?: string) => {
    const res = await api.register({ name, email, password: pass, organization: org });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('verity_user', JSON.stringify(res.user));
    localStorage.setItem('verity_token', res.token);
  };

  const logout = () => {
    if (token) {
      api.logoutUser(token).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('verity_user');
    localStorage.removeItem('verity_token');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('verity_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
