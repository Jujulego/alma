import isEqual from 'lodash.isequal';
import { useRef } from 'react';

/**
 * useDeepMemo hook
 * Use lodash isEqual to test if the parameter equals the previous one.
 * If it is, returns the previous reference of to this object.
 *
 * @param obj
 */
export function useDeepMemo<T>(obj: T): T {
  const ref = useRef<T>(obj);

  if (!isEqual(ref.current, obj)) {
    ref.current = obj;
  }

  return ref.current;
}