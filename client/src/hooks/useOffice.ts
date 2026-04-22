import { createContext, useContext } from 'react';
import type { Office } from '../api/admin/offices';

export interface OfficeContextValue {
  offices: Office[];
  currentOfficeId: number;
  setCurrentOfficeId: (id: number) => void;
  currentOffice: Office | undefined;
}

export const OfficeContext = createContext<OfficeContextValue>({
  offices: [],
  currentOfficeId: 1,
  setCurrentOfficeId: () => {},
  currentOffice: undefined,
});

export const useOffice = () => useContext(OfficeContext);
