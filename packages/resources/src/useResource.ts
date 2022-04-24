import { useEffect, useState } from 'react';

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
  const _warehouse = useWarehouse();
  const { warehouse = _warehouse, creator = () => new Resource<T>() } = options;

  const [res, setRes] = useState(warehouse.getOrCreate(key, creator));

  useEffect(() => {
    const listener: WarehouseUpdateEventListener<T> = (evt) => {
      if (evt.key === key) {
        setRes(evt.newResource);
      }
    };

    warehouse.addEventListener('update', listener);
    return () => warehouse.removeEventListener('update', listener);
  }, [key, warehouse]);

  return res;
}
