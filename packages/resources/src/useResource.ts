import { startTransition, useLayoutEffect, useState } from 'react';

import { Resource } from './resource';
import { Warehouse, WarehouseUpdateEventListener } from './warehouse';
import { useWarehouse } from './useWarehouse';

// Types
export interface UseResourceOptions<T> {
  warehouse?: Warehouse;
  creator?: () => Resource<T>;
}

// Hook
export function useResource<T>(key: string, options?: Omit<UseResourceOptions<T>, 'creator'>): Resource<T>;
export function useResource<T, R extends Resource<T>>(key: string, options?: UseResourceOptions<T> & { creator: () => R }): R;
export function useResource<T>(key: string, options: UseResourceOptions<T> = {}): Resource<T> {
  const { creator = () => new Resource<T>() } = options;

  // Context
  const warehouse = useWarehouse(options.warehouse);

  // State
  const [res, setRes] = useState(warehouse.getOrCreate(key, creator));

  // Effects
  useLayoutEffect(() => {
    // Get resource
    startTransition(() => {
      setRes(warehouse.getOrCreate(key, creator));
    });

    // Listen for updates
    const listener: WarehouseUpdateEventListener<T> = (evt) => {
      if (evt.key === key) {
        startTransition(() => {
          setRes(evt.newResource);
        });
      }
    };

    warehouse.addEventListener('update', listener);
    return () => warehouse.removeEventListener('update', listener);
  }, [key, creator, warehouse]);

  return res;
}
