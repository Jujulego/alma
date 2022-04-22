import { globalWarehouse, Warehouse } from '@jujulego/alma-resources';

import { fetcher } from './fetcher';
import { ApiFetcher } from '../types';

// Constants
export const GLOBAL_API_CONFIG = Symbol('jujulego:alma-api:global-config');

// Types
export interface ApiConfig {
  fetcher: ApiFetcher;
  warehouse: Warehouse;
}

declare global {
  interface Window {
    [GLOBAL_API_CONFIG]?: ApiConfig;
  }
}

// Utils
export function globalApiConfig(): ApiConfig {
  return self[GLOBAL_API_CONFIG] ??= {
    fetcher,
    warehouse: globalWarehouse()
  };
}
