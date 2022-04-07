import { WarehouseCtx } from './useWarehouse';
import { Warehouse } from './warehouse';
import { FC, ReactNode, useRef } from 'react';

// Types
export interface WarehouseKeeperProps {
  children?: ReactNode;
}

// Component
export const WarehouseKeeper: FC<WarehouseKeeperProps> = ({ children }) => {
  // Refs
  const { current: warehouse } = useRef(new Warehouse());

  // Render
  return (
    <WarehouseCtx.Provider value={warehouse}>
      { children }
    </WarehouseCtx.Provider>
  );
};
