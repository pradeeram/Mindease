import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  mfaPending: { mfaRequired: boolean; userId?: string; email?: string } | null;
  login: (credentials: { email: string; password: string; mfaToken?: string }) => Promise<{ mfaRequired?: boolean; user?: User }>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  clearMfaPending: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mindease_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindease_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mfaPending, setMfaPending] = useState<{ mfaRequired: boolean; userId?: string; email?: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('mindease_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/profile');
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('mindease_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          // Handled by axios interceptor
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string; mfaToken?: string }) => {
    const res = await api.post('/auth/login', credentials);
    const data = res.data?.data;

    if (data?.mfaRequired) {
      setMfaPending({
        mfaRequired: true,
        userId: data.userId,
        email: data.email,
      });
      return { mfaRequired: true };
    }

    if (data?.accessToken && data?.user) {
      setToken(data.accessToken);
      setUser(data.user);
      setMfaPending(null);
      localStorage.setItem('mindease_token', data.accessToken);
      localStorage.setItem('mindease_user', JSON.stringify(data.user));
      return { mfaRequired: false, user: data.user };
    }

    return {};
  };

  const register = async (data: { email: string; password: string; name: string }) => {
    const res = await api.post('/auth/register', data);
    const resData = res.data?.data;

    if (resData?.accessToken && resData?.user) {
      setToken(resData.accessToken);
      setUser(resData.user);
      localStorage.setItem('mindease_token', resData.accessToken);
      localStorage.setItem('mindease_user', JSON.stringify(resData.user));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      setMfaPending(null);
      localStorage.removeItem('mindease_token');
      localStorage.removeItem('mindease_user');
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('mindease_user', JSON.stringify(newUser));
    }
  };

  const clearMfaPending = () => {
    setMfaPending(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, mfaPending, login, register, logout, updateUser, clearMfaPending }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
