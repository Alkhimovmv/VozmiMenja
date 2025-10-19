import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/admin/auth';

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const isAuthenticated = Boolean(token);

  // Синхронизируем состояние с localStorage
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
      window.location.reload(); // Перезагрузить страницу после успешного входа
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
  });

  // Обрабатываем ошибки верификации
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
    setToken(null);
    window.location.href = '/admin/rent/login';
  };

  // Если нет токена, то не проверяем - пользователь точно не аутентифицирован
  const isVerifying = isAuthenticated ? verifyQuery.isLoading : false;

  return {
    isAuthenticated,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    loginLoading: loginMutation.isLoading,
    logout,
    user: verifyQuery.data,
    isVerifying,
  };
};
