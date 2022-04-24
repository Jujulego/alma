import { FC, ReactNode } from 'react';

import { ApiConfigContext, globalApiConfig } from './config';
import { ApiConfig } from './types';

// Props
export interface AlmaApiSetupProps extends Partial<ApiConfig> {
  children: ReactNode;
}

// Component
export const AlmaApiSetup: FC<AlmaApiSetupProps> = (props) => {
  const global = globalApiConfig();
  const {
    fetcher = global.fetcher,
    warehouse = global.warehouse,
    children
  } = props;

  // Render
  return (
    <ApiConfigContext.Provider value={{ fetcher, warehouse }}>
      { children }
    </ApiConfigContext.Provider>
  );
};
