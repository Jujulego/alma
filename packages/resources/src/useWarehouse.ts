import { createContext, useContext, useDebugValue } from 'react';

import { globalWarehouse, Warehouse } from './warehouse';

// Context
export const WarehouseCtx = createContext<Warehouse | null>(null);

// Hooks
export function useWarehouse(): Warehouse {
  // Context
  let warehouse = useContext(WarehouseCtx);

  // Use global instance if no context
  if (!warehouse) {
    warehouse = globalWarehouse();
  }

  useDebugValue(warehouse);
  return warehouse;
}
