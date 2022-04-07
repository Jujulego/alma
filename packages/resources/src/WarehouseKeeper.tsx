import { WarehouseCtx } from './useWarehouse';
import { Warehouse } from './warehouse';
import { FC, useRef } from 'react';

// Component
export const WarehouseKeeper: FC = ({ children }) => {
  // Refs
  const { current: warehouse } = useRef(new Warehouse());

  // Render
  return (
    <WarehouseCtx.Provider value={warehouse}>
      { children }
    </WarehouseCtx.Provider>
  );
};
