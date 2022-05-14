import { Warehouse } from '@jujulego/alma-resources';

import { ApiFetcher } from './fetcher';

// Types
export interface ApiConfig {
  fetcher: ApiFetcher;
  warehouse: Warehouse;
}
