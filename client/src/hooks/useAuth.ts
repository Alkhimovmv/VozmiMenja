import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/admin/auth';

export interface AdminUser {
  id: number;
  phone: string;
  role: 'superadmin' | 'admin';
  name: string | null;
  created_at: string;
}

const VIEW_AS_KEY = 'viewAsUserId';

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [viewAsUserId, setViewAsUserIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(VIEW_AS_KEY);
    return saved ? parseInt(saved) : null;
  });

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('authToken'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
    },
    onError: () => {
      localStorage.removeItem('authToken');
      setToken(null);
    },
  });

  const verifyQuery = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: authApi.verify,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (verifyQuery.error) {
      const error: any = verifyQuery.error;
      if (error?.response?.status === 401) {
        localStorage.removeItem('authToken');
        setToken(null);
      }
    }
  }, [verifyQuery.error]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem(VIEW_AS_KEY);
    setToken(null);
    window.location.href = '/admin/rent/login';
  };

  const setViewAsUserId = (id: number | null) => {
    setViewAsUserIdState(id);
    if (id === null) {
      localStorage.removeItem(VIEW_AS_KEY);
    } else {
      localStorage.setItem(VIEW_AS_KEY, String(id));
    }
  };

  const user: AdminUser | undefined = verifyQuery.data?.user;
  const isSuperAdmin = user?.role === 'superadmin';
  const isVerifying = isAuthenticated ? verifyQuery.isLoading : false;

  // Суперадмин без выбора аккаунта видит пустые данные
  const hasSelectedAccount = !isSuperAdmin || viewAsUserId !== null;

  return {
    isAuthenticated,
    login: (credentials: { phone: string; password: string }) => loginMutation.mutate(credentials),
    loginError: loginMutation.error,
    loginLoading: loginMutation.isPending,
    logout,
    user,
    isSuperAdmin,
    isVerifying,
    viewAsUserId,
    setViewAsUserId,
    hasSelectedAccount,
  };
};
