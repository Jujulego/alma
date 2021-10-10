import { Client } from 'graphql-ws';
import { createContext } from 'react';

// Types
export interface GqlSubscriptionState {
  client?: Client;
}

// Context
export const GqlSubscriptionContext = createContext<GqlSubscriptionState>({});
