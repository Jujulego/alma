import { useSyncExternalStore } from 'react';

import { Resource, ResourceStatus } from './resource';

// Hook
export function useResourceStatus(resource: Resource<unknown>): ResourceStatus {
  return useSyncExternalStore(
    (cb: () => void) => {
      resource.addEventListener('update', cb);
      return () => resource.removeEventListener('update', cb);
    },
    () => resource.status
  );
}
