import type { QueryClient } from '@tanstack/react-query';

export const ADMIN_LEAD_REPORT_QUERY_KEY = ['admin-lead-report'] as const;

export const invalidateAdminLeadReport = (queryClient: QueryClient) => queryClient.invalidateQueries({
  queryKey: ADMIN_LEAD_REPORT_QUERY_KEY,
  exact: false,
});
