import { createContext, useContext, useEffect, useState } from 'react';

import { GqlErrorResponse, GqlRequest, GqlVariables } from '../types';
import { GqlSubscriptionServerDataMessage } from './messages';

// Types
export interface GqlSubscriptionState<D = unknown> {
  message?: GqlSubscriptionServerDataMessage<D>;

  request(id: string, req: GqlRequest<D>): void;
  unsubscribe(id: string): void;
}

export interface GqlSubscriptionData<D = unknown> {
  data?: D;
  error?: GqlErrorResponse;
}

// Defaults
const gqlSubscriptionDefaults: GqlSubscriptionState = {
  request() {
    console.warn('useGqlSubscription needs GqlSubscriptionClient');
  },

  unsubscribe() {
    console.warn('useGqlSubscription needs GqlSubscriptionClient');
  }
};

// Context
const GqlSubscriptionContext = createContext(gqlSubscriptionDefaults);

// Hook
export function useGqlSubscription<D = unknown, V extends GqlVariables = GqlVariables>(id: string, req: GqlRequest<D, V>): GqlSubscriptionData<D> {
  // State
  const [data, setData] = useState<D>();
  const [error, setError] = useState<GqlErrorResponse>();

  // Context
  const { message, request, unsubscribe } = useContext(GqlSubscriptionContext);

  // Effects
  useEffect(() => {
    request(id, req);
    return () => unsubscribe(id);
  }, [id, req, request, unsubscribe]);

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