import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Хук для выполнения запросов только после авторизации
 * Предотвращает API вызовы до успешной аутентификации
 *
 * Поддерживает два варианта вызова:
 * 1. Новый синтаксис v5: useAuthenticatedQuery({ queryKey, queryFn, ... })
 * 2. Старый синтаксис (для обратной совместимости): useAuthenticatedQuery(queryKey, queryFn, options)
 */
export function useAuthenticatedQuery<T = any>(
  queryKeyOrOptions: QueryKey | UseQueryOptions<T>,
  queryFn?: any,
  options?: any
) {
  const { isAuthenticated, isVerifying } = useAuth();

  // Определяем, какой синтаксис использован
  // Новый синтаксис - это объект с полем queryKey
  // Старый синтаксис - это массив или строка (queryKey напрямую)
  const isNewSyntax = typeof queryKeyOrOptions === 'object' &&
                      !Array.isArray(queryKeyOrOptions) &&
                      'queryKey' in queryKeyOrOptions;

  if (isNewSyntax) {
    // Новый синтаксис v5: useAuthenticatedQuery({ queryKey, queryFn, ... })
    const opts = queryKeyOrOptions as UseQueryOptions<T>;
    return useQuery<T>({
      ...opts,
      enabled: isAuthenticated && !isVerifying && (opts.enabled !== false),
    });
  } else {
    // Старый синтаксис v4: useAuthenticatedQuery(['key'], fn, options)
    const queryKey = queryKeyOrOptions as QueryKey;
    return useQuery<T>({
      queryKey,
      queryFn,
      ...options,
      enabled: isAuthenticated && !isVerifying && (options?.enabled !== false),
    });
  }
}
