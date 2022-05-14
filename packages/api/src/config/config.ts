import { globalWarehouse } from '@jujulego/alma-resources';

import { ApiConfig } from '../types';
import { fetcher } from './fetcher';

// Constants
export const GLOBAL_API_CONFIG = Symbol('jujulego:alma-api:global-config');

// Types
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

/**
 * Setup global configuration
 * @param config
 */
export function almaApiConfig(config: Partial<ApiConfig>) {
  Object.assign(globalApiConfig(), config);
}
