import { FC, ReactNode } from 'react';

import { ApiConfigContext, ApiConfigContextProps } from './ApiConfigContext';
import { fetcher as defaultFetcher } from './fetcher';

// Types
export interface ApiConfigProps extends Partial<ApiConfigContextProps> {
  children?: ReactNode;
}

// Component
/**
 * Setup alma-api config for children
 */
export const ApiConfig: FC<ApiConfigProps> = ({ fetcher = defaultFetcher, children }) => (
  <ApiConfigContext.Provider value={{ fetcher }}>
    { children }
  </ApiConfigContext.Provider>
);
