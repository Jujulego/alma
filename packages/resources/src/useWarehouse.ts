import { createContext, useContext, useDebugValue } from 'react';

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
export const WarehouseCtx = createContext<Warehouse | undefined>(undefined);

// Utils
export function globalWarehouse(): Warehouse {
  return self[GLOBAL_WAREHOUSE] ??= new Warehouse();
}

// Hooks
export function useWarehouse(warehouse?: Warehouse): Warehouse {
  // Context
  const _warehouse = useContext(WarehouseCtx);
  warehouse ??= _warehouse;

  // Use global instance if no option or context
  if (!warehouse) {
    warehouse = globalWarehouse();
  }

  useDebugValue(warehouse);
  return warehouse;
}
