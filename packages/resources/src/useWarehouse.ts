import { createContext, useContext } from 'react';

import { Warehouse } from './warehouse';

// Constants
export const GLOBAL_WAREHOUSE = Symbol('jujulego:alma-resources:global-warehouse');

// Types
declare global {
  interface Window {
    [GLOBAL_WAREHOUSE]?: Warehouse;
  }
}

// Context
export const WarehouseCtx = createContext<Warehouse | null>(null);

// Hooks
export function useWarehouse(): Warehouse {
  // Context
  let warehouse = useContext(WarehouseCtx);

  // Use global instance if no context
  if (!warehouse) {
    warehouse = self[GLOBAL_WAREHOUSE] ??= new Warehouse();
  }

  return warehouse;
}
