import { useSyncExternalStore } from 'react';

import { Resource, ResourceStatus } from './resource';

// Hook
export function useResourceStatus(resource: Resource<unknown>): ResourceStatus {
  return useSyncExternalStore(
    (cb: () => void) => {
      resource.addEventListener('status', cb);
      return () => resource.removeEventListener('status', cb);
    },
    () => resource.status
  );
}
