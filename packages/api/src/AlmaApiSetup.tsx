import { FC, ReactNode } from 'react';

import { ApiConfigContext } from './ApiConfigContext';
import { fetcher as defaultFetcher } from './fetcher';
import { ApiFetcher } from './types';

// Props
export interface AlmaApiSetupProps {
  fetcher?: ApiFetcher;
  children: ReactNode;
}

// Component
export const AlmaApiSetup: FC<AlmaApiSetupProps> = (props) => {
  const { fetcher = defaultFetcher, children } = props;

  // Render
  return (
    <ApiConfigContext.Provider value={{ fetcher }}>
      { children }
    </ApiConfigContext.Provider>
  );
};
