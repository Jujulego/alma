import { FC, ReactNode } from 'react';

import { ApiConfig, ApiConfigContext, globalApiConfig } from './config';

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
