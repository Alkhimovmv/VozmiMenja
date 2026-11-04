import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { ADMIN_LEAD_REPORT_QUERY_KEY, invalidateAdminLeadReport } from './adminLeadReport';

const queryClient = new QueryClient();
queryClient.setQueryData(ADMIN_LEAD_REPORT_QUERY_KEY, { rows: [] });
assert.equal(queryClient.getQueryState(ADMIN_LEAD_REPORT_QUERY_KEY)?.isInvalidated, false);

await invalidateAdminLeadReport(queryClient);

assert.equal(queryClient.getQueryState(ADMIN_LEAD_REPORT_QUERY_KEY)?.isInvalidated, true);
console.log('admin lead report invalidation tests passed');
