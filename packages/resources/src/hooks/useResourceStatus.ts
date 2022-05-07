import { useSyncExternalStore } from 'react';

import { Resource, ResourceStatus } from '../resources/resource';

// Hook
/**
 * Returns the current status of the given resource
 * @param resource
 */
export function useResourceStatus(resource: Resource<unknown>): ResourceStatus {
  return useSyncExternalStore(
    (cb: () => void) => {
      resource.addEventListener('update', cb);
      return () => resource.removeEventListener('update', cb);
    },
    () => resource.status
  );
}
