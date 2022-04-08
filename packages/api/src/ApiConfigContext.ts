import { createContext } from 'react';

import { fetcher } from './fetcher';
import { ApiFetcher } from './types';

// Types
export interface ApiConfigContextProps {
  /**
   * Fetcher used to send requests.
   */
  fetcher: ApiFetcher;
}

// Context
export const ApiConfigContext = createContext({
  fetcher,
});
