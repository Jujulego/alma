import { useCallback, useContext, useState } from 'react';

import { GqlSubscriptionContext } from '../sub';
import { GqlErrorResponse, GqlRequest, GqlVariables } from '../types';

// Type
export interface GqlSubscriptionData<D = unknown, V extends GqlVariables = GqlVariables> {
  completed: boolean;
  data?: D;
  error?: GqlErrorResponse;

  subscribe(vars: V): () => void;
}

// Hook
export function useSubscriptionRequest<D = unknown, V extends GqlVariables = GqlVariables>(req: GqlRequest<D, V>): GqlSubscriptionData<D, V> {
  // State
  const [completed, setCompleted] = useState(false);
  const [data, setData] = useState<D>();
  const [error, setError] = useState<GqlErrorResponse>();

  // Context
  const { client } = useContext(GqlSubscriptionContext);

  // Callbacks
  const subscribe = useCallback((vars: V) => {
    if (!client) {
      return () => { return; };
    }

    setCompleted(false);
    return client.subscribe<D>({ ...req, variables: vars }, {
      next(value) {
        setData(value.data as D);
      },
      complete() {
        setCompleted(true);
      },
      error(error: unknown) {
        setError(error as GqlErrorResponse);
      }
    });
  }, [req, client, setData, setError]);

  return { completed, data, error, subscribe };
}