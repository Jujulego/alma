import { useDeepMemo } from '@jujulego/alma-utils';
import { useContext, useEffect, useState } from 'react';

import { GqlSubscriptionContext } from '../sub';
import { GqlErrorResponse, GqlRequest, GqlVariables } from '../types';

// Type
export interface GqlSubscriptionData<D = unknown> {
  data?: D;
  error?: GqlErrorResponse;
}

// Hook
export function useSubscriptionRequest<D = unknown, V extends GqlVariables = GqlVariables>(id: string, req: GqlRequest<D, V>, vars: V): GqlSubscriptionData<D> {
  // Stabilise objects
  const svars = useDeepMemo(vars);

  // State
  const [data, setData] = useState<D>();
  const [error, setError] = useState<GqlErrorResponse>();

  // Context
  const { message, request, unsubscribe } = useContext(GqlSubscriptionContext);

  // Effects
  useEffect(() => {
    request(id, { ...req, variables: svars });
    return () => unsubscribe(id);
  }, [id, req, svars, request, unsubscribe]);

  useEffect(() => {
    if (!message) return;
    if (message.id !== id) return;

    switch (message.type) {
      case 'GQL_DATA':
        setData(message.payload.data as D);

        if (message.payload.errors?.length) {
          setError(message.payload as GqlErrorResponse);
        }

        break;

      case 'GQL_ERROR':
        setError(message.payload);
        break;
    }
  }, [id, message, setData, setError]);

  return { data, error };
}