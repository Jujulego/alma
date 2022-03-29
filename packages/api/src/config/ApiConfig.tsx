import { FC } from 'react';

import { ApiConfigContext, ApiConfigContextProps } from './ApiConfigContext';
import { fetcher as defaultFetcher } from './fetcher';

// Types
export type ApiConfigProps = Partial<ApiConfigContextProps>;

// Component
/**
 * Setup alma-api config for children
 */
export const ApiConfig: FC<ApiConfigProps> = ({ fetcher = defaultFetcher, children }) => (
  <ApiConfigContext.Provider value={{ fetcher }}>
    { children }
  </ApiConfigContext.Provider>
);
