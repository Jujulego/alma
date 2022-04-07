import { useSyncExternalStore } from 'react';

import { Resource } from './resource';
import { useWarehouse } from './useWarehouse';
import { WarehouseUpdateEventListener } from './warehouse';

// Hook
export function useResource<T>(key: string, options: { create: true }): Resource<T>;
export function useResource<T>(key: string, options?: { create?: false }): Resource<T> | undefined;
export function useResource<T>(key: string, options?: { create?: boolean }): Resource<T> | undefined {
  const warehouse = useWarehouse();

  return useSyncExternalStore(
    (cb: () => void) => {
      const listener: WarehouseUpdateEventListener = (evt) => {
        if (evt.key === key) cb();
      };

      warehouse.addEventListener('update', listener);
      return () => warehouse.removeEventListener('update', listener);
    },
    () => options?.create ? warehouse.getOrCreate<T>(key) : warehouse.get<T>(key)
  );
}
