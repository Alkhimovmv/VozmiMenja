import { useQuery, type QueryFunction, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from './useAuth';

/**
 * Хук для выполнения запросов только после авторизации
 * Предотвращает API вызовы до успешной аутентификации
 *
 * Поддерживает два варианта вызова:
 * 1. Новый синтаксис v5: useAuthenticatedQuery({ queryKey, queryFn, ... })
 * 2. Старый синтаксис (для обратной совместимости): useAuthenticatedQuery(queryKey, queryFn, options)
 */
export function useAuthenticatedQuery<T = unknown>(
  queryKeyOrOptions: QueryKey | UseQueryOptions<T>,
  queryFn?: QueryFunction<T, QueryKey>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();

  // Определяем, какой синтаксис использован
  // Новый синтаксис - это объект с полем queryKey
  // Старый синтаксис - это массив или строка (queryKey напрямую)
  const isNewSyntax = typeof queryKeyOrOptions === 'object' &&
                      !Array.isArray(queryKeyOrOptions) &&
                      'queryKey' in queryKeyOrOptions;

  const queryOptions = isNewSyntax
    ? (() => {
      const opts = queryKeyOrOptions as UseQueryOptions<T>;
      return {
      ...opts,
      enabled: isAuthenticated && (opts.enabled !== false),
      };
    })()
    : {
      queryKey: queryKeyOrOptions as QueryKey,
      queryFn,
      ...options,
      enabled: isAuthenticated && (options?.enabled !== false),
    };

  return useQuery<T>(queryOptions);
}
