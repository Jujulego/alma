import { createContext } from 'react';

import { GqlRequest } from '../types';
import { GqlSubscriptionServerDataMessage } from './messages';

// Types
export type GqlWsStatus = 'connecting' | 'connected' | 'closed';

export interface GqlSubscriptionState<D = unknown> {
  status?: GqlWsStatus;
  message?: GqlSubscriptionServerDataMessage<D>;

  request(id: string, req: GqlRequest<D>): void;
  unsubscribe(id: string): void;
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
export const GqlSubscriptionContext = createContext(gqlSubscriptionDefaults);
