import { createContext } from 'react';

import { ApiFetcher } from '../types';
import { fetcher } from './fetcher';

// Types
export interface ApiConfigContextProps {
  /**
   * Fetcher used to send requests.
   * Default implementation uses fetch.
   */
  fetcher: ApiFetcher;
}

// Context
export const ApiConfigContext = createContext<ApiConfigContextProps>({
  fetcher
});
